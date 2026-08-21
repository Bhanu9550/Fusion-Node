const express = require('express')
const userController = express.Router()

const multer = require('multer')
const fs = require('fs')
const path = require('path')
const User = require('../models/usersModel/usersModel.js')
const Project = require('../models/ProjectModel/projectModel.js')
const Notification = require('../models/NotificationModel/notificationModel.js')
const verifyToken = require('../middlewares/verifyToken.js')
const { emitToUser } = require('../sockets/socket.js')

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/Images'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    },
})
const upload = multer({ storage })

const PUBLIC_FIELDS = '-password -hashedPass -refreshToken -__v -email -phoneNumber -dateOfBirth'

async function notify({ recipient, sender, type, title, message }) {
    if (String(recipient) === String(sender)) return null
    const notif = await Notification.create({ recipient, sender, type, title, message })
    const populated = await notif.populate('sender', 'fullname username profilePicture')
    emitToUser(recipient, 'notification:new', populated)
    return populated
}

//* ── Get the current user's own full profile (used to prefill the edit form) ──
userController.get('/me/edit', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.user_id).select('-password -hashedPass -refreshToken -__v')
        res.json({ user })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//* ── Update the current user's own profile ──
userController.patch('/me', verifyToken, upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverPicture', maxCount: 1 },
]), async (req, res) => {
    try {
        const editable = [
            'fullname', 'bio', 'designation', 'company', 'location', 'website',
            'gender', 'github', 'linkedin', 'portfolio', 'isPrivate',
            'emailNotification', 'pushNotification',
        ];
        
        const updates = {};
        const body = req.body || {};
        
        editable.forEach((field) => {
            if (body[field] !== undefined) updates[field] = body[field];
        });

        if (updates.isPrivate !== undefined) updates.isPrivate = updates.isPrivate === 'true' || updates.isPrivate === true;
        if (updates.emailNotification !== undefined) updates.emailNotification = Number(updates.emailNotification);
        if (updates.pushNotification !== undefined) updates.pushNotification = Number(updates.pushNotification);

        //* 2. Fetch current user data to get old filenames BEFORE updating
        const currentUser = await User.findById(req.user.user_id).select('profilePicture coverPicture');
        if (!currentUser) return res.status(404).json({ message: 'User not found' });

        const oldProfilePic = currentUser.profilePicture;
        const oldCoverPic = currentUser.coverPicture;

        //* 3. Handle new uploads
        const profilePicFile = req.files?.['profilePicture']?.[0];
        const coverPicFile = req.files?.['coverPicture']?.[0];

        if (profilePicFile) updates.profilePicture = profilePicFile.filename;
        if (coverPicFile) updates.coverPicture = coverPicFile.filename;

        //* 4. Save to Database
        const user = await User.findByIdAndUpdate(
            req.user.user_id, 
            updates, 
            { returnDocument: "after" }
        ).select('-password -hashedPass -refreshToken -__v');

        //* 5. Delete Old Files AFTER successful DB update
        // Helper function for cleanup
        const deleteFile = (filename) => {
            if (!filename) return;
          
            const filePath = path.join(__dirname, '../uploads/Images', filename);
            
            fs.unlink(filePath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error(`Failed to delete old file ${filename}:`, err);
                } else {
                    //* Optional: Log success during development
                    //* console.log(`Deleted old file: ${filename}`);
                }
            });
        };

        if (profilePicFile && oldProfilePic) {
            deleteFile(oldProfilePic);
        }
        
        if (coverPicFile && oldCoverPic) {
            deleteFile(oldCoverPic);
        }

        res.json({ user });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});


//* ── Current user's wishlist (saved projects) ──
userController.get('/me/wishlist', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.user_id)
            .select('wishlist')
            .populate({
                path: 'wishlist',
                populate: { path: 'userId', select: 'fullname username profilePicture' },
            })
        res.json({ wishlist: user.wishlist, count: user.wishlist.length })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//* ── Public profile by username ──
