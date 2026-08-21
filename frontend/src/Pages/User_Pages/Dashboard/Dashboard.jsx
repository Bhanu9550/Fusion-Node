import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'
import AuthContext from '../../../Context/AuthContext'
import SideNavbar from '../../../Components/SideNavbar/SideNavbar'
import TopNavbar from '../../../Components/TopNavbar/TopNavbar'
import BottomNavbar from '../../../Components/BottomNavbar/BottomNavbar'
import api from '../../../Configure/axiosConfigure'

//* Visual config per dashboard status bucket - keeps the existing donut/badge/icon styling
const statusConfig = {
    'Idea Stage': { color: '#3b82f6', dotClass: 'legend-dot-blue', badgeClass: 'badge-idea-stage', fillClass: 'progress-fill-blue', iconClass: 'project-icon-blue', icon: '🌐' },
    'Recruiting': { color: '#a855f7', dotClass: 'legend-dot-purple', badgeClass: 'badge-recruiting', fillClass: 'progress-fill-purple', iconClass: 'project-icon-purple', icon: '</>' },
    'In Progress': { color: '#22c55e', dotClass: 'legend-dot-green', badgeClass: 'badge-in-progress', fillClass: 'progress-fill-green', iconClass: 'project-icon-green', icon: 'N' },
    'Completed': { color: '#14b8a6', dotClass: 'legend-dot-teal', badgeClass: 'badge-completed', fillClass: 'progress-fill-teal', iconClass: 'project-icon-teal', icon: '✔' },
    'Paused': { color: '#f59e0b', dotClass: 'legend-dot-orange', badgeClass: 'badge-paused', fillClass: 'progress-fill-orange', iconClass: 'project-icon-yellow', icon: '📱' },
}

//* Builds the SVG stroke-dasharray/offset for each donut segment from percentages
function buildDonutSegments(breakdown) {
    const CIRCUMFERENCE = 2 * Math.PI * 80 // r=80
    let offsetAccum = 0
    return breakdown
        .filter(b => b.count > 0)
        .map(b => {
            const length = (b.percent / 100) * CIRCUMFERENCE
            const segment = {
                ...b,
                dasharray: `${length} ${CIRCUMFERENCE - length}`,
                dashoffset: -offsetAccum,
            }
            offsetAccum += length
            return segment
        })
}

