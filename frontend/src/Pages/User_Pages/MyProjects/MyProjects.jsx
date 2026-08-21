import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import SideNavbar from '../../../Components/SideNavbar/SideNavbar'
import TopNavbar from '../../../Components/TopNavbar/TopNavbar'
import BottomNavbar from '../../../Components/BottomNavbar/BottomNavbar'
import AuthContext from '../../../Context/AuthContext'
import api from '../../../Configure/axiosConfigure'
import './MyProjects.css'

const stageLabel = (project) => {
    if (project.recruitmentStatus === 'paused') return 'Paused'
    if (project.stage === '✅ Completed') return 'Completed'
    if (project.recruitmentStatus === 'open') return 'Recruiting'
    return 'In Progress'
}

const ProjectRow = ({ project, isOwner, onEdit, onOpen }) => {
    const filledRoles = project.roles?.filter(r => r.isFilled).length || 0
    const totalRoles = project.roles?.length || 0
    const teamCount = project.teamMembers?.filter(m => m.status === 'approved').length || 0

    return (
        <div className="myp-row" onClick={() => onOpen(project._id)}>
            <div className="myp-row-icon">
                {project.logoUrl ? <img src={project.logoUrl} alt="" /> : <span>{project.name?.[0]?.toUpperCase()}</span>}
            </div>
            <div className="myp-row-info">
                <span className="myp-row-name">{project.name}</span>
                <span className="myp-row-tagline">{project.tagline}</span>
            </div>
            <span className="myp-row-badge">{stageLabel(project)}</span>
            <span className="myp-row-meta">{teamCount} members · {filledRoles}/{totalRoles} roles filled</span>
            {isOwner && (
                <button className="myp-edit-btn" onClick={(e) => { e.stopPropagation(); onEdit(project) }}>
                    ✎ Edit
                </button>
            )}
        </div>
    )
}

const MyProjects = () => {

    const { User } = useContext(AuthContext)
    const navigate = useNavigate()

    const [projects, setProjects] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('created')

    useEffect(() => {
        setIsLoading(true)
        api.get('/projects/mine/list')
            .then(res => setProjects(res.data.data || []))
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false))
    }, [])

    const created = projects.filter(p => p.userId?._id === User._id)
    const joined = projects.filter(p => p.userId?._id !== User._id)
    const activeList = activeTab === 'created' ? created : joined

    return (
        <section className="page-wrapper">
            <SideNavbar />

            <div className="right-dashboard">
                <TopNavbar />

                <div className="myp-page">
                    <div className="myp-header">
                        <h1 className="myp-title">My Projects</h1>
                        <button className="myp-new-btn" onClick={() => navigate('/projects/createProject')}>＋ New Project</button>
                    </div>

                    <div className="myp-tabs">
                        <button
                            className={`myp-tab ${activeTab === 'created' ? 'myp-tab-active' : ''}`}
                            onClick={() => setActiveTab('created')}
                        >
                            Created by Me ({created.length})
                        </button>
                        <button
                            className={`myp-tab ${activeTab === 'joined' ? 'myp-tab-active' : ''}`}
                            onClick={() => setActiveTab('joined')}
                        >
                            Joined ({joined.length})
                        </button>
                    </div>

                    <div className="myp-list">
                        {isLoading ? (
                            <div className="myp-empty">Loading…</div>
                        ) : activeList.length === 0 ? (
                            <div className="myp-empty">
                                {activeTab === 'created'
                                    ? "You haven't created any projects yet."
                                    : "You haven't joined any projects yet — browse open projects to get started."}
                            </div>
                        ) : (
                            activeList.map(project => (
                                <ProjectRow
                                    key={project._id}
                                    project={project}
                                    isOwner={activeTab === 'created'}
                                    onEdit={(project) => navigate(`/projects/${project._id}/edit`)}
                                    onOpen={(id) => navigate(`/projects/${id}`)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <BottomNavbar />
        </section>
    )
}

export default MyProjects
