import { useState } from 'react'
import api from '../../Configure/axiosConfigure'
import { CATEGORY_OPTIONS } from '../ProjectFilters/ProjectFilters'
import './EditProjectModal.css'

const STAGE_OPTIONS = ['💡 Idea', '📋 Planning', '💻 Development', '🧪 Testing', '🚀 Deployment', '✅ Completed']
const COMMUNICATION_OPTIONS = ['Built-in Chat', 'Discord', 'Slack', 'Google Meet']

const EditProjectModal = ({ project, onClose, onSaved }) => {

    const [form, setForm] = useState({
        name: project.name || '',
        tagline: project.tagline || '',
        description: project.description || '',
        category: project.category || '',
        stage: project.stage || '',
        recruitmentStatus: project.recruitmentStatus || 'open',
        communication: project.communication || 'Built-in Chat',
        communicationLink: project.communicationLink || '',
        repositoryUrl: project.repositoryUrl || '',
        demoLink: project.demoLink || '',
    })
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')

    function update(field, value) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    async function handleSave() {
        setIsSaving(true)
        setError('')
        try {
            const res = await api.patch(`/projects/${project._id}`, form)
            onSaved(res.data.project)
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save changes')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="epm-overlay" onClick={onClose}>
            <div className="epm-modal" onClick={(e) => e.stopPropagation()}>

                <div className="epm-header">
                    <span className="epm-title">Edit Project</span>
                    <button className="epm-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="epm-body">
                    <div className="epm-field">
                        <label className="epm-label">Project Name</label>
                        <input className="epm-input" value={form.name} onChange={(e) => update('name', e.target.value)} />
                    </div>

                    <div className="epm-field">
                        <label className="epm-label">Tagline</label>
                        <input className="epm-input" value={form.tagline} onChange={(e) => update('tagline', e.target.value)} />
                    </div>

                    <div className="epm-field">
                        <label className="epm-label">Description</label>
                        <textarea className="epm-textarea" rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} />
                    </div>

                    <div className="epm-row">
                        <div className="epm-field">
                            <label className="epm-label">Category</label>
                            <select className="epm-select" value={form.category} onChange={(e) => update('category', e.target.value)}>
                                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="epm-field">
                            <label className="epm-label">Stage</label>
                            <select className="epm-select" value={form.stage} onChange={(e) => update('stage', e.target.value)}>
                                {STAGE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="epm-row">
                        <div className="epm-field">
                            <label className="epm-label">Recruitment Status</label>
                            <select className="epm-select" value={form.recruitmentStatus} onChange={(e) => update('recruitmentStatus', e.target.value)}>
                                <option value="open">Open</option>
                                <option value="paused">Paused</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                        <div className="epm-field">
                            <label className="epm-label">Communication</label>
                            <select className="epm-select" value={form.communication} onChange={(e) => update('communication', e.target.value)}>
                                {COMMUNICATION_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {form.communication !== 'Built-in Chat' && (
                        <div className="epm-field">
                            <label className="epm-label">{form.communication} Invite Link</label>
                            <input
                                className="epm-input"
                                placeholder={`Paste your ${form.communication} invite link`}
                                value={form.communicationLink}
                                onChange={(e) => update('communicationLink', e.target.value)}
                            />
                        </div>
                    )}

                    <div className="epm-row">
                        <div className="epm-field">
                            <label className="epm-label">Repository URL</label>
                            <input className="epm-input" value={form.repositoryUrl} onChange={(e) => update('repositoryUrl', e.target.value)} />
                        </div>
                        <div className="epm-field">
                            <label className="epm-label">Demo Link</label>
                            <input className="epm-input" value={form.demoLink} onChange={(e) => update('demoLink', e.target.value)} />
                        </div>
                    </div>

                    {error && <div className="epm-error">{error}</div>}
                </div>

                <div className="epm-footer">
                    <button className="epm-btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="epm-btn-save" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default EditProjectModal
