import { useContext, useState } from 'react'
import './CreateProject.css'
import SideNavbar from '../../../Components/SideNavbar/SideNavbar'
import TopNavbar from '../../../Components/TopNavbar/TopNavbar'

// ── Step Components ──
import StepOne from '../../../Components/ProjectCreationSteps/StepOne'
import StepTwo from '../../../Components/ProjectCreationSteps/StepTwo'
import StepThree from '../../../Components/ProjectCreationSteps/StepThree'
import StepFour from '../../../Components/ProjectCreationSteps/StepFour'
import StepFive from '../../../Components/ProjectCreationSteps/StepFive'
import ProjectPreview from '../../../Components/ProjectPreview/ProjectPreview'
import BottomNavbar from '../../../Components/BottomNavbar/BottomNavbar'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../../Configure/axiosConfigure'
import AuthContext from '../../../Context/AuthContext'

const STEPS = [
    { id: 1, label: 'Project Info' },
    { id: 2, label: 'Build Team' },
    { id: 3, label: 'Invite' },
    { id: 4, label: 'Settings' },
    { id: 5, label: 'Review' },
]

const CreateProject = () => {

    const {User} = useContext(AuthContext)
    const navigate = useNavigate()

    const initialState = {
        // Step 1
        userId : User._id,
        userPic : User.profilePicture,
        userName : User.fullname,
        name: '',
        tagline: '',
        description: '',
        category: '',
        stage: '',
        visibility: 'public',
        repositoryType: 'none',
        repositoryUrl: '',
        demoLink: '',
        banner: null,
        logo: null,

        // Step 2
        roles: [],

        // Step 3
        invitedMembers: [],

        // Step 4
        recruitmentStatus: 'open',
        whoCanApply: 'everyone',
        maxTeamSize: '',
        joinApproval: 'owner',
        membersCanInvite: 'no',
        leavingPolicy: 'anytime',
        communication: '',
        communicationLink: '',
        completionDate: '',
    }

    const [currentStep, setCurrentStep] = useState(1)
    const [newProject, setNewProject] = useState(initialState)
    const [showPreview, setShowPreview] = useState(false)
    
    // New states for the Modal
    const [errorMsgs, setErrorMsgs] = useState([])
    const [showErrorModal, setShowErrorModal] = useState(false)

    const handleChange = (field, value) => {
        setNewProject(prev => ({ ...prev, [field]: value }))
    }

    const goNext = () => setCurrentStep(prev => Math.min(prev + 1, 5))
    const goBack = () => setCurrentStep(prev => Math.max(prev - 1, 1))

    const openPreview = () => setShowPreview(true)
    const closePreview = () => setShowPreview(false)

    if (showPreview) {
        return (
            <ProjectPreview
                project={newProject}
                onClose={closePreview}
            />
        )
    }

    async function publishProject(e) {
        e.preventDefault()
        
        const formData = new FormData();
        if (newProject.banner) {
            formData.append('banner', newProject.banner);
        }
        if (newProject.logo) {
            formData.append('logo', newProject.logo);
        }
        const textFields = { ...newProject };
        delete textFields.banner;
        delete textFields.logo;
        formData.append('projectDetails', JSON.stringify(textFields));
        
        try {
            await api.post('/projects/publishProject', formData);
            navigate('/projects')
        } catch (err) {
            console.log(err)
            
            if (err.response && err.response.status === 400) {
                const backendErrors = err.response.data.errors;
                if (Array.isArray(backendErrors) && backendErrors.length > 0) {
                    setErrorMsgs(backendErrors);
                    setShowErrorModal(true); 
                } else {
                    setErrorMsgs(["Validation failed. Please check required fields."]);
                    setShowErrorModal(true);
                }
            } else {
                setErrorMsgs(["Something went wrong. Please try again."]);
                setShowErrorModal(true);
            }
        }
    }

    return (
        <section className="page-wrapper">
            <SideNavbar />
            <div className="right-dashboard">
                <TopNavbar />

                <div className="cp-container">

                    {/* PAGE HEADER */}
                    <div className="cp-header">
                        <div className='headerText'>
                            <h1 className="cp-title">🚀 Create Project</h1>
                            <p className="cp-subtitle">
                                Build your team and bring your idea to life.
                            </p>
                        </div>
                        <div className='headerButton'>
                            <Link className='back-button' to="/projects">Back</Link>
                        </div>
                    </div>

                    {/* STEPS */}
                    <div className="cp-stepper">
                        {STEPS.map((step, index) => {
                            const isCompleted = currentStep > step.id
                            const isActive = currentStep === step.id
                            return (
                                <div className="cp-stepper-item" key={step.id}>
                                    <div className={`cp-step-circle 
                                        ${isActive ? 'cp-step-active' : ''} 
                                        ${isCompleted ? 'cp-step-completed' : ''}
                                      `}>{isCompleted ? '✓' : step.id}</div>
                                    
                                    <span className={`cp-step-label 
                                        ${isActive ? 'cp-step-label-active' : ''} 
                                        ${isCompleted ? 'cp-step-label-completed' : ''}
                                      `}>{step.label}</span>

                                    {index < STEPS.length - 1 && (
                                        <div className={`cp-step-line 
                                        ${isCompleted ? 'cp-step-line-done' : ''}`} />)}
                                </div>
                            )
                        })}
                    </div>

                    {/* IN MOBILE STEPS */}
                    <div className="cp-mobile-step">
                        Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1].label}
                    </div>

                    {/* STEP CONTENT */}
                    <div className="cp-content">
                        {currentStep === 1 && <StepOne project={newProject} handleValue={handleChange} />}
                        {currentStep === 2 && <StepTwo project={newProject} handleValue={handleChange} />}
                        {currentStep === 3 && <StepThree project={newProject} handleValue={handleChange} />}
                        {currentStep === 4 && <StepFour project={newProject} handleValue={handleChange} />}
                        {currentStep === 5 && <StepFive project={newProject} onPreview={openPreview} />}
                    </div>

                    {/* NAVIGATION BUTTONS */}
                    {currentStep < 5 && (
                        <div className="cp-nav-buttons">
                            {currentStep > 1 && <button className="cp-btn-back" onClick={goBack}>← Back</button>}
                            <button className="cp-btn-next" onClick={goNext}>
                                {currentStep === 4 ? 'Review →' : 'Next →'}
                            </button>
                        </div>
                    )}

                    {/* STEP 5 BUTTONS */}
                    {currentStep === 5 && (
                        <div className="cp-nav-buttons">
                            <button className="cp-btn-back" onClick={goBack}>← Back</button>
                            <button className="cp-btn-publish" onClick={(e)=>publishProject(e)}>
                                🚀 Publish Project
                            </button>
                        </div>
                    )}

                </div>
            </div>

            {/* MOBILE BOTTOM NAV */}
            <BottomNavbar />

            {/* ERROR MODAL */}
            {showErrorModal && (
                <div className="cp-modal-overlay" onClick={() => setShowErrorModal(false)}>
                    <div className="cp-error-modal-content" onClick={e => e.stopPropagation()}>
                        
                        <div className="cp-error-header">
                            <span className="cp-error-icon">⚠️</span>
                            <h3>Please fix these issues:</h3>
                        </div>

                        <ul className="cp-error-list">
                            {errorMsgs.map((msg, idx) => (
                                <li key={idx}>{msg}</li>
                            ))}
                        </ul>

                        <div className="cp-modal-actions">
                            <button className="cp-error-ok-btn" onClick={() => setShowErrorModal(false)}>OK</button>
                        </div>

                    </div>
                </div>
            )}

        </section>
    )
}

export default CreateProject