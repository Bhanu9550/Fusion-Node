import { useState, useEffect, useContext, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SideNavbar from '../../../Components/SideNavbar/SideNavbar'
import TopNavbar from '../../../Components/TopNavbar/TopNavbar'
import BottomNavbar from '../../../Components/BottomNavbar/BottomNavbar'
import AuthContext from '../../../Context/AuthContext'
import api from '../../../Configure/axiosConfigure'
import EditProfileModal from '../../../Components/EditProfileModal/EditProfileModal'
import FollowListModal from '../../../Components/FollowListModal/FollowListModal'
import './Profile.css'

const ProjectChip = ({ project, navigate }) => (
    <div className="prf-project-chip" onClick={() => navigate(`/projects/${project._id}`)}>
        <div className="prf-project-chip-icon">
            {project.logoUrl ? <img src={ import.meta.env.VITE_Images_URL + '/' + project.logoUrl} alt="" /> : <span>{project.name?.[0]?.toUpperCase()}</span>}
        </div>
        <span className="prf-project-chip-name">{project.name}</span>
    </div>
)

const Profile = () => {

    const { username } = useParams()
    const { User: currentUser } = useContext(AuthContext)
    const navigate = useNavigate()

    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)
    const [followBusy, setFollowBusy] = useState(false)
    const [error, setError] = useState('')
    const [followListMode, setFollowListMode] = useState(null) //* 'followers' | 'following' | null

    const loadProfile = useCallback(async () => {
        setIsLoading(true)
        setError('')
        try {
            const res = await api.get(`/users/${username}`)
            setData(res.data)
        } catch (err) {
            setError(err.response?.data?.message || 'User not found')
        } finally {
            setIsLoading(false)
        }
    }, [username])

    useEffect(() => { loadProfile() }, [loadProfile])

    async function handleFollow() {
        if (!data || followBusy) return
        setFollowBusy(true)
        try {
            await api.post(`/users/${data.user._id}/follow`)
            await loadProfile()
        } catch (err) {
            console.error(err)
        } finally {
            setFollowBusy(false)
        }
    }

    async function handleUnfollow() {
        if (!data || followBusy) return
        setFollowBusy(true)
        try {
            await api.post(`/users/${data.user._id}/unfollow`)
            await loadProfile()
        } catch (err) {
            console.error(err)
        } finally {
            setFollowBusy(false)
        }
    }

    if (isLoading) {
        return (
            <section className="page-wrapper">
                <SideNavbar />
                <div className="right-dashboard">
                    <TopNavbar />
                    <div className="prf-loading">Loading profile…</div>
                </div>
                <BottomNavbar />
            </section>
        )
    }

    if (error || !data) {
        return (
            <section className="page-wrapper">
                <SideNavbar />
                <div className="right-dashboard">
                    <TopNavbar />
                    <div className="prf-loading">{error || 'User not found'}</div>
                </div>
                <BottomNavbar />
            </section>
        )
    }

    const { user, isSelf, isFollowing, hasSentRequest, canMessage, canViewFullProfile, createdProjects, joinedProjects } = data

    return (
        <section className="page-wrapper">
            <SideNavbar />

            <div className="right-dashboard">
                <TopNavbar />

                <div className="prf-page">

                    {/* ── Cover + Avatar ── */}
                    <div className="prf-cover" style={user.coverPicture ? { backgroundImage: `url(${ import.meta.env.VITE_Images_URL + '/' + user.coverPicture})` } : {}}>
                        <div className="prf-avatar-wrapper">
                            {user.profilePicture ? (
                                <img className="prf-avatar" src={ import.meta.env.VITE_Images_URL + '/' + user.profilePicture} alt={user.username} />
                            ) : (
                                <div className="prf-avatar prf-avatar-fallback">{user.fullname?.[0]?.toUpperCase()}</div>
                            )}
                        </div>
                    </div>

                    <div className="prf-header">
                        <div className="prf-header-info">
                            <div className="prf-name-row">
                                <h1 className="prf-fullname">{user.fullname}</h1>
                                {user.isPrivate && <span className="prf-private-badge">🔒 Private</span>}
                            </div>
                            <span className="prf-username">@{user.username}</span>
                            {user.designation && <span className="prf-designation">{user.designation}{user.company ? ` at ${user.company}` : ''}</span>}
                        </div>

                        <div className="prf-header-actions">
                            {isSelf ? (
                                <button className="prf-btn-edit" onClick={() => setShowEditModal(true)}>
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    {isFollowing ? (
                                        <button className="prf-btn-following" onClick={handleUnfollow} disabled={followBusy}>
                                            ✓ Following
                                        </button>
                                    ) : hasSentRequest ? (
                                        <button className="prf-btn-requested" disabled>
                                            Requested
                                        </button>
                                    ) : (
                                        <button className="prf-btn-follow" onClick={handleFollow} disabled={followBusy}>
                                            + Follow
                                        </button>
                                    )}
                                    {canMessage && (
                                        <button className="prf-btn-message" onClick={() => navigate(`/messages/user/${user._id}`)}>
                                            💬 Message
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="prf-stats-row">
                        <button className="prf-stat prf-stat-clickable" onClick={() => setFollowListMode('followers')}>
                            <span className="prf-stat-num">{user.followersCount}</span>
                            <span className="prf-stat-label">Followers</span>
                        </button>
                        <button className="prf-stat prf-stat-clickable" onClick={() => setFollowListMode('following')}>
                            <span className="prf-stat-num">{user.followingCount}</span>
                            <span className="prf-stat-label">Following</span>
                        </button>
                        <div className="prf-stat">
                            <span className="prf-stat-num">{createdProjects.length + joinedProjects.length}</span>
                            <span className="prf-stat-label">Projects</span>
                        </div>
                    </div>

                    {!canViewFullProfile ? (
                        <div className="prf-private-notice">
                            <span className="prf-private-notice-icon">🔒</span>
                            <p>This account is private. Follow @{user.username} to see their projects and full profile.</p>
                        </div>
                    ) : (
                        <>
                            {user.bio && (
                                <div className="prf-section">
                                    <h3 className="prf-section-title">About</h3>
                                    <p className="prf-bio">{user.bio}</p>
                                </div>
                            )}

                            <div className="prf-section">
                                <div className="prf-links-row">
                                    {user.location && <span className="prf-link-chip">📍 {user.location}</span>}
                                    {user.website && <a className="prf-link-chip" href={user.website} target="_blank" rel="noreferrer">🔗 Website</a>}
                                    {user.github && <a className="prf-link-chip" href={user.github} target="_blank" rel="noreferrer">GitHub</a>}
                                    {user.linkedin && <a className="prf-link-chip" href={user.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
                                    {user.portfolio && <a className="prf-link-chip" href={user.portfolio} target="_blank" rel="noreferrer">Portfolio</a>}
                                </div>
                            </div>

                            <div className="prf-section">
                                <h3 className="prf-section-title">Created Projects ({createdProjects.length})</h3>
                                {createdProjects.length === 0 ? (
                                    <p className="prf-empty-text">No projects created yet.</p>
                                ) : (
                                    <div className="prf-project-grid">
                                        {createdProjects.map(p => <ProjectChip key={p._id} project={p} navigate={navigate} />)}
                                    </div>
                                )}
                            </div>

                            <div className="prf-section">
                                <h3 className="prf-section-title">Joined Projects ({joinedProjects.length})</h3>
                                {joinedProjects.length === 0 ? (
                                    <p className="prf-empty-text">Hasn't joined any projects yet.</p>
                                ) : (
                                    <div className="prf-project-grid">
                                        {joinedProjects.map(p => <ProjectChip key={p._id} project={p} navigate={navigate} />)}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                </div>
            </div>

            <BottomNavbar />

            {showEditModal && (
                <EditProfileModal
                    onClose={() => setShowEditModal(false)}
                    onSaved={loadProfile}
                />
            )}

            {followListMode && (
                <FollowListModal
                    username={user.username}
                    mode={followListMode}
                    onClose={() => setFollowListMode(null)}
                />
            )}
        </section>
    )
}

export default Profile
