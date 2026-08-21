const express = require('express')
const projectPageController = express.Router()

const multer = require('multer')
const fs = require('fs');
const path = require('path');
const Project = require('../models/ProjectModel/projectModel');
const User = require('../models/usersModel/usersModel');
const Notification = require('../models/NotificationModel/notificationModel');
const verifyToken = require('../middlewares/verifyToken.js');
const { emitToUser } = require('../sockets/socket.js');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/Images")},
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const cpUpload = upload.fields([
    { name: 'banner', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
]);

//* Helper - creates a Notification doc AND pushes it over the socket in one go
async function notify({ recipient, sender, type, title, message, project }) {
    if (String(recipient) === String(sender)) return null; //* never notify yourself
    const notif = await Notification.create({ recipient, sender, type, title, message, project });
    const populated = await notif.populate([
        { path: 'sender', select: 'fullname username profilePicture' },
        { path: 'project', select: 'name logoUrl' },
    ]);
    emitToUser(recipient, 'notification:new', populated);
    return populated;
}

//* A role can need more than one person (numberRequired > 1) - recompute isFilled from the
//* actual count of approved members in that role instead of flipping a single boolean.
function recomputeRoleFilled(project, roleName) {
    const role = project.roles.find((r) => r.roleName === roleName);
    if (!role) return;
    const filledCount = project.teamMembers.filter(
        (m) => m.roleName === roleName && m.status === 'approved',
    ).length;
    role.isFilled = filledCount >= role.numberRequired;
}

projectPageController.post('/publishProject', verifyToken, cpUpload, async (req, res) => {
    try {
        //* Parse the form data sent from frontend
        const projectData = JSON.parse(req.body.projectDetails);

        const bannerFile = req.files?.['banner']?.[0] || null;
        const logoFile = req.files?.['logo']?.[0] || null;
        
        //* Handle file paths
        projectData.bannerImageUrl = bannerFile ? `${bannerFile.filename}` : null;
        projectData.logoUrl = logoFile ? `${logoFile.filename}` : null;

        //* Set owner details securely
        const owner = await User.findById(req.user.user_id).select('fullname username profilePicture');
        projectData.userId = req.user.user_id;
        projectData.userName = owner?.fullname || owner?.username || '';
        projectData.userPic = owner?.profilePicture || '';

        //* Clean up invited members data
        if (Array.isArray(projectData.invitedMembers)) {
            projectData.invitedMembers = projectData.invitedMembers.map((m) => ({
                userId: m.userId,
                assignedRole: m.assignedRole,
                username: m.username,
                fullname: m.fullname,
                invitedBy: req.user.user_id,
                status: 'Pending',
            }));
        }

        //* Attempt to create the project
        const newProject = await Project.create(projectData);

        //* Notify invites if any
        if (newProject.invitedMembers && newProject.invitedMembers.length > 0) {
            for (const invite of newProject.invitedMembers) {
                await notify({
                    recipient: invite.userId,
                    sender: req.user.user_id,
                    type: 'invite_received',
                    title: `You've been invited to ${newProject.name}`,
                    message: `Invited to join as ${invite.assignedRole}`,
                    project: newProject._id,
                });
            }
        }

        return res.status(201).json({ 
            success: true, 
            message: 'Project created successfully', 
            projectId: newProject._id 
        });

    } catch (error) {
        console.error("Create Project Error:", error);

        //* Check if it's a Mongoose Validation Error
        if (error.name === 'ValidationError') {
            
            //* Extract error messages for every failed field
            const validationErrors = [];
            Object.keys(error.errors).forEach(field => {
                //* Get the specific error message (e.g., "Path `name` is required.")
                const msg = error.errors[field].message;
                
                //* For now, we send the raw Mongoose err message 
                validationErrors.push(msg);
            });

            return res.status(400).json({
                success: false,
                message: 'Validation Failed',
                errors: validationErrors // Array of strings: ["name is required", "tagline is required"...]
            });
        }

        return res.status(500).json({ 
            success: false, 
            message: 'An unexpected error occurred' 
        });
    }
});

//* Filters 
function toArray(value) {
    if (value === undefined || value === null || value === '') return []
    if (Array.isArray(value)) {
        return value.flatMap((v) => String(v).split(',')).map((v) => v.trim()).filter(Boolean)
    }
    return String(value).split(',').map((v) => v.trim()).filter(Boolean)
}

async function getProjectData(filters = {}, viewerId = null){
    try{
        const and = [{ status: { $ne: 'deleted' } }]

        //* Visibility Logic
        and.push({ 
            $or: [
                { visibility: 'public' }, 
                ...(viewerId ? [{ visibility: 'private', userId: viewerId }] : [])
            ] 
        })

        //* 1. Status Filter
        const statuses = toArray(filters.status)
        if (statuses.length) {
            const recruitmentStatuses = []
            const stages = []
            statuses.forEach((s) => {
                if (s === 'Recruiting') recruitmentStatuses.push('open')
                else if (s === 'Paused') recruitmentStatuses.push('paused')
                else if (s === 'Completed') stages.push('✅ Completed')
                else if (s === 'In Progress') stages.push('💻 Development', '🧪 Testing', '🚀 Deployment')
            })
            const or = []
            if (recruitmentStatuses.length) or.push({ recruitmentStatus: { $in: recruitmentStatuses } })
            if (stages.length) or.push({ stage: { $in: stages } })
            if (or.length) and.push({ $or: or })
        }

        //* 2. Category Filter
        const categories = toArray(filters.category)
        if (categories.length) and.push({ category: { $in: categories } })

        //* 3. ROLE Filter (CASE-INSENSITIVE FIX)
        const roles = toArray(filters.role)
        if (roles.length > 0) {
            //* Convert each role name into a case-insensitive regex object
            const roleRegexConditions = roles.map(roleName => {
                //* Escape special regex characters just in case
                const escaped = roleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                return { 'roles.roleName': new RegExp(escaped, 'i') };
            });
            
            //* Add as an $OR condition: Find projects that have at least one of these roles
            and.push({ $or: roleRegexConditions });
        }

        //* 4. Experience Filter (Handle "No Preference")
        let experienceValue = filters.experience;
        if (typeof experienceValue === 'string') {
            experienceValue = experienceValue.trim();
        }
        
        if (experienceValue && experienceValue !== 'No Preference') {
            const expArray = toArray(experienceValue);
            if (expArray.length) {
                and.push({ 'roles.experience': { $in: expArray } });
            }
        }

        //* 5. Search Filter (Name OR Tagline OR Tags OR Tech Stack Skills)
        if (filters.search && filters.search.trim()) {
            const searchQuery = filters.search.trim();
            const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            
            and.push({ 
                $or: [
                    { name: regex }, 
                    { tagline: regex }, 
                    { tags: regex },
                    { 'roles.skills': regex } 
                ]
            });
        }

        //* console.log("Final Query:", JSON.stringify({ $and: and }, null, 2));
        const res = await Project.find({ $and: and })
            .sort({ createdAt: -1 })
            .populate('userId', 'fullname username profilePicture')
        
        return res
    } catch(err){
        //* console.error("Error in getProjectData:", err);
        return err;
    }
}

projectPageController.get('/projectData', verifyToken, async(req, res)=>{
    const { status, category, role, experience, search } = req.query
    const response = await getProjectData({ status, category, role, experience, search }, req.user.user_id)
    if(response instanceof Error) {
        return res.status(500).json({ error: response.message || "Internal Server Error" })
    }   
    res.json({data : response})
})

//* Projects the current user owns or is an approved member of - powers the Dashboard
projectPageController.get('/mine/list', verifyToken, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const projects = await Project.find({
            status: { $ne: 'deleted' },
            $or: [
                { userId },
                { teamMembers: { $elemMatch: { userId, status: 'approved' } } },
            ],
        })
            .sort({ createdAt: -1 })
            .populate('userId', 'fullname username profilePicture')
            .populate('teamMembers.userId', 'fullname username profilePicture');
        res.json({ data: projects });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//* Pending join-requests / invites addressed to the current user, and applications
//* awaiting the current user's review as an owner - powers notification badges & dashboard widgets
projectPageController.get('/mine/pending', verifyToken, async (req, res) => {
    try {
        const userId = req.user.user_id;

        const ownedProjects = await Project.find({ userId })
            .select('name logoUrl applications')
            .populate('applications.userId', 'fullname username profilePicture');
        const pendingApplications = ownedProjects.flatMap((p) =>
            p.applications
                .filter((a) => a.status === 'pending')
                .map((a) => ({ ...a.toObject(), project: { _id: p._id, name: p.name, logoUrl: p.logoUrl } })),
        );

        const invitesForMe = await Project.find({
            invitedMembers: { $elemMatch: { userId, status: 'Pending' } },
        }).select('name logoUrl invitedMembers');
        const pendingInvites = invitesForMe.flatMap((p) =>
            p.invitedMembers
                .filter((m) => String(m.userId) === String(userId) && m.status === 'Pending')
                .map((m) => ({ ...m.toObject(), project: { _id: p._id, name: p.name, logoUrl: p.logoUrl } })),
        );

        res.json({ pendingApplications, pendingInvites });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//* ── Apply to join a project ──
projectPageController.post('/:projectId/apply', verifyToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.user_id;
        const { roleName, message, resumeUrl, portfolioLink, githubProfile, availability } = req.body;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.recruitmentStatus !== 'open') {
            return res.status(400).json({ message: 'This project is not accepting applications right now' });
        }
        if (String(project.userId) === String(userId)) {
            return res.status(400).json({ message: "You can't apply to your own project" });
        }
        const alreadyMember = project.teamMembers.some((m) => String(m.userId) === String(userId) && m.status === 'approved');
        if (alreadyMember) return res.status(400).json({ message: 'You are already a member of this project' });

        const alreadyApplied = project.applications.some(
            (a) => String(a.userId) === String(userId) && a.status === 'pending',
        );
        if (alreadyApplied) return res.status(400).json({ message: 'You already have a pending application for this project' });

        project.applications.push({
            userId,
            roleName,
            message,
            resumeUrl,
            portfolioLink,
            githubProfile,
            availability,
        });
        await project.save();

        const applicant = await User.findById(userId).select('fullname username');
        await notify({
            recipient: project.userId,
            sender: userId,
            type: 'join_request',
            title: `New join request for ${project.name}`,
            message: `${applicant?.fullname || applicant?.username || 'Someone'} applied for ${roleName}`,
            project: project._id,
        });

        //* Also send the owner a follow request (if not already connected) so they can
        //* accept it and reach the applicant directly via DM while reviewing the application.
        const owner = await User.findById(project.userId);
        const alreadyConnected = owner.followers.some((id) => String(id) === String(userId))
            || owner.following.some((id) => String(id) === String(userId));
        const alreadyRequested = owner.followRequests.some((r) => String(r.userId) === String(userId));
        if (!alreadyConnected && !alreadyRequested) {
            if (!owner.isPrivate) {
                await User.findByIdAndUpdate(project.userId, { $addToSet: { followers: userId } });
                await User.findByIdAndUpdate(userId, { $addToSet: { following: project.userId } });
            } else {
                await User.findByIdAndUpdate(project.userId, { $push: { followRequests: { userId } } });
                await notify({
                    recipient: project.userId,
                    sender: userId,
                    type: 'follow_request',
                    title: `${applicant?.fullname} wants to follow you`,
                    message: `Sent along with their application to ${project.name}`,
                });
            }
        }

        res.status(201).json({ message: 'Application submitted' });
    } catch (err) {
        //* console.log(err);
        res.status(500).json({ message: err.message });
    }
});

//* ── Owner: view applications for a project ──
projectPageController.get('/:projectId/applications', verifyToken, async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId)
            .populate('applications.userId', 'fullname username profilePicture designation');
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (String(project.userId) !== String(req.user.user_id)) {
            return res.status(403).json({ message: 'Only the project owner can view applications' });
        }
        res.json({ applications: project.applications });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//* ── Owner: accept or reject an application ──
projectPageController.patch('/:projectId/applications/:applicationId', verifyToken, async (req, res) => {
    try {
        const { projectId, applicationId } = req.params;
        const { decision } = req.body; //* 'accepted' | 'rejected'
        if (!['accepted', 'rejected'].includes(decision)) {
            return res.status(400).json({ message: 'decision must be accepted or rejected' });
        }

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (String(project.userId) !== String(req.user.user_id)) {
            return res.status(403).json({ message: 'Only the project owner can review applications' });
        }

        const application = project.applications.id(applicationId);
        if (!application) return res.status(404).json({ message: 'Application not found' });

        application.status = decision;
        application.reviewedBy = req.user.user_id;
        application.reviewedAt = new Date();

        if (decision === 'accepted') {
            project.teamMembers.push({
                userId: application.userId,
                roleName: application.roleName,
                status: 'approved',
            });
            recomputeRoleFilled(project, application.roleName);
        }
        await project.save();

        await notify({
            recipient: application.userId,
            sender: req.user.user_id,
            type: decision === 'accepted' ? 'application_accepted' : 'application_rejected',
            title: decision === 'accepted'
                ? `You're in! Accepted into ${project.name}`
                : `Update on your application to ${project.name}`,
            message: decision === 'accepted'
                ? `Your application for ${application.roleName} was accepted.`
                : `Your application for ${application.roleName} was not accepted this time.`,
            project: project._id,
        });

        res.json({ message: `Application ${decision}` });
    } catch (err) {
        //* console.log(err);
        res.status(500).json({ message: err.message });
    }
});

//* ── Owner: invite a user directly to a role ──
projectPageController.post('/:projectId/invite', verifyToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId: inviteeId, roleName } = req.body;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (String(project.userId) !== String(req.user.user_id)) {
            return res.status(403).json({ message: 'Only the project owner can invite members' });
        }
        const alreadyInvited = project.invitedMembers.some(
            (m) => String(m.userId) === String(inviteeId) && m.status === 'Pending',
        );
        if (alreadyInvited) return res.status(400).json({ message: 'User already invited' });

        const invitee = await User.findById(inviteeId).select('fullname username');
        if (!invitee) return res.status(404).json({ message: 'User not found' });

        project.invitedMembers.push({
            userId: inviteeId,
            assignedRole: roleName,
            username: invitee.username,
            fullname: invitee.fullname,
            invitedBy: req.user.user_id,
        });
        await project.save();

        await notify({
            recipient: inviteeId,
            sender: req.user.user_id,
            type: 'invite_received',
            title: `You've been invited to ${project.name}`,
            message: `Invited to join as ${roleName}`,
            project: project._id,
        });

        res.status(201).json({ message: 'Invitation sent' });
    } catch (err) {
        //* console.log(err);
        res.status(500).json({ message: err.message });
    }
});

