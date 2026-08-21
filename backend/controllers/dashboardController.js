const express = require('express')
const dashboardController = express.Router()
const User = require('../models/usersModel/usersModel.js')
const Project = require('../models/ProjectModel/projectModel.js')
const verifyToken = require('../middlewares/verifyToken.js')

dashboardController.get('/searchUser', verifyToken, async(req, res)=>{
    const {search, exclude} = req.query
    if(search){
        const excludeIds = [req.user.user_id, ...(exclude ? String(exclude).split(',') : [])]
        const users = await User.find({
        username: {
            $regex: `^${search}`,
            $options: "i"
        },
        _id: { $nin: excludeIds },
        }).select("-password -hashedPass -__v").limit(15);
        return res.json(users)
    }
    return res.json({ok: "ok"})

    })

//* Aggregated numbers for the dashboard's "Project Status" donut chart + "Your Projects" table
dashboardController.get('/stats', verifyToken, async (req, res) => {
    try {
        const userId = req.user.user_id

        const projects = await Project.find({
            status: { $ne: 'deleted' },
            $or: [
                { userId },
                { teamMembers: { $elemMatch: { userId, status: 'approved' } } },
            ],
        })
            .sort({ createdAt: -1 })
            .populate('userId', 'fullname username profilePicture')
            .populate('teamMembers.userId', 'fullname username profilePicture')

        //* Bucket every project into one dashboard-facing status
        const stageToStatus = (project) => {
            if (project.stage === '✅ Completed') return 'Completed'
            if (project.recruitmentStatus === 'paused') return 'Paused'
            if (project.recruitmentStatus === 'open') return 'Recruiting'
            if (project.stage === '💡 Idea' || project.stage === '📋 Planning') return 'Idea Stage'
            return 'In Progress'
        }

        const counts = { 'Idea Stage': 0, Recruiting: 0, 'In Progress': 0, Completed: 0, Paused: 0 }
        const projectSummaries = projects.map((p) => {
            const status = stageToStatus(p)
            counts[status] = (counts[status] || 0) + 1

            const approvedMembers = p.teamMembers.filter((m) => m.status === 'approved')
            const totalRoles = p.roles.reduce((sum, r) => sum + r.numberRequired, 0) || 1
            const filledRoles = p.roles.filter((r) => r.isFilled).length
            const progress = status === 'Completed'
                ? 100
                : Math.min(95, Math.round((filledRoles / totalRoles) * 100) + (status === 'In Progress' ? 20 : 0))

            return {
                _id: p._id,
                name: p.name,
                logoUrl: p.logoUrl,
                status,
                progress,
                members: approvedMembers.slice(0, 4).map((m) => ({
                    _id: m.userId?._id,
                    fullname: m.userId?.fullname,
                    profilePicture: m.userId?.profilePicture,
                })),
                extraMembersCount: Math.max(0, approvedMembers.length - 4),
            }
        })

        const total = projects.length || 1
        const breakdown = Object.entries(counts).map(([name, count]) => ({
            name,
            count,
            percent: Math.round((count / total) * 1000) / 10,
        }))

        res.json({
            total: projects.length,
            breakdown,
            projects: projectSummaries,
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

module.exports = dashboardController
