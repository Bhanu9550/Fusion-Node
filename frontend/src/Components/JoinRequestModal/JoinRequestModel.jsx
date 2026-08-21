// JoinRequestModal.jsx
import { useState, useContext, useEffect } from 'react'
import AuthContext from '../../Context/AuthContext'
import api from '../../Configure/axiosConfigure'
import './JoinRequestModel.css'

const JoinRequestModal = ({ project, onClose }) => {

    const { User } = useContext(AuthContext)
    const [isSuccess, setIsSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    // ── State initialises fresh every mount because parent passes key={project._id} ──
    const [form, setForm] = useState({
        role:          '',
        name:          User?.fullname || User?.username || '',
        subject:       '',
        description:   '',
        resume:        null,
        portfolioLink: '',
        githubProfile: '',
        availability:  'full_time',
    })

    useEffect(() => {
        if (form.role) {
            setForm(prev => ({
                ...prev,
                subject: `Request to Join ${project.name} as ${form.role}`,
                description: `Hello,\n\nI am interested in joining this project as ${form.role}.\n\nI have experience in the relevant technologies and believe I can contribute effectively to the team's goals.\n\nLooking forward to your response.\n\nThank you.`
            }))
        } else {
            setForm(prev => ({
                ...prev,
                subject:     '',
                description: ''
            }))
        }
    }, [form.role, project.name])

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        if (!form.role || isSubmitting) return
        setIsSubmitting(true)
        setError('')
        try {
            await api.post(`/projects/${project._id}/apply`, {
                roleName: form.role,
                message: form.description,
                portfolioLink: form.portfolioLink,
                githubProfile: form.githubProfile,
                availability: form.availability,
            })
            setIsSuccess(true)
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // ── Success State ──
    if (isSuccess) {
        return (
            <div className="jrm-overlay" onClick={onClose}>
                <div
                    className="jrm-modal jrm-success-modal"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="jrm-success-icon">✅</div>
                    <h2 className="jrm-success-title">Request Sent Successfully</h2>
                    <p className="jrm-success-sub">
                        Your request has been sent to the project owner.
                    </p>
                    <div className="jrm-success-status">
                        <span className="jrm-status-dot" />
                        <span className="jrm-status-text">Pending Review</span>
                    </div>
                    <button className="jrm-btn-close-success" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="jrm-overlay" onClick={onClose}>
            <div
                className="jrm-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="jrm-header">
                    <h2 className="jrm-title">Join Project Request</h2>
                    <button className="jrm-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="jrm-divider" />

                <div className="jrm-body">

                    <div className="jrm-field">
                        <label className="jrm-label">Project</label>
                        <div className="jrm-readonly">
                            <span className="jrm-readonly-icon">🚀</span>
                            <span className="jrm-readonly-text">{project.name}</span>
                        </div>
                    </div>

                    <div className="jrm-field">
                        <label className="jrm-label">
                            Role Applying For
                            <span className="jrm-required">*</span>
                        </label>
                        <select
                            className="jrm-select"
                            value={form.role}
                            onChange={(e) => handleChange('role', e.target.value)}
                        >
                            <option value="">Select a role</option>
                            {project.roles?.filter(r => r.roleName && !r.isFilled).map(role => (
                                <option key={role._id} value={role.roleName}>
                                    {role.roleName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="jrm-field">
                        <label className="jrm-label">Your Name</label>
                        <input
                            className="jrm-input"
                            type="text"
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                    </div>

                    <div className="jrm-field">
                        <label className="jrm-label">
                            Subject
                            <span className="jrm-auto-tag">Auto generated</span>
                        </label>
                        <input
                            className="jrm-input"
                            type="text"
                            placeholder="Select a role first..."
                            value={form.subject}
                            onChange={(e) => handleChange('subject', e.target.value)}
                        />
                    </div>

                    <div className="jrm-field">
                        <label className="jrm-label">Description</label>
                        <textarea
                            className="jrm-textarea"
                            placeholder="Select a role to auto-fill..."
                            value={form.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                    </div>

                    <div className="jrm-field">
                        <label className="jrm-label">
                            Portfolio Link
                            <span className="jrm-optional">Optional</span>
                        </label>
                        <input
                            className="jrm-input"
                            type="url"
                            placeholder="https://yourportfolio.com"
                            value={form.portfolioLink}
                            onChange={(e) => handleChange('portfolioLink', e.target.value)}
                        />
                    </div>

                    <div className="jrm-field">
                        <label className="jrm-label">GitHub Profile</label>
                        <input
                            className="jrm-input"
                            type="url"
                            placeholder="https://github.com/username"
                            value={form.githubProfile}
                            onChange={(e) => handleChange('githubProfile', e.target.value)}
                        />
                    </div>

                    <div className="jrm-field">
                        <label className="jrm-label">Availability</label>
                        <div className="jrm-radio-group">
                            {[
                                { value: 'full_time', label: '🕐 Full Time' },
                                { value: 'part_time', label: '🕑 Part Time' },
                                { value: 'weekends',  label: '📅 Weekends'  },
                            ].map(opt => (
                                <label
                                    key={opt.value}
                                    className={`jrm-radio-option ${form.availability === opt.value ? 'jrm-radio-selected' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="availability"
                                        value={opt.value}
                                        checked={form.availability === opt.value}
                                        onChange={() => handleChange('availability', opt.value)}
                                    />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>

                </div>

                <div className="jrm-divider" />

                {error && <div className="jrm-error-banner">{error}</div>}

                <div className="jrm-footer">
                    <button className="jrm-btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={`jrm-btn-submit ${!form.role || isSubmitting ? 'jrm-btn-disabled' : ''}`}
                        disabled={!form.role || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? 'Submitting…' : 'Submit Request'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default JoinRequestModal