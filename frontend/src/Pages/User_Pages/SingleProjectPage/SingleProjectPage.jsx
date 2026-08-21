import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SideNavbar from '../../../Components/SideNavbar/SideNavbar'
import TopNavbar from '../../../Components/TopNavbar/TopNavbar'
import BottomNavbar from '../../../Components/BottomNavbar/BottomNavbar'
import AuthContext from '../../../Context/AuthContext'
import api from '../../../Configure/axiosConfigure'
import JoinRequestModal from '../../../Components/JoinRequestModal/JoinRequestModel'
import UserSearchInvite from '../../../Components/UserSearchInvite/UserSearchInvite'
import LeaveRequestModal from '../../../Components/LeaveRequestModal/LeaveRequestModal'
import ConfirmModal from '../../../Components/ConfirmModal/ConfirmModal'
import './SingleProjectPage.css'

// ── Skeleton ──
const SingleProjectSkeleton = () => (
    <div className="sp-skeleton">
        <div className="sp-sk-banner" />
        <div className="sp-sk-container">
            <div className="sp-sk-header">
                <div className="sp-sk-shimmer sp-sk-title" />
                <div className="sp-sk-shimmer sp-sk-tagline" />
                <div className="sp-sk-badges">
                    <div className="sp-sk-shimmer sp-sk-badge" />
                    <div className="sp-sk-shimmer sp-sk-badge" />
                    <div className="sp-sk-shimmer sp-sk-badge" />
                </div>
            </div>
            <div className="sp-sk-body">
                <div className="sp-sk-main">
                    <div className="sp-sk-shimmer sp-sk-block" />
                    <div className="sp-sk-shimmer sp-sk-block sp-sk-block-sm" />
                </div>
                <div className="sp-sk-side">
                    <div className="sp-sk-shimmer sp-sk-block" />
                    <div className="sp-sk-shimmer sp-sk-block sp-sk-block-sm" />
                </div>
            </div>
        </div>
    </div>
)

// ── Status color map ──
const stageColorMap = {
    '💡 Idea': '#f59e0b',
    '📋 Planning': '#3b82f6',
    '💻 Development': '#a855f7',
    '🧪 Testing': '#14b8a6',
    '🚀 Deployment': '#22c55e',
    '✅ Completed': '#22c55e',
}

const recruitmentColorMap = {
    open: { color: 'rgba(78,195,20,1)', bg: 'rgba(78,195,20,0.08)', border: 'rgba(78,195,20,0.25)' },
    closed: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
    paused: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
}

// ── Member Role Badge ──
const MemberRoleBadge = ({ role }) => (
    <span className="sp-member-role-badge">{role}</span>
)

