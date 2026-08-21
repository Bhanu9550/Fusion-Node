import { useContext, useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import './EditProject.css'
import '../CreateProject/CreateProject.css'
import SideNavbar from '../../../Components/SideNavbar/SideNavbar'
import TopNavbar from '../../../Components/TopNavbar/TopNavbar'
import BottomNavbar from '../../../Components/BottomNavbar/BottomNavbar'
import EditStepInfo from '../../../Components/ProjectEditSteps/EditStepInfo'
import StepTwo from '../../../Components/ProjectCreationSteps/StepTwo'
import EditStepSettings from '../../../Components/ProjectEditSteps/EditStepSettings'
import api from '../../../Configure/axiosConfigure'
import AuthContext from '../../../Context/AuthContext'

const STEPS = [
    { id: 1, label: 'Project Info' },
    { id: 2, label: 'Roles' },
    { id: 3, label: 'Settings' },
    { id: 4, label: 'Review' },
]

function withFrontendIds(roles) {
    return (roles || []).map((role) => ({
        ...role,
        _frontendId: role._id || `id-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        skillInput: '',
    }))
}

const EditProject = () => {
    const { projectId } = useParams()
    const { User } = useContext(AuthContext)
    const navigate = useNavigate()

    const [project, setProject] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentStep, setCurrentStep] = useState(1)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')
    const [loadError, setLoadError] = useState('')

    useEffect(() => {
        api.get(`/projects/${projectId}`)
            .then(res => {
                const data = res.data.response?.[0] || res.data.data
                if (!data) return setLoadError('Project not found')
                if (data.userId?._id !== User._id) {
                    setLoadError('Only the project owner can edit this project')
                    return
                }
                // Added logo: null here
                setProject({ 
                    ...data, 
                    roles: withFrontendIds(data.roles), 
                    banner: null,
                    logo: null 
                })
            })
            .catch(err => setLoadError(err.response?.data?.message || 'Failed to load project'))
            .finally(() => setIsLoading(false))
    }, [projectId, User._id])

    const handleChange = (field, value) => {
        setProject(prev => ({ ...prev, [field]: value }))
    }

    const goNext = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    const goBack = () => setCurrentStep(prev => Math.max(prev - 1, 1))

    async function handleSave() {
        setIsSaving(true)
        setError('')
        try {
            const formData = new FormData()
            if (project.banner) formData.append('banner', project.banner)
            
            // Added logo append
            if (project.logo) formData.append('logo', project.logo)

            const payload = {
                description: project.description,
                visibility: project.visibility,
                recruitmentStatus: project.recruitmentStatus,
                maxTeamSize: project.maxTeamSize,
                membersCanInvite: project.membersCanInvite,
                leavingPolicy: project.leavingPolicy,
                communication: project.communication,
                communicationLink: project.communicationLink,
                completionDate: project.completionDate,
                roles: project.roles.map(({ _frontendId, skillInput, ...rest }) => rest),
            }
            formData.append('projectDetails', JSON.stringify(payload))

            await api.patch(`/projects/${projectId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            navigate(`/projects/${projectId}`)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save changes')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <section className="page-wrapper">
                <SideNavbar />
                <div className="right-dashboard">
                    <TopNavbar />
                    <div className="edp-loading">Loading project…</div>
                </div>
                <BottomNavbar />
            </section>
        )
    }

    if (loadError || !project) {
        return (
            <section className="page-wrapper">
                <SideNavbar />
                <div className="right-dashboard">
                    <TopNavbar />
                    <div className="edp-loading">{loadError}</div>
                </div>
                <BottomNavbar />
            </section>
        )
    }

    return (
        <section className="page-wrapper">
            <SideNavbar />
            <div className="right-dashboard">
                <TopNavbar />

                <div className="cp-container">

                    <div className="cp-header">
                        <div className='headerText'>
                            <h1 className="cp-title">✎ Edit Project</h1>
                            <p className="cp-subtitle">{project.name}</p>
                        </div>
                        <div className='headerButton'>
                            <Link className='back-button' to={`/projects/${projectId}`}>Cancel</Link>
                        </div>
                    </div>

                    {/* STEPS */}
                    <div className="cp-stepper">
                        {STEPS.map((step, index) => {
                            const isCompleted = currentStep > step.id
                            const isActive = currentStep === step.id
                            return (
                                <div className="cp-stepper-item" key={step.id}>
                                    <div className={`cp-step-circle ${isActive ? 'cp-step-active' : ''} ${isCompleted ? 'cp-step-completed' : ''}`}>
                                        {isCompleted ? '✓' : step.id}
                                    </div>
                                    <span className={`cp-step-label ${isActive ? 'cp-step-label-active' : ''} ${isCompleted ? 'cp-step-label-completed' : ''}`}>
                                        {step.label}
                                    </span>
                                    {index < STEPS.length - 1 && (
                                        <div className={`cp-step-line ${isCompleted ? 'cp-step-line-done' : ''}`} />
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <div className="cp-mobile-step">
                        Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1].label}
                    </div>

                    <div className="cp-content">
                        {currentStep === 1 && <EditStepInfo project={project} handleValue={handleChange} />}
                        {currentStep === 2 && <StepTwo project={project} handleValue={handleChange} />}
                        {currentStep === 3 && <EditStepSettings project={project} handleValue={handleChange} />}
                        {currentStep === 4 && (
                            <div className="cp-form">
                                <h2 className="cp-step-title">④ Review Changes</h2>
                                <p className="cp-hint">Confirm your changes below, then save.</p>
                                <div className="edp-readonly-grid">
                                    <div className="edp-readonly-item">
                                        <span className="edp-readonly-label">Visibility</span>
                                        <span className="edp-readonly-value">{project.visibility}</span>
                                    </div>
                                    <div className="edp-readonly-item">
                                        <span className="edp-readonly-label">Recruitment</span>
                                        <span className="edp-readonly-value">{project.recruitmentStatus}</span>
                                    </div>
                                    <div className="edp-readonly-item">
                                        <span className="edp-readonly-label">Max Team Size</span>
                                        <span className="edp-readonly-value">{project.maxTeamSize}</span>
                                    </div>
                                    <div className="edp-readonly-item">
                                        <span className="edp-readonly-label">Members Can Invite</span>
                                        <span className="edp-readonly-value">{project.membersCanInvite}</span>
                                    </div>
                                    <div className="edp-readonly-item">
                                        <span className="edp-readonly-label">Leaving Policy</span>
                                        <span className="edp-readonly-value">{project.leavingPolicy}</span>
                                    </div>
                                    <div className="edp-readonly-item">
                                        <span className="edp-readonly-label">Communication</span>
                                        <span className="edp-readonly-value">{project.communication || '—'}</span>
                                    </div>
                                    <div className="edp-readonly-item">
                                        <span className="edp-readonly-label">Roles</span>
                                        <span className="edp-readonly-value">{project.roles.filter(r => r.roleName).length} role(s)</span>
                                    </div>
                                </div>
                                {error && <div className="edp-error">{error}</div>}
                            </div>
                        )}
                    </div>

                    <div className="cp-nav-buttons">
                        {currentStep > 1 && (
                            <button className="cp-btn-back" onClick={goBack}>← Back</button>
                        )}
                        {currentStep < STEPS.length ? (
                            <button className="cp-btn-next" onClick={goNext}>Next →</button>
                        ) : (
                            <button className="cp-btn-publish" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Saving…' : '💾 Save Changes'}
                            </button>
                        )}
                    </div>

                </div>
            </div>

            <BottomNavbar />
        </section>
    )
}

export default EditProject