//* ── Invitee: accept or decline an invite ──
projectPageController.patch('/:projectId/invites/:inviteId', verifyToken, async (req, res) => {
    try {
        const { projectId, inviteId } = req.params;
        const { decision } = req.body; //* 'Accepted' | 'Declined'
        if (!['Accepted', 'Declined'].includes(decision)) {
            return res.status(400).json({ message: 'decision must be Accepted or Declined' });
        }

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const invite = project.invitedMembers.id(inviteId);
        if (!invite) return res.status(404).json({ message: 'Invite not found' });
        if (String(invite.userId) !== String(req.user.user_id)) {
            return res.status(403).json({ message: 'This invite is not addressed to you' });
        }

        invite.status = decision;
        invite.respondedAt = new Date();

        if (decision === 'Accepted') {
            project.teamMembers.push({
                userId: invite.userId,
                roleName: invite.assignedRole,
                status: 'approved',
            });
            recomputeRoleFilled(project, invite.assignedRole);
        }
        await project.save();

        await notify({
            recipient: project.userId,
            sender: req.user.user_id,
            type: decision === 'Accepted' ? 'invite_accepted' : 'invite_declined',
            title: decision === 'Accepted'
                ? `Invite accepted for ${project.name}`
                : `Invite declined for ${project.name}`,
            message: `${invite.fullname || invite.username} ${decision === 'Accepted' ? 'joined' : 'declined to join'} as ${invite.assignedRole}`,
            project: project._id,
        });

        res.json({ message: `Invite ${decision.toLowerCase()}` });
    } catch (err) {
        //* console.log(err);
        res.status(500).json({ message: err.message });
    }
});

