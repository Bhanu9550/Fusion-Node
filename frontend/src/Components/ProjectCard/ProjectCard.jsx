import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { useDuration } from '../../Hooks/useDuration'
import { useRelativeTime } from '../../Hooks/useRelativeTime'
import WishlistContext from '../../Context/WishlistContext'
import './ProjectCard.css'

const statusConfig = {
    'open':  { color: '#4ec314', bg: 'rgba(78,195,20,0.08)',  border: 'rgba(78,195,20,0.25)'  },
    'paused':  { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
    'closed':   { color: '#b81414', bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.25)' },
}

const ProjectCard = ({ project, onReviewClick }) => {

    const status = statusConfig[project.recruitmentStatus] || statusConfig['Closed']
    const skills = project.roles.flatMap(role =>role.skills)
    const openRoles = project.roles.map(role=> role.roleName)

    const createdAt = project.createdAt

    const navigate = useNavigate()
    const { isWishlisted, toggleWishlist } = useContext(WishlistContext)
    const wishlisted = isWishlisted(project._id)

    const timeStamp = useRelativeTime(createdAt)
    const timeLeft = useDuration(project.completionDate);
    const ownerUsername = project.userId?.username


    return (
        <div className="pc-card">

            {/* ── Top Row ── */}
            <div className="pc-top">
                <span
                    className="pc-status-badge"
                    style={{
                        color:           status.color,
                        backgroundColor: status.bg,
                        borderColor:     status.border,
                    }}
                >
                    <span
                        className="pc-status-dot"
                        style={{ backgroundColor: status.color }}
                    />
                    {project.recruitmentStatus}
                </span>

                <div className="pc-top-actions">
                    <button
                        className={`pc-like-btn ${wishlisted ? 'pc-like-btn-active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(project._id) }}
                    >
                        <span className="pc-like-icon">{wishlisted ? '❤️' : '♡'}</span>
                    </button>
                </div>
            </div>

            {/* ── Title + Tagline ── */}
            <div className="pc-title-section">
                <h2 className="pc-title">{project.name}</h2>
                <p className="pc-tagline">{project.tagline}</p>
            </div>

            {/* ── Owner Row ── */}
            <div className="pc-owner-row">
                <button
                    className="pc-owner-clickable"
                    onClick={(e) => { e.stopPropagation(); ownerUsername && navigate(`/profile/${ownerUsername}`) }}
                >
                    <div className="pc-owner-avatar">
                        {
                            project.userPic 
                                ?   <img src={ project.userPic } alt="" srcset="" />
                                :   project.userName.slice(0, 1).toUpperCase()
                        }
                    </div>
                    <span className="pc-owner-name">{project.userName}</span>
                </button>
                <span className="pc-separator">•</span>
                <span className="pc-posted-ago">{timeStamp}</span>
            </div>

            {/* ── Skills ── */}
            <div className="pc-skills-row">
                {skills.map(skill => (
                    <span className="pc-skill-tag" key={skill}>
                        {skill}
                    </span>
                ))}
            </div>

            {/* ── Divider ── */}
            <div className="pc-divider" />

            {/* ── Meta Info ── */}
            <div className="pc-meta-grid">
                <div className="pc-meta-item">
                    <span className="pc-meta-icon">👥</span>
                    <span className="pc-meta-label">Team Members</span>
                    <span className="pc-meta-value">
                        4 / {project.maxTeamSize}
                    </span>
                </div>
                <div className="pc-meta-item">
                    <span className="pc-meta-icon">📢</span>
                    <span className="pc-meta-label">Open Roles</span>
                    <span className="pc-meta-value">
                        {openRoles.length > 0
                            ? openRoles.join(', ')
                            : '—'
                        }
                    </span>
                </div>
                <div className="pc-meta-item">
                    <span className="pc-meta-icon">⏳</span>
                    <span className="pc-meta-label">Duration</span>
                    <span className="pc-meta-value">{timeLeft}</span>
                </div>
                {/* <div className="pc-meta-item">
                    <span className="pc-meta-icon">🌍</span>
                    <span className="pc-meta-label">Mode</span>
                    <span className="pc-meta-value">{project.mode}</span>
                </div> */}
            </div>

            {/* ── Buttons ── */}
            <div className="pc-buttons">
                <button className="pc-btn-info" onClick={() => navigate(`/projects/${project._id}`)}>
                    Project Info
                </button>
                <button className="pc-btn-request" onClick={(e) =>{e.stopPropagation() 
                                                                    onReviewClick(project)}}>
                    Review Requests
                    {project.requests > 0 && (
                        <span className="pc-request-badge">
                            {project.requests}
                        </span>
                    )}
                </button>
            </div>

        </div>

        
    )
}

export default ProjectCard