import { useState } from 'react'
import api from '../../Configure/axiosConfigure'
import './LeaveRequestModal.css'

const LeaveRequestModal = ({ projectId, projectName, onClose, onSubmitted }) => {

    const [subject, setSubject] = useState('')
    const [description, setDescription] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit() {
        if (!subject.trim() || isSubmitting) return
        setIsSubmitting(true)
        setError('')
        try {
            await api.post(`/projects/${projectId}/leave-request`, { subject, description })
            onSubmitted?.()
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit leave request')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="lrm-overlay" onClick={onClose}>
            <div className="lrm-modal" onClick={(e) => e.stopPropagation()}>

                <div className="lrm-header">
                    <span className="lrm-title">Request to Leave</span>
                    <button className="lrm-close-btn" onClick={onClose}>✕</button>
                </div>

                <p className="lrm-hint">
                    {projectName ? `"${projectName}" requires` : 'This project requires'} owner approval before you can leave. Submit a request below.
                </p>

                <div className="lrm-body">
                    <div className="lrm-field">
                        <label className="lrm-label">Subject *</label>
                        <input
                            className="lrm-input"
                            placeholder="e.g. Stepping away due to time constraints"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    <div className="lrm-field">
                        <label className="lrm-label">Description</label>
                        <textarea
                            className="lrm-textarea"
                            rows={4}
                            placeholder="Add any context for the project owner (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {error && <div className="lrm-error">{error}</div>}
                </div>

                <div className="lrm-footer">
                    <button className="lrm-btn-cancel" onClick={onClose}>Cancel</button>
                    <button
                        className="lrm-btn-submit"
                        disabled={!subject.trim() || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? 'Submitting…' : 'Submit Request'}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default LeaveRequestModal
