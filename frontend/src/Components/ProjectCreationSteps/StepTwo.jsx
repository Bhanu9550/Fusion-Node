const ROLE_OPTIONS = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'UI/UX Designer', 'DevOps Engineer', 'QA Tester',
    'Database Engineer', 'AI/ML Engineer', 'Mobile Developer', 'Other'
]

const EXPERIENCE_OPTIONS = [
    'No Preference', 'Student', 'Fresher', 'Junior', 'Mid-Level', 'Senior'
]

const COMMITMENT_OPTIONS = [
    '5 hrs/week', '10 hrs/week', '15 hrs/week', 'Flexible'
]

const emptyRole = () => ({
    _frontendId: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `id-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    roleName: '',
    numberRequired: 1,
    responsibilities: '',
    skills: [],
    skillInput: '',
    experience: 'No Preference',
    commitment: 'Flexible',
})

const StepTwo = ({ project, handleValue }) => {

    const roles = project.roles

    const addRole = () => {
        handleValue('roles', [...roles, emptyRole()])
    }

    const removeRole = (id) => {
        handleValue('roles', roles.filter(role => role._frontendId !== id))
    }

    const updateRole = (id, field, value) => {
        handleValue('roles', roles.map(role =>
            role._frontendId === id ? { ...role, [field]: value } : role
        ))
    }

    const addSkill = (id) => {
        const role = roles.find(r => r._frontendId === id)
        if (!role || !role.skillInput.trim()) return

        handleValue('roles', roles.map(role =>
            role._frontendId === id
                ? { ...role, skills: [...role.skills, role.skillInput.trim()], skillInput: '' }
                : role
        ))
    }

    const removeSkill = (id, skill) => {
        handleValue('roles', roles.map(role =>
            role._frontendId === id
                ? { ...role, skills: role.skills.filter(s => s !== skill) }
                : role
        ))
    }

    return (
        <div className="cp-form">
            <h2 className="cp-step-title">② Build Your Team</h2>

            {roles.length === 0 && (
                <p className="cp-hint">
                    No roles added yet. Click below to add your first role.
                </p>
            )}

            <div className="cp-roles-list">
                {roles.map((role, index) => (

                    <div className="cp-role-card" key={role._frontendId}>

                        {/* Header */}
                        <div className="cp-role-card-header">
                            <span className="cp-role-card-title">
                                Role {index + 1}
                                {role.roleName && ` — ${role.roleName}`}
                            </span>
                            
                            <button
                                className="cp-role-delete-btn"
                                onClick={() => removeRole(role._frontendId)}>
                                🗑️
                            </button>
                        </div>

                        {/* Role Name + Number */}
                        <div className="cp-row-2">
                            <div className="cp-field">
                                <label className="cp-label">Role Name</label>
                                <select
                                    className="cp-select"
                                    value={role.roleName}

                                    onChange={(e) => updateRole(role._frontendId, 'roleName', e.target.value)}>
                                    <option value="">Select role</option>
                                    {ROLE_OPTIONS.map(role_name => (
                                        <option key={role_name}>{role_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="cp-field">
                                <label className="cp-label">Number Required</label>
                                <input
                                    className="cp-input"
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={role.numberRequired}
                                    onChange={(e) => updateRole(role._frontendId, 'numberRequired', e.target.value)} />
                            </div>
                        </div>

                        {/* Responsibilities */}
                        <div className="cp-field">
                            <label className="cp-label">Responsibilities</label>
                            <textarea
                                className="cp-textarea"
                                style={{ minHeight: '80px' }}
                                placeholder="e.g. Build responsive React pages, Integrate APIs..."
                                value={role.responsibilities}
                                onChange={(e) => updateRole(role._frontendId, 'responsibilities', e.target.value)}
                            />
                        </div>

                        {/* Skills */}
                        <div className="cp-field">
                            <label className="cp-label">Required Skills</label>
                            <div className="cp-skills-wrapper">

                                {/* Tags */}
                                {role.skills.length > 0 && (
                                    <div className="cp-skills-tags">
                                        {role.skills.map(skill => (
                                            <span className="cp-skill-tag" key={skill}>
                                                {skill}
                                                <button
                                                    className="cp-skill-remove"
                                                    onClick={() => removeSkill(role._frontendId, skill)}>
                                                    ✕
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Input */}
                                <div className="cp-skills-input-row">
                                    <input
                                        className="cp-input"
                                        type="text"
                                        placeholder="e.g. React, TypeScript..."
                                        value={role.skillInput}
                                        onChange={(e) => updateRole(role._frontendId, 'skillInput', e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                addSkill(role._frontendId)
                                            }
                                        }}
                                    />
                                    <button
                                        className="cp-add-skill-btn"
                                    
                                        onClick={() => addSkill(role._frontendId)}>
                                        + Add
                                    </button>
                                </div>

                            </div>
                        </div>

                        <div className="cp-row-2">
                            <div className="cp-field">
                                <label className="cp-label">Experience Required</label>
                                <select
                                    className="cp-select"
                                    value={role.experience}
                                    onChange={(e) => updateRole(role._frontendId, 'experience', e.target.value)}>
                                    {EXPERIENCE_OPTIONS.map(experience => (
                                        <option key={experience}>{experience}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="cp-field">
                                <label className="cp-label">Weekly Commitment</label>
                                <select
                                    className="cp-select"
                                    value={role.commitment}
                                    onChange={(e) => updateRole(role._frontendId, 'commitment', e.target.value)}>
                                    {COMMITMENT_OPTIONS.map(duration => (
                                        <option key={duration}>{duration}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {/* Add Role Button */}
            <button className="cp-add-role-btn" onClick={addRole}>
                ＋ Add Role
            </button>

        </div>
    )
}

export default StepTwo