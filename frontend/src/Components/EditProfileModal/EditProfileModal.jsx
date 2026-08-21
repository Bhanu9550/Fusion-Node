import { useState, useContext } from 'react'
import AuthContext from '../../Context/AuthContext'
import api from '../../Configure/axiosConfigure'
import './EditProfileModal.css'

const EditProfileModal = ({ onClose, onSaved }) => {

    const { User, setUser } = useContext(AuthContext)

    const [form, setForm] = useState({
        fullname: User.fullname || '',
        bio: User.bio || '',
        designation: User.designation || '',
        company: User.company || '',
        location: User.location || '',
        website: User.website || '',
        github: User.github || '',
        linkedin: User.linkedin || '',
        portfolio: User.portfolio || '',
        isPrivate: User.isPrivate || false,
    })
    const [profileFile, setProfileFile] = useState(null)
    const [coverFile, setCoverFile] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')

    function update(field, value) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    async function handleSave() {
        setIsSaving(true)
        setError('')
        try {
            const formData = new FormData()
            Object.entries(form).forEach(([key, value]) => formData.append(key, value))
            if (profileFile) formData.append('profilePicture', profileFile)
            if (coverFile) formData.append('coverPicture', coverFile)

            const res = await api.patch('/users/me', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            setUser?.(res.data.user)
            onSaved?.(res.data.user)
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save profile')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="epfm-overlay" onClick={onClose}>
            <div className="epfm-modal" onClick={(e) => e.stopPropagation()}>

                <div className="epfm-header">
                    <span className="epfm-title">Edit Profile</span>
                    <button className="epfm-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="epfm-body">

                    <div className="epfm-field">
                        <label className="epfm-label">Profile Picture</label>

                        <label className="epfm-upload-box">
                            <span className="epfm-upload-icon">🎨</span>

                            <span className="epfm-upload-content">
                                <strong>
                                    {profileFile ? profileFile.name : "Upload Profile Picture"}
                                </strong>
                                <small>PNG, JPG up to 5MB</small>
                            </span>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setProfileFile(e.target.files[0])}
                            />
                        </label>
                    </div>

                    <div className="epfm-field">
                        <label className="epfm-label">Cover Picture</label>

                        <label className="epfm-upload-box">
                            <span className="epfm-upload-icon">🖼️</span>

                            <span className="epfm-upload-content">
                                <strong>
                                    {coverFile ? coverFile.name : "Upload Cover Picture"}
                                </strong>
                                <small>PNG, JPG up to 5MB</small>
                            </span>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setCoverFile(e.target.files[0])}
                            />
                        </label>
                    </div>

                    <div className="epfm-field">
                        <label className="epfm-label">Full Name</label>
                        <input className="epfm-input" value={form.fullname} onChange={(e) => update('fullname', e.target.value)} />
                    </div>

                    <div className="epfm-field">
                        <label className="epfm-label">Bio</label>
                        <textarea className="epfm-textarea" rows={3} value={form.bio} onChange={(e) => update('bio', e.target.value)} />
                    </div>

                    <div className="epfm-row">
                        <div className="epfm-field">
                            <label className="epfm-label">Designation</label>
                            <input className="epfm-input" value={form.designation} onChange={(e) => update('designation', e.target.value)} />
                        </div>
                        <div className="epfm-field">
                            <label className="epfm-label">Company</label>
                            <input className="epfm-input" value={form.company} onChange={(e) => update('company', e.target.value)} />
                        </div>
                    </div>

                    <div className="epfm-row">
                        <div className="epfm-field">
                            <label className="epfm-label">Location</label>
                            <input className="epfm-input" value={form.location} onChange={(e) => update('location', e.target.value)} />
                        </div>
                        <div className="epfm-field">
                            <label className="epfm-label">Website</label>
                            <input className="epfm-input" value={form.website} onChange={(e) => update('website', e.target.value)} />
                        </div>
                    </div>

                    <div className="epfm-row">
                        <div className="epfm-field">
                            <label className="epfm-label">GitHub</label>
                            <input className="epfm-input" value={form.github} onChange={(e) => update('github', e.target.value)} />
                        </div>
                        <div className="epfm-field">
                            <label className="epfm-label">LinkedIn</label>
                            <input className="epfm-input" value={form.linkedin} onChange={(e) => update('linkedin', e.target.value)} />
                        </div>
                    </div>

                    <div className="epfm-field">
                        <label className="epfm-label">Portfolio</label>
                        <input className="epfm-input" value={form.portfolio} onChange={(e) => update('portfolio', e.target.value)} />
                    </div>

                    <label className="epfm-toggle-row">
                        <div>
                            <span className="epfm-label">Private Profile</span>
                            <p className="epfm-toggle-hint">Followers must be approved before they can see your full profile</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={form.isPrivate}
                            onChange={(e) => update('isPrivate', e.target.checked)}
                        />
                    </label>

                    {error && <div className="epfm-error">{error}</div>}
                </div>

                <div className="epfm-footer">
                    <button className="epfm-btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="epfm-btn-save" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default EditProfileModal
