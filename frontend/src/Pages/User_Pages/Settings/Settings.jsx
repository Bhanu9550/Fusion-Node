import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SideNavbar from '../../../Components/SideNavbar/SideNavbar'
import TopNavbar from '../../../Components/TopNavbar/TopNavbar'
import BottomNavbar from '../../../Components/BottomNavbar/BottomNavbar'
import AuthContext from '../../../Context/AuthContext'
import api from '../../../Configure/axiosConfigure'
import ConfirmModal from '../../../Components/ConfirmModal/ConfirmModal'
import './Settings.css'

const ToggleRow = ({ label, hint, checked, onChange }) => (
    <label className="stg-toggle-row">
        <div className="stg-toggle-text">
            <span className="stg-toggle-label">{label}</span>
            {hint && <span className="stg-toggle-hint">{hint}</span>}
        </div>
        <input type="checkbox" checked={checked} onChange={onChange} />
    </label>
)

const Settings = () => {

    const { User, setUser } = useContext(AuthContext)
    const navigate = useNavigate()

    const [isPrivate, setIsPrivate] = useState(!!User.isPrivate)
    const [isSaving, setIsSaving] = useState(false)
    const [savedMessage, setSavedMessage] = useState('')
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    async function persist(updates) {
        setIsSaving(true)
        setSavedMessage('')
        try {
            const formData = new FormData()
            Object.entries(updates).forEach(([key, value]) => formData.append(key, value))
            const res = await api.patch('/users/me', formData)
            setUser?.(res.data.user)
            setSavedMessage('Saved')
            setTimeout(() => setSavedMessage(''), 1500)
        } catch (err) {
            console.error(err)
        } finally {
            setIsSaving(false)
        }
    }

    async function handleLogout() {
        setIsLoggingOut(true)
        try {
            await api.post('/logout')
        } catch (err) {
            console.error(err)
        } finally {
            window.location.href = '/signIn'
        }
    }

    return (
        <section className="page-wrapper">
            <SideNavbar />

            <div className="right-dashboard">
                <TopNavbar />

                <div className="stg-page">
                    <h1 className="stg-title">Settings</h1>
                    <p className="stg-subtitle">Manage your notifications, privacy, and account.</p>

                    <div className="stg-card">
                        <h3 className="stg-card-title">Privacy</h3>
                        <ToggleRow
                            label="Private Profile"
                            hint="New followers need your approval before they can see your projects"
                            checked={isPrivate}
                            onChange={(e) => {
                                setIsPrivate(e.target.checked)
                                persist({ isPrivate: e.target.checked })
                            }}
                        />
                    </div>

                    <div className="stg-card">
                        <h3 className="stg-card-title">Account</h3>
                        <button className="stg-link-row" onClick={() => navigate(`/profile/${User.username}`)}>
                            <span>View my profile</span>
                            <span className="stg-chevron">›</span>
                        </button>
                        <button className="stg-link-row" onClick={() => navigate('/projects/mine')}>
                            <span>Manage my projects</span>
                            <span className="stg-chevron">›</span>
                        </button>
                        <button className="stg-link-row stg-link-row-danger" onClick={() => setShowLogoutConfirm(true)}>
                            <span>Log out</span>
                            <span className="stg-chevron">›</span>
                        </button>
                    </div>

                    {(isSaving || savedMessage) && (
                        <div className="stg-save-indicator">{isSaving ? 'Saving…' : savedMessage}</div>
                    )}

                    <div className="stg-about">
                        <h3 className="stg-card-title">About FusionNode</h3>
                        <p className="stg-about-text">
                            FusionNode helps developers find teammates, build side projects, and ship together.
                        </p>
                        <p className="stg-version">Version 1.0.0</p>
                    </div>
                </div>
            </div>

            <BottomNavbar />

            {showLogoutConfirm && (
                <ConfirmModal
                    title="Log out?"
                    message="You'll need to sign in again to access your dashboard."
                    confirmLabel="Log Out"
                    danger
                    isBusy={isLoggingOut}
                    onConfirm={handleLogout}
                    onCancel={() => setShowLogoutConfirm(false)}
                />
            )}
        </section>
    )
}

export default Settings