const SingleProject = () => {

    const { projectId } = useParams()
    const navigate = useNavigate()
    const { User } = useContext(AuthContext)

    const [project, setProject] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showApplyModal, setShowApplyModal] = useState(false)
    const [applications, setApplications] = useState([])
    const [leaveRequests, setLeaveRequests] = useState([])
    const [inviteUser, setInviteUser] = useState(null)
    const [inviteRole, setInviteRole] = useState('')
    const [actionMessage, setActionMessage] = useState('')
    const [showLeaveRequestModal, setShowLeaveRequestModal] = useState(false)
    const [confirmAction, setConfirmAction] = useState(null) //* { title, message, danger, onConfirm }

    // ── Fetch project ──
    const fetchProject = async () => {
        setIsLoading(true)
        try {
            const res = await api.get(`/projects/${projectId}`)
            setProject(res.data.response?.[0] || res.data.data)
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProject()
    }, [projectId])

    // ── Check if current user is owner ──
    const isOwner = project?.userId?._id === User?._id

    // ── Owner: load pending applications ──
    useEffect(() => {
        if (!isOwner || !project) return
        api.get(`/projects/${projectId}/applications`)
            .then(res => setApplications((res.data.applications || []).filter(a => a.status === 'pending')))
            .catch(err => console.error(err))
        api.get(`/projects/${projectId}/leave-requests`)
            .then(res => setLeaveRequests(res.data.leaveRequests || []))
            .catch(err => console.error(err))
    }, [isOwner, project, projectId])

    async function handleApplicationDecision(applicationId, decision) {
        try {
            await api.patch(`/projects/${projectId}/applications/${applicationId}`, { decision })
            setApplications(prev => prev.filter(a => a._id !== applicationId))
            setActionMessage(decision === 'accepted' ? 'Applicant accepted into the team' : 'Application rejected')
            fetchProject()
        } catch (err) {
            setActionMessage(err.response?.data?.message || 'Something went wrong')
        }
    }

    async function handleInvite() {
        if (!inviteUser || !inviteRole) return
        try {
            await api.post(`/projects/${projectId}/invite`, {
                userId: inviteUser._id,
                roleName: inviteRole,
            })
            setActionMessage(`Invite sent to @${inviteUser.username}`)
            setInviteUser(null)
            setInviteRole('')
            fetchProject()
        } catch (err) {
            setActionMessage(err.response?.data?.message || 'Something went wrong')
        }
    }

    async function handleLeaveOrRemove(memberId) {
        try {
            await api.delete(`/projects/${projectId}/members/${memberId}`)
            fetchProject()
        } catch (err) {
            if (err.response?.data?.requiresApproval) {
                setShowLeaveRequestModal(true)
                return
            }
            setActionMessage(err.response?.data?.message || 'Something went wrong')
        }
    }

    function handleLeaveClick(memberId) {
        if (project.leavingPolicy === 'approval') {
            setShowLeaveRequestModal(true)
            return
        }
        setConfirmAction({
            title: 'Leave this project?',
            message: 'You can be re-invited later, but you will lose access to the team chat and your role.',
            confirmLabel: 'Leave Project',
            danger: true,
            onConfirm: () => {
                handleLeaveOrRemove(memberId)
                setConfirmAction(null)
            },
        })
    }

    function handleRemoveClick(memberId) {
        setConfirmAction({
            title: 'Remove this member?',
            message: 'They will lose access to the team chat and their role will reopen.',
            confirmLabel: 'Remove',
            danger: true,
            onConfirm: () => {
                handleLeaveOrRemove(memberId)
                setConfirmAction(null)
            },
        })
    }

    async function handleLeaveRequestDecision(memberId, decision) {
        try {
            await api.patch(`/projects/${projectId}/leave-requests/${memberId}`, { decision })
            setLeaveRequests(prev => prev.filter(r => r._id !== memberId))
            setActionMessage(decision === 'approve' ? 'Leave request approved' : 'Leave request declined')
            fetchProject()
        } catch (err) {
            setActionMessage(err.response?.data?.message || 'Something went wrong')
        }
    }

    // ── Check if current user is member ──
    const isMember = project?.teamMembers?.some(
        m => m.userId?._id === User?._id && m.status === 'approved'
    )
    const myMembership = project?.teamMembers?.find(
        m => m.userId?._id === User?._id && m.status === 'approved'
    )

    const stageColor = stageColorMap[project?.stage] || 'var(--main-green)'
    const recruitmentStyle = recruitmentColorMap[project?.recruitmentStatus] || recruitmentColorMap.open

    return (
        <section className="page-wrapper">

            <SideNavbar />

            <div className="right-dashboard">
                <TopNavbar />

                {isLoading ? <SingleProjectSkeleton /> : (

                    project ? (
                        <div className="sp-page">

                            {/* ── Banner ── */}
                            <div className="sp-banner">
                                {project.bannerImageUrl ? (
                                    <img
                                        src={ import.meta.env.VITE_Images_URL + '/' + project.bannerImageUrl}
                                        alt="banner"
                                        className="sp-banner-img"
                                    />
                                ) : (
                                    <div className="sp-banner-placeholder" />
                                )}

                                {/* Logo */}
                                <div className="sp-logo-wrapper">
                                    {project.logoUrl ? (
                                        <img
                                            src={ import.meta.env.VITE_Images_URL + '/' + project.logoUrl }
                                            alt="logo"
                                            className="sp-logo-img"
                                        />
                                    ) : (
                                        <div className="sp-logo-fallback">
                                            {project.name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Main Container ── */}
                            <div className="sp-container">

                                {/* ── Back Button ── */}
                                <button
                                    className="sp-back-btn"
                                    onClick={() => navigate('/projects')}
                                >
                                    ← Back to Projects
                                </button>

                                {/* ── Header ── */}
                                <div className="sp-header">
                                    <div className="sp-header-left">

                                        {/* Badges */}
                                        <div className="sp-badges">
                                            <span
                                                className="sp-badge"
                                                style={{
                                                    color: stageColor,
                                                    borderColor: stageColor,
                                                    backgroundColor: `${stageColor}14`,
                                                }}
                                            >
                                                {project.stage}
                                            </span>
                                            <span className="sp-badge sp-badge-visibility">
                                                {project.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                                            </span>
                                            <span
                                                className="sp-badge"
                                                style={{
                                                    color: recruitmentStyle.color,
                                                    borderColor: recruitmentStyle.border,
                                                    backgroundColor: recruitmentStyle.bg,
                                                }}
                                            >
                                                {project.recruitmentStatus?.charAt(0).toUpperCase() + project.recruitmentStatus?.slice(1)}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h1 className="sp-project-name">
                                            {project.name}
                                        </h1>
                                        <p className="sp-tagline">{project.tagline}</p>

                                        {/* Owner info */}
                                        <div className="sp-owner-row">
                                            <div className="sp-owner-avatar">
                                                {project.userId?.username?.[0]?.toUpperCase() || 'O'}
                                            </div>
                                            <span className="sp-owner-name">
                                                {project.userId?.username || 'Owner'}
                                            </span>
                                            <span className="sp-owner-dot">•</span>
                                            <span className="sp-posted-ago">
                                                {project.daysAgo === 0
                                                    ? 'Today'
                                                    : `${project.daysAgo} days ago`
                                                }
                                            </span>
                                        </div>

                                    </div>

                                    {/* Header Actions */}
                                    <div className="sp-header-actions">
                                        <button className="sp-btn-like">
                                            ♡ Like
                                        </button>

                                        {isOwner && (
                                            <button
                                                className="sp-btn-edit-project"
                                                onClick={() => navigate(`/projects/${projectId}/edit`)}
                                            >
                                                ✎ Edit Project
                                            </button>
                                        )}

                                        {/* Member sees Discussion, others see Apply */}
                                        {isMember || isOwner ? (
                                            <button
                                                className="sp-btn-discussion"
                                                onClick={() => navigate(`/messages/${projectId}`)}
                                            >
                                                💬 Project Discussion
                                            </button>
                                        ) : (
                                            <button
                                                className="sp-btn-apply"
                                                onClick={() => setShowApplyModal(true)}
                                            >
                                                Apply to Join
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* ── Body Grid ── */}
                                <div className="sp-body">

                                    {/* ── LEFT MAIN ── */}
                                    <div className="sp-main">

                                        {/* About */}
                                        <div className="sp-section">
                                            <h3 className="sp-section-title">About This Project</h3>
                                            <p className="sp-description">
                                                {project.description || 'No description provided.'}
                                            </p>
                                        </div>

                                        {/* Open Roles */}
                                        {project.roles?.length > 0 && (
                                            <div className="sp-section">
                                                <h3 className="sp-section-title">Open Roles</h3>
                                                <div className="sp-roles-list">
                                                    {project.roles.map(role => (
                                                        <div className="sp-role-card" key={role._id}>
                                                            <div className="sp-role-header">
                                                                <span className="sp-role-name">
                                                                    {role.roleName}
                                                                </span>
                                                                <span className="sp-role-slots">
                                                                    {role.numberRequired} slot{role.numberRequired > 1 ? 's' : ''}
                                                                </span>
                                                            </div>
                                                            {role.responsibilities && (
                                                                <p className="sp-role-responsibilities">
                                                                    {role.responsibilities}
                                                                </p>
                                                            )}
                                                            {role.skills?.length > 0 && (
                                                                <div className="sp-skills-row">
                                                                    {role.skills.map(skill => (
                                                                        <span className="sp-skill-tag" key={skill}>
                                                                            {skill}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <div className="sp-role-meta">
                                                                <span>🎯 {role.experience}</span>
                                                                <span>⏱️ {role.commitment}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Team Members — only for members/owner */}
                                        {(isMember || isOwner) && project.teamMembers?.length > 0 && (
                                            <div className="sp-section">
                                                <h3 className="sp-section-title">
                                                    👥 Team Members ({project.teamMembers.filter(m => m.status === 'approved').length})
                                                </h3>
                                                <div className="sp-members-card">
                                                    {project.teamMembers
                                                        .filter(m => m.status === 'approved')
                                                        .map((member, index, arr) => (
                                                            <div
                                                                className={`sp-member-row ${index !== arr.length - 1 ? 'sp-member-row-border' : ''}`}
                                                                key={member._id}
                                                            >
                                                                {/* Avatar */}
                                                                <div
                                                                    className="sp-member-avatar sp-member-clickable"
                                                                    onClick={() => member.userId?.username && navigate(`/profile/${member.userId.username}`)}
                                                                >
                                                                    {member.userId?.profilePic ? (
                                                                        <img
                                                                            src={member.userId.profilePic}
                                                                            alt={member.userId.username}
                                                                            className="sp-member-avatar-img"
                                                                        />
                                                                    ) : (
                                                                        <span>
                                                                            {member.userId?.username?.[0]?.toUpperCase() || '?'}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Info */}
                                                                <div
                                                                    className="sp-member-info sp-member-clickable"
                                                                    onClick={() => member.userId?.username && navigate(`/profile/${member.userId.username}`)}
                                                                >
                                                                    <span className="sp-member-name">
                                                                        {member.userId?.fullname || member.userId?.username || 'Member'}
                                                                    </span>
                                                                    <span className="sp-member-username">
                                                                        @{member.userId?.username}
                                                                    </span>
                                                                </div>

                                                                {/* Role */}
                                                                <div className="sp-member-right">
                                                                    <MemberRoleBadge role={member.roleName} />
                                                                    {member.userId?._id === project.userId?._id && (
                                                                        <span className="sp-member-owner-badge">
                                                                            Owner
                                                                        </span>
                                                                    )}
                                                                    {isOwner && member.userId?._id !== project.userId?._id && (
                                                                        <button
                                                                            className="sp-member-remove-btn"
                                                                            onClick={() => handleRemoveClick(member._id)}
                                                                            title="Remove from team"
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    )}
                                                                </div>

                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        )}

                                    </div>

                                    {/* ── RIGHT SIDEBAR ── */}
                                    <div className="sp-sidebar">

                                        {actionMessage && (
                                            <div className="sp-action-banner">{actionMessage}</div>
                                        )}

                                        {/* Owner: Pending Applications */}
                                        {isOwner && applications.length > 0 && (
                                            <div className="sp-sidebar-card">
                                                <h4 className="sp-sidebar-title">
                                                    📥 Pending Applications ({applications.length})
                                                </h4>
                                                <div className="sp-detail-list">
                                                    {applications.map(app => (
                                                        <div className="sp-application-row" key={app._id}>
                                                            <div className="sp-application-info">
                                                                <span className="sp-detail-value">
                                                                    {app.userId?.fullname || app.userId?.username}
                                                                </span>
                                                                <span className="sp-member-role-badge">{app.roleName}</span>
                                                            </div>
                                                            <div className="sp-application-actions">
                                                                <button
                                                                    className="sp-app-accept-btn"
                                                                    onClick={() => handleApplicationDecision(app._id, 'accepted')}
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    className="sp-app-reject-btn"
                                                                    onClick={() => handleApplicationDecision(app._id, 'rejected')}
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Owner: Invite a member */}
                                        {isOwner && project.roles?.filter(r => !r.isFilled).length > 0 && (
                                            <div className="sp-sidebar-card">
                                                <h4 className="sp-sidebar-title">✉️ Invite a Member</h4>
                                                <UserSearchInvite onSelect={setInviteUser} placeholder="Search by username..." />
                                                <select
                                                    className="sp-invite-role-select"
                                                    value={inviteRole}
                                                    onChange={(e) => setInviteRole(e.target.value)}
                                                >
                                                    <option value="">Select a role</option>
                                                    {project.roles.filter(r => !r.isFilled).map(r => (
                                                        <option key={r._id} value={r.roleName}>{r.roleName}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    className="sp-invite-send-btn"
                                                    disabled={!inviteUser || !inviteRole}
                                                    onClick={handleInvite}
                                                >
                                                    Send Invite
                                                </button>
                                            </div>
                                        )}

                                        {/* Member: Leave project */}
                                        {isMember && !isOwner && myMembership && (
                                            <div className="sp-sidebar-card">
                                                {myMembership.leaveRequestStatus === 'pending' ? (
                                                    <div className="sp-leave-pending">
                                                        ⏳ Leave request pending owner approval
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="sp-leave-btn"
                                                        onClick={() => handleLeaveClick(myMembership._id)}
                                                    >
                                                        🚪 Leave Project
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Owner: Pending leave requests */}
                                        {isOwner && leaveRequests.length > 0 && (
                                            <div className="sp-sidebar-card">
                                                <h4 className="sp-sidebar-title">
                                                    🚪 Leave Requests ({leaveRequests.length})
                                                </h4>
                                                <div className="sp-detail-list">
                                                    {leaveRequests.map(req => (
                                                        <div className="sp-application-row" key={req._id}>
                                                            <div className="sp-application-info">
                                                                <span className="sp-detail-value">
                                                                    {req.userId?.fullname || req.userId?.username}
                                                                </span>
                                                                <span className="sp-member-role-badge">{req.roleName}</span>
                                                            </div>
                                                            <p className="sp-leave-request-subject">{req.leaveRequestSubject}</p>
                                                            {req.leavingReason && (
                                                                <p className="sp-leave-request-desc">{req.leavingReason}</p>
                                                            )}
                                                            <div className="sp-application-actions">
                                                                <button
                                                                    className="sp-app-accept-btn"
                                                                    onClick={() => handleLeaveRequestDecision(req._id, 'approve')}
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    className="sp-app-reject-btn"
                                                                    onClick={() => handleLeaveRequestDecision(req._id, 'reject')}
                                                                >
                                                                    Decline
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Project Details */}
                                        <div className="sp-sidebar-card">
                                            <h4 className="sp-sidebar-title">Project Details</h4>
                                            <div className="sp-detail-list">

                                                <div className="sp-detail-row">
                                                    <span className="sp-detail-key">📁 Category</span>
                                                    <span className="sp-detail-value">{project.category || '—'}</span>
                                                </div>
                                                <div className="sp-detail-row">
                                                    <span className="sp-detail-key">🚀 Stage</span>
                                                    <span className="sp-detail-value">{project.stage || '—'}</span>
                                                </div>
                                                <div className="sp-detail-row">
                                                    <span className="sp-detail-key">👥 Who Can Apply</span>
                                                    <span className="sp-detail-value">{project.whoCanApply || '—'}</span>
                                                </div>
                                                <div className="sp-detail-row">
                                                    <span className="sp-detail-key">🌍 Communication</span>
                                                    <span className="sp-detail-value">{project.communication || '—'}</span>
                                                </div>
                                                {project.completionDate && (
                                                    <div className="sp-detail-row">
                                                        <span className="sp-detail-key">📅 Target Date</span>
                                                        <span className="sp-detail-value">
                                                            {new Date(project.completionDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                                {project.demoLink && (
                                                    <div className="sp-detail-row">
                                                        <span className="sp-detail-key">🔗 Demo</span>
                                                        <a
                                                            className="sp-detail-link"
                                                            href={project.demoLink}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            Visit Site ↗
                                                        </a>
                                                    </div>
                                                )}
                                                {project.repositoryType === 'github' && project.repositoryUrl && (
                                                    <div className="sp-detail-row">
                                                        <span className="sp-detail-key">🐙 Repository</span>
                                                        <a
                                                            className="sp-detail-link"
                                                            href={project.repositoryUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            GitHub ↗
                                                        </a>
                                                    </div>
                                                )}

                                            </div>
                                        </div>

                                        {/* Team Slots */}
                                        {project.roles?.filter(r => r.roleName).length > 0 && (
                                            <div className="sp-sidebar-card">
                                                <h4 className="sp-sidebar-title">Team Slots</h4>
                                                <div className="sp-detail-list">
                                                    {project.roles.filter(r => r.roleName).map(role => (
                                                        <div className="sp-detail-row" key={role._id}>
                                                            <span className="sp-detail-key">{role.roleName}</span>
                                                            <span className={`sp-detail-value ${role.isFilled ? 'sp-slot-filled' : 'sp-slot-open'}`}>
                                                                {role.isFilled ? 'Filled' : `${role.numberRequired} open`}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                    </div>

                                </div>
                            </div>
                        </div>
                    ) : (
                        // ── Project Not Found ──
                        <div className="sp-not-found">
                            <span className="sp-not-found-icon">🔍</span>
                            <h2 className="sp-not-found-title">Project Not Found</h2>
                            <p className="sp-not-found-sub">
                                This project may have been removed or made private.
                            </p>
                            <button
                                className="sp-not-found-btn"
                                onClick={() => navigate('/projects')}
                            >
                                ← Back to Projects
                            </button>
                        </div>
                    )
                )}

            </div>

            <BottomNavbar />

            {showApplyModal && project && (
                <JoinRequestModal
                    key={project._id}
                    project={project}
                    onClose={() => setShowApplyModal(false)}
                />
            )}

            {showLeaveRequestModal && project && (
                <LeaveRequestModal
                    projectId={projectId}
                    projectName={project.name}
                    onClose={() => setShowLeaveRequestModal(false)}
                    onSubmitted={() => { setActionMessage('Leave request submitted'); fetchProject() }}
                />
            )}

            {confirmAction && (
                <ConfirmModal
                    title={confirmAction.title}
                    message={confirmAction.message}
                    confirmLabel={confirmAction.confirmLabel}
                    danger={confirmAction.danger}
                    onConfirm={confirmAction.onConfirm}
                    onCancel={() => setConfirmAction(null)}
                />
            )}

        </section>
    )
}

export default SingleProject