const Dashboard = () => {

    const { User } = useContext(AuthContext)
    const navigate = useNavigate()

    const [stats, setStats] = useState({ total: 0, breakdown: [], projects: [] })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let cancelled = false;
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const res = await api.get('/dashboard/stats');
                if (!cancelled) {
                    setStats(res.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };
        fetchStats();
        return () => {
            cancelled = true;
        };
    }, []);


    function openCreatePage() {
        navigate("/projects/createProject")
    }

    const donutSegments = buildDonutSegments(stats.breakdown)

    return (
        <>
            <section className="page-wrapper">

                {/* SIDE NAV  */}
                <SideNavbar />

                {/*  RIGHT DASHBOARD  */}
                <div className="right-dashboard">

                    {/* TOP NAVBAR */}
                    <TopNavbar />

                    {/* DASHBOARD CONTENT */}
                    <div className="dashboard-content">

                        {/* Welcome Header */}
                        <div className="welcome-header">
                            <div className="welcome-left">
                                <h1 className="welcome-title">Welcome back, {User.username}! 👋</h1>
                                <p className="welcome-subtitle">Here's what's happening with your projects today.</p>
                            </div>
                            <button className="new-project-btn" onClick={openCreatePage}>
                                <span>＋</span> New Project
                            </button>
                        </div>

                        {/* Project Status Card */}
                        <div className="card project-status-card">
                            <div className="card-header">
                                <h2 className="card-title">Project Status</h2>
                            </div>

                            {stats.total === 0 && !isLoading ? (
                                <div className="dash-empty-state">
                                    You're not on any projects yet. Create one or browse open projects to join a team.
                                </div>
                            ) : (
                                <div className="project-status-body">
                                    {/* Donut Chart */}
                                    <div className="donut-chart-wrapper">
                                        <div className="donut-chart">
                                            <svg viewBox="0 0 200 200" className="donut-svg">
                                                <circle cx="100" cy="100" r="80" fill="none" stroke="#1e1e2e" strokeWidth="36" />
                                                {donutSegments.map(seg => (
                                                    <circle
                                                        key={seg.name}
                                                        cx="100" cy="100" r="80"
                                                        fill="none"
                                                        stroke={statusConfig[seg.name]?.color || '#22c55e'}
                                                        strokeWidth="36"
                                                        strokeDasharray={seg.dasharray}
                                                        strokeDashoffset={seg.dashoffset}
                                                        className="donut-segment"
                                                    />
                                                ))}
                                            </svg>
                                            <div className="donut-center">
                                                <span className="donut-number">{stats.total}</span>
                                                <span className="donut-label">Total</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="status-legend">
                                        {stats.breakdown.filter(b => b.count > 0).map(b => (
                                            <div className="legend-item" key={b.name}>
                                                <span className={`legend-dot ${statusConfig[b.name]?.dotClass || ''}`}></span>
                                                <span className="legend-name">{b.name}</span>
                                                <span className="legend-count">{b.count}</span>
                                                <span className="legend-percent">({b.percent}%)</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Your Projects Card */}
                        <div className="card your-projects-card">
                            <div className="card-header">
                                <h2 className="card-title">Your Projects</h2>
                                {
                                    stats.projects.length > 0 ?  
                                                <span className="view-all-link" onClick={() => navigate('/projects/myProjects')}>View All ›</span>  :  ""
                                }
                                
                            </div>

                            <div className="projects-table">
                                {isLoading ? (
                                    <div className="dash-empty-state">Loading your projects…</div>
                                ) : stats.projects.length === 0 ? (
                                    <div className="dash-empty-state">No projects yet — start your first one!</div>
                                ) : (
                                    stats.projects.map(project => {
                                        const cfg = statusConfig[project.status] || statusConfig['In Progress']
                                        return (
                                            <div
                                                className="project-row"
                                                key={project._id}
                                                onClick={() => navigate(`/projects/${project._id}`)}
                                            >
                                                <div className={`project-icon-wrapper ${cfg.iconClass}`}>
                                                    {project.logoUrl ? (
                                                        <img className="project-icon-img" src={  project.logoUrl} alt="" />
                                                    ) : (
                                                        <span className="project-icon-text">{project.name?.[0]?.toUpperCase() || cfg.icon}</span>
                                                    )}
                                                </div>
                                                <span className="project-name">{project.name}</span>
                                                <span className={`project-badge ${cfg.badgeClass}`}>{project.status}</span>
                                                <div className="progress-bar-wrapper">
                                                    <div className="progress-bar">
                                                        <div className={`progress-fill ${cfg.fillClass}`} style={{ width: `${project.progress}%` }}></div>
                                                    </div>
                                                </div>
                                                <span className="progress-percent">{project.progress}%</span>
                                                <div className="project-avatars">
                                                    {project.members.map((m, i) => (
                                                        m.profilePicture ? (
                                                            <img key={m._id || i} className="avatar-sm" src={  m.profilePicture} alt="" />
                                                        ) : (
                                                            <span key={m._id || i} className="avatar-sm avatar-fallback">
                                                                {m.fullname?.[0]?.toUpperCase() || '?'}
                                                            </span>
                                                        )
                                                    ))}
                                                    {project.extraMembersCount > 0 && (
                                                        <span className="avatar-extra">+{project.extraMembersCount}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* MOBILE BOTTOM NAV */}
                <BottomNavbar />

            </section>
        </>
    )
}

export default Dashboard
