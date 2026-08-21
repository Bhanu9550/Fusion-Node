import { useContext, useState } from 'react'
import UserSearchInvite from '../UserSearchInvite/UserSearchInvite'
import AuthContext from '../../Context/AuthContext'

const StepThree = ({ project, handleValue }) => {

    const { User } = useContext(AuthContext)


    const roles = project.roles
    const invitedList = project.invitedMembers
    const hasRoles = roles.length > 0

    const [selectedUser, setSelectedUser] = useState(null)
    const [selectedRole, setSelectedRole] = useState('')
    const [inviteError, setInviteError] = useState('')

    // ── Handle Invite ──
    const handleInvite = () => {
        if (!selectedUser) {
            setInviteError('Please select a user first.')
            return
        }
        if (!selectedRole) {
            setInviteError('Please select a role.')
            return
        }

        // Already invited check
        const alreadyInvited = invitedList.find(i => i._id === selectedUser._id)
        if (alreadyInvited) {
            setInviteError(`@${selectedUser.username} is already invited.`)
            return
        }

        setInviteError('')

        handleValue('invitedMembers', [
            ...invitedList,
            {
                userId: selectedUser._id,
                username: selectedUser.username,
                fullname: selectedUser.fullname || selectedUser.name || '',
                profilePic: selectedUser.profilePic || null,
                assignedRole: selectedRole,
                status: 'Pending',
                invitedBy : User._id,
            }
        ])

        // Reset
        setSelectedUser(null)
        setSelectedRole('')
    }

    // ── Remove Invited ──
    const handleRemove = (id) => {
        handleValue('invitedMembers', invitedList.filter(i => i._id !== id))
    }

    // ── Vacancy Calc ──
    const getVacancy = (roleName) => {
        const role = roles.find(r => r.roleName === roleName)
        const need = role ? parseInt(role.numberRequired) : 0
        const invited = invitedList.filter(i => i.assignedRole === roleName).length
        const remaining = Math.max(0, need - invited)
        return { need, invited, remaining }
    }

    return (
        <div className="cp-form">
            <h2 className="cp-step-title">
                ③ Invite Developers
                <span style={{
                    fontSize: '13px',
                    color: 'var(--gray-text)',
                    fontWeight: 400
                }}>
                    {' '}(Optional)
                </span>
            </h2>

            {/* ── No Roles Warning ── */}
            {!hasRoles && (
                <div className="cp-invite-warning">
                    ⚠️ Please add at least one role in Step 2 before inviting members.
                </div>
            )}

            {/* ── Search User ── */}
            <div className="cp-field">
                <label className="cp-label">Search by Username</label>
                <UserSearchInvite
                    placeholder="Search people with usernames..."
                    disabled={!hasRoles}
                    onSelect={(user) => {
                        setSelectedUser(user)
                        setInviteError('')
                    }}
                />
            </div>

            {/* ── Role Select + Invite Button ── */}
            <div className="cp-row-2">
                <div className="cp-field">
                    <label className="cp-label">Assign Role</label>
                    <select
                        className="cp-select"
                        value={selectedRole}
                        disabled={!hasRoles}
                        onChange={(e) => {
                            setSelectedRole(e.target.value)
                            setInviteError('')
                        }}
                    >
                        <option value="">Select role</option>
                        {roles.filter(r => r.roleName).map(r => (
                            <option key={r.id} value={r.roleName}>
                                {r.roleName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="cp-field">
                    <label className="cp-label" style={{ opacity: 0 }}>.</label>
                    <button
                        className={`cp-invite-btn ${!hasRoles || !selectedUser || !selectedRole
                                ? 'cp-invite-btn-disabled'
                                : ''
                            }`}
                        disabled={!hasRoles || !selectedUser || !selectedRole}
                        onClick={handleInvite}
                    >
                        + Invite
                    </button>
                </div>
            </div>

            {/* ── Error Message ── */}
            {inviteError && (
                <p className="cp-invite-error">⚠️ {inviteError}</p>
            )}

            {/* ── Invited List ── */}
            {invitedList.length > 0 && (
                <div className="cp-field">
                    <label className="cp-label">
                        Invited Members ({invitedList.length})
                    </label>
                    <div className="cp-invited-list">
                        {invitedList.map(member => (
                            <div className="cp-invited-card" key={member._id}>

                                {/* Avatar */}
                                <div className="cp-invited-avatar">
                                    {member.profilePic ? (
                                        <img
                                            src={member.profilePic}
                                            alt={member.username}
                                            className="cp-invited-avatar-img"
                                        />
                                    ) : (
                                        <span>
                                            {member.username?.[0]?.toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="cp-invited-info">
                                    <span className="cp-invited-username">
                                        @{member.username}
                                    </span>
                                    <span className="cp-invited-role">
                                        {member.assignedRole}
                                    </span>
                                </div>

                                {/* Status */}
                                <span className="cp-invited-status">
                                    Pending
                                </span>

                                {/* Remove */}
                                <button
                                    className="cp-invited-remove"
                                    onClick={() => handleRemove(member._id)}
                                >
                                    ✕
                                </button>

                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Vacancy Summary ── */}
            {roles.filter(r => r.roleName).length > 0 && (
                <div className="cp-field">
                    <label className="cp-label">Vacancy Summary</label>
                    <div className="cp-vacancy-summary">
                        {roles.filter(r => r.roleName).map(role => {
                            const { need, invited, remaining } = getVacancy(role.roleName)
                            return (
                                <div className="cp-vacancy-row" key={role.id}>
                                    <span className="cp-vacancy-role-name">
                                        {role.roleName}
                                    </span>
                                    <div className="cp-vacancy-counts">
                                        <div className="cp-vacancy-stat">
                                            <span className="cp-vacancy-stat-label">Need</span>
                                            <span className="cp-vacancy-stat-value">
                                                {need}
                                            </span>
                                        </div>
                                        <div className="cp-vacancy-stat">
                                            <span className="cp-vacancy-stat-label">Invited</span>
                                            <span className="cp-vacancy-stat-value yellow">
                                                {invited}
                                            </span>
                                        </div>
                                        <div className="cp-vacancy-stat">
                                            <span className="cp-vacancy-stat-label">Remaining</span>
                                            <span className={`cp-vacancy-stat-value ${remaining === 0 ? 'green' : 'red'
                                                }`}>
                                                {remaining}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

        </div>
    )
}

export default StepThree