//* ── Leave a project (member, "anytime" policy) or remove a member (owner) ──
projectPageController.delete('/:projectId/members/:memberId', verifyToken, async (req, res) => {
    try {
        const { projectId, memberId } = req.params;
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const member = project.teamMembers.id(memberId);
        if (!member) return res.status(404).json({ message: 'Member not found' });

        const isOwner = String(project.userId) === String(req.user.user_id);
        const isSelf = String(member.userId) === String(req.user.user_id);
        if (!isOwner && !isSelf) {
            return res.status(403).json({ message: 'Not authorized to remove this member' });
        }

        //* Self-leaving is gated by the project's leaving policy - owners removing someone else always go through
        if (isSelf && !isOwner && project.leavingPolicy === 'approval') {
            return res.status(400).json({
                message: 'This project requires approval to leave. Please submit a leave request instead.',
                requiresApproval: true,
            });
        }

        member.status = isSelf ? 'left' : 'removed';
        member.leftAt = new Date();
        recomputeRoleFilled(project, member.roleName);
        await project.save();

        await notify({
            recipient: isSelf ? project.userId : member.userId,
            sender: req.user.user_id,
            type: isSelf ? 'member_left' : 'member_removed',
            title: isSelf ? `A member left ${project.name}` : `You were removed from ${project.name}`,
            message: isSelf ? `${member.roleName} left the team.` : `You were removed from the ${member.roleName} role.`,
            project: project._id,
        });

        res.json({ message: isSelf ? 'You left the project' : 'Member removed' });
    } catch (err) {
        //* console.log(err);
        res.status(500).json({ message: err.message });
    }
});

//* ── Member: submit a leave request (Subject + Description) when the project requires approval ──
projectPageController.post('/:projectId/leave-request', verifyToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { subject, description } = req.body;
        if (!subject || !subject.trim()) return res.status(400).json({ message: 'Subject is required' });

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const member = project.teamMembers.find(
            (m) => String(m.userId) === String(req.user.user_id) && m.status === 'approved',
        );
        if (!member) return res.status(404).json({ message: "You're not an active member of this project" });

        if (member.leaveRequestStatus === 'pending') {
            return res.status(400).json({ message: 'You already have a pending leave request' });
        }

        member.leaveRequestSubject = subject.trim();
        member.leavingReason = description || '';
        member.leaveRequestStatus = 'pending';
        member.leaveRequestedAt = new Date();
        await project.save();

        const requester = await User.findById(req.user.user_id).select('fullname username');
        await notify({
            recipient: project.userId,
            sender: req.user.user_id,
            type: 'member_left',
            title: `Leave request for ${project.name}`,
            message: `${requester?.fullname || requester?.username} requested to leave: "${subject.trim()}"`,
            project: project._id,
        });

        res.status(201).json({ message: 'Leave request submitted' });
    } catch (err) {
        //* console.log(err);
        res.status(500).json({ message: err.message });
    }
});