userController.get('/:username', verifyToken, async (req, res) => {
    try {
        const profileUser = await User.findOne({ username: req.params.username }).select(PUBLIC_FIELDS)
        if (!profileUser) return res.status(404).json({ message: 'User not found' })

        const viewerId = req.user.user_id
        const isSelf = String(profileUser._id) === String(viewerId)
        const isFollowing = profileUser.followers.some((id) => String(id) === String(viewerId))
        const isFollowedBy = profileUser.following.some((id) => String(id) === String(viewerId))
        const hasSentRequest = profileUser.followRequests.some((r) => String(r.userId) === String(viewerId))
        const canMessage = isSelf || isFollowing || isFollowedBy //* "following or follower"

        //* Private profiles only reveal full details to connections
        const canViewFullProfile = isSelf || !profileUser.isPrivate || isFollowing

        const [createdProjects, joinedProjects] = await Promise.all([
            Project.find({ userId: profileUser._id, status: { $ne: 'deleted' } })
                .select('name logoUrl stage recruitmentStatus')
                .sort({ createdAt: -1 }),
            Project.find({
                teamMembers: { $elemMatch: { userId: profileUser._id, status: 'approved' } },
                status: { $ne: 'deleted' },
            }).select('name logoUrl stage recruitmentStatus').sort({ createdAt: -1 }),
        ])

        res.json({
            user: {
                _id: profileUser._id,
                fullname: profileUser.fullname,
                username: profileUser.username,
                profilePicture: profileUser.profilePicture,
                coverPicture: profileUser.coverPicture,
                bio: profileUser.bio,
                designation: profileUser.designation,
                company: profileUser.company,
                location: profileUser.location,
                website: profileUser.website,
                github: profileUser.github,
                linkedin: profileUser.linkedin,
                portfolio: profileUser.portfolio,
                isPrivate: profileUser.isPrivate,
                followersCount: profileUser.followers.length,
                followingCount: profileUser.following.length,
                createdAt: profileUser.createdAt,
            },
            isSelf,
            isFollowing,
            isFollowedBy,
            hasSentRequest,
            canMessage,
            canViewFullProfile,
            createdProjects: canViewFullProfile ? createdProjects : [],
            joinedProjects: canViewFullProfile ? joinedProjects : [],
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//* ── Follow / send follow request ──
userController.post('/:userId/follow', verifyToken, async (req, res) => {
    try {
        const targetId = req.params.userId
        const viewerId = req.user.user_id
        if (targetId === viewerId) return res.status(400).json({ message: "You can't follow yourself" })

        const target = await User.findById(targetId)
        if (!target) return res.status(404).json({ message: 'User not found' })

        const alreadyFollowing = target.followers.some((id) => String(id) === String(viewerId))
        if (alreadyFollowing) return res.status(400).json({ message: 'Already following' })

        const viewer = await User.findById(viewerId).select('fullname username')

        if (!target.isPrivate) {
            //* Public profile - follow instantly
            await User.findByIdAndUpdate(targetId, { $addToSet: { followers: viewerId } })
            await User.findByIdAndUpdate(viewerId, { $addToSet: { following: targetId } })
            await notify({
                recipient: targetId,
                sender: viewerId,
                type: 'follow_accepted',
                title: `${viewer.fullname} started following you`,
                message: `@${viewer.username} is now following you`,
            })
            return res.json({ status: 'following' })
        }

        //* Private profile - send a follow request instead
        const alreadyRequested = target.followRequests.some((r) => String(r.userId) === String(viewerId))
        if (alreadyRequested) return res.status(400).json({ message: 'Follow request already sent' })

        await User.findByIdAndUpdate(targetId, { $push: { followRequests: { userId: viewerId } } })
        await notify({
            recipient: targetId,
            sender: viewerId,
            type: 'follow_request',
            title: `${viewer.fullname} wants to follow you`,
            message: `@${viewer.username} sent you a follow request`,
        })
        res.json({ status: 'requested' })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message })
    }
})

//* ── Unfollow ──
userController.post('/:userId/unfollow', verifyToken, async (req, res) => {
    try {
        const targetId = req.params.userId
        const viewerId = req.user.user_id
        await User.findByIdAndUpdate(targetId, { $pull: { followers: viewerId } })
        await User.findByIdAndUpdate(viewerId, { $pull: { following: targetId } })
        res.json({ status: 'not_following' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//* ── List current user's pending incoming follow requests ──
userController.get('/me/follow-requests', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.user_id)
            .select('followRequests')
            .populate('followRequests.userId', 'fullname username profilePicture designation')
        res.json({ followRequests: user.followRequests })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//* ── Accept or ignore a follow request ──
userController.post('/me/follow-requests/:requesterId/:decision', verifyToken, async (req, res) => {
    try {
        const { requesterId, decision } = req.params
        if (!['accept', 'ignore'].includes(decision)) {
            return res.status(400).json({ message: 'decision must be accept or ignore' })
        }
        const viewerId = req.user.user_id

        const me = await User.findById(viewerId)
        const hadRequest = me.followRequests.some((r) => String(r.userId) === String(requesterId))
        if (!hadRequest) return res.status(404).json({ message: 'No pending request from this user' })

        await User.findByIdAndUpdate(viewerId, { $pull: { followRequests: { userId: requesterId } } })

        if (decision === 'accept') {
            await User.findByIdAndUpdate(viewerId, { $addToSet: { followers: requesterId } })
            await User.findByIdAndUpdate(requesterId, { $addToSet: { following: viewerId } })
            await notify({
                recipient: requesterId,
                sender: viewerId,
                type: 'follow_accepted',
                title: `${me.fullname} accepted your follow request`,
                message: `You are now following @${me.username}`,
            })
        }

        res.json({ message: `Request ${decision}d` })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message })
    }
})

//* ── Followers / following lists ──
userController.get('/:username/followers', verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .populate('followers', 'fullname username profilePicture designation')
        if (!user) return res.status(404).json({ message: 'User not found' })

        const viewerId = req.user.user_id
        const isSelf = String(user._id) === String(viewerId)
        if (!isSelf) {
            const isFollowing = user.followers.some((u) => String(u._id) === String(viewerId))
            const isFollowedBy = user.following.some((id) => String(id) === String(viewerId))
            //* Mutual connection required - one-way follows can't see each other's lists
            if (!(isFollowing && isFollowedBy)) {
                return res.status(403).json({ message: 'You can only see this once you both follow each other' })
            }
        }

        res.json({ followers: user.followers })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

userController.get('/:username/following', verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .populate('following', 'fullname username profilePicture designation')
        if (!user) return res.status(404).json({ message: 'User not found' })

        const viewerId = req.user.user_id
        const isSelf = String(user._id) === String(viewerId)
        if (!isSelf) {
            const isFollowing = user.followers.some((id) => String(id) === String(viewerId))
            const isFollowedBy = user.following.some((u) => String(u._id) === String(viewerId))
            //* Mutual connection required - one-way follows can't see each other's lists
            if (!(isFollowing && isFollowedBy)) {
                return res.status(403).json({ message: 'You can only see this once you both follow each other' })
            }
        }

        res.json({ following: user.following })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

module.exports = userController