//* ── Owner: view pending leave requests ──
projectPageController.get('/:projectId/leave-requests', verifyToken, async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId)
            .populate('teamMembers.userId', 'fullname username profilePicture');
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (String(project.userId) !== String(req.user.user_id)) {
            return res.status(403).json({ message: 'Only the project owner can view leave requests' });
        }
        const pending = project.teamMembers.filter((m) => m.leaveRequestStatus === 'pending');
        res.json({ leaveRequests: pending });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//* ── Owner: approve or reject a leave request ──
projectPageController.patch('/:projectId/leave-requests/:memberId', verifyToken, async (req, res) => {
    try {
        const { projectId, memberId } = req.params;
        const { decision } = req.body; //* 'approve' | 'reject'
        if (!['approve', 'reject'].includes(decision)) {
            return res.status(400).json({ message: 'decision must be approve or reject' });
        }

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (String(project.userId) !== String(req.user.user_id)) {
            return res.status(403).json({ message: 'Only the project owner can decide on leave requests' });
        }

        const member = project.teamMembers.id(memberId);
        if (!member || member.leaveRequestStatus !== 'pending') {
            return res.status(404).json({ message: 'No pending leave request found' });
        }

        if (decision === 'approve') {
            member.status = 'left';
            member.leftAt = new Date();
            member.leaveApprovedAt = new Date();
            member.leaveApprovedBy = req.user.user_id;
            member.leaveRequestStatus = 'approved';
            recomputeRoleFilled(project, member.roleName);
        } else {
            member.leaveRequestStatus = 'rejected';
        }
        await project.save();

        await notify({
            recipient: member.userId,
            sender: req.user.user_id,
            type: decision === 'approve' ? 'member_left' : 'project_update',
            title: decision === 'approve'
                ? `Your leave request for ${project.name} was approved`
                : `Your leave request for ${project.name} was declined`,
            message: decision === 'approve'
                ? "You've left the project."
                : 'The project owner would like you to stay - reach out to them for details.',
            project: project._id,
        });

        res.json({ message: `Leave request ${decision}d` });
    } catch (err) {
        //* console.log(err);
        res.status(500).json({ message: err.message });
    }
});

//* ── Toggle a project in the current user's wishlist ──
projectPageController.post('/:projectId/wishlist', verifyToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId).select('_id');
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const user = await User.findById(req.user.user_id).select('wishlist');
        const alreadyWishlisted = user.wishlist.some((id) => String(id) === String(projectId));

        if (alreadyWishlisted) {
            await User.findByIdAndUpdate(req.user.user_id, { $pull: { wishlist: projectId } });
        } else {
            await User.findByIdAndUpdate(req.user.user_id, { $addToSet: { wishlist: projectId } });
        }

        const updated = await User.findById(req.user.user_id).select('wishlist');
        res.json({ wishlisted: !alreadyWishlisted, count: updated.wishlist.length });
    } catch (err) {
        //* console.log(err);
        res.status(500).json({ message: err.message });
    }
});

//* ── Owner: edit project details ──.
projectPageController.patch('/:projectId', verifyToken, cpUpload, async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (String(project.userId) !== String(req.user.user_id)) {
            return res.status(403).json({ message: 'Only the project owner can edit this project' });
        }

        const body = req.body.projectDetails ? JSON.parse(req.body.projectDetails) : req.body;

        const simpleEditable = [
            'description', 'visibility', 'recruitmentStatus', 'maxTeamSize',
            'membersCanInvite', 'leavingPolicy', 'communication', 'communicationLink',
            'completionDate',
        ];
        simpleEditable.forEach((field) => {
            if (body[field] !== undefined && body[field] !== '') project[field] = body[field];
        });

        // --- LOGO & BANNER HANDLING ---
        const oldLogo = project.logoUrl;
        const oldBanner = project.bannerImageUrl;

        const bannerFile = req.files?.['banner']?.[0] || null;
        const logoFile = req.files?.['logo']?.[0] || null;

        if (bannerFile) project.bannerImageUrl = bannerFile.filename;
        if (logoFile) project.logoUrl = logoFile.filename;
        
        // --- ROLES LOGIC ---
        if (Array.isArray(body.roles)) {
            const incomingIds = body.roles.filter((r) => r._id).map((r) => String(r._id));

            project.roles = project.roles.filter((role) => {
                const stillPresent = incomingIds.includes(String(role._id));
                if (stillPresent) return true;
                const hasActiveMember = project.teamMembers.some(
                    (m) => m.roleName === role.roleName && m.status === 'approved',
                );
                return hasActiveMember;
            });

            body.roles.forEach((incoming) => {
                if (incoming._id) {
                    const existing = project.roles.id(incoming._id);
                    if (existing) {
                        ['roleName', 'numberRequired', 'responsibilities', 'skills', 'experience', 'commitment'].forEach((f) => {
                            if (incoming[f] !== undefined) existing[f] = incoming[f];
                        });
                    }
                } else if (incoming.roleName) {
                    project.roles.push({
                        roleName: incoming.roleName,
                        numberRequired: incoming.numberRequired || 1,
                        responsibilities: incoming.responsibilities || '',
                        skills: incoming.skills || [],
                        experience: incoming.experience || 'No Preference',
                        commitment: incoming.commitment || 'Flexible',
                    });
                }
            });

            project.roles.forEach((role) => {
                const filledCount = project.teamMembers.filter(
                    (m) => m.roleName === role.roleName && m.status === 'approved',
                ).length;
                role.isFilled = filledCount >= role.numberRequired;
            });
        }

        await project.save();
        await project.populate('userId', 'fullname username profilePicture');
        await project.populate('teamMembers.userId', 'fullname username profilePicture');

        //* --- DELETE OLD FILES AFTER SUCCESSFUL SAVE ---
        const deleteFile = (filename) => {
            if (!filename) return;
            const filePath = path.join(__dirname, '../uploads/Images', filename);
            fs.unlink(filePath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error(`Failed to delete old file ${filename}:`, err);
                }
            });
        };

        if (bannerFile && oldBanner) deleteFile(oldBanner);
        if (logoFile && oldLogo) deleteFile(oldLogo);

        res.json({ message: 'Project updated', project });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

//* Keep this LAST among GET routes - ':projectId' matches any single path segment
projectPageController.get('/:projectId', verifyToken, async(req, res)=>{
    try{
        const data = await Project.find({_id : req.params.projectId})
            .populate('userId', 'fullname username profilePicture')
            .populate('teamMembers.userId', 'fullname username profilePicture')
            .populate('applications.userId', 'fullname username profilePicture')

        const project = data[0]
        if (project && project.visibility === 'private' && String(project.userId?._id) !== String(req.user.user_id)) {
            return res.status(403).json({ message: 'This project is private' })
        }

        res.json({response : data})
    }catch(err){
        console.log(err)
        res.status(500).json({ message: err.message })
    }
})

module.exports = projectPageController
