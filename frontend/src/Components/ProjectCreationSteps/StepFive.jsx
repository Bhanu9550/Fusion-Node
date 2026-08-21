const StepFive = ({ project, onPreview }) => {

  const reviewItems = [
    { key: 'Project Name', value: project.name || '—' },
    { key: 'Tagline', value: project.tagline || '—' },
    { key: 'Category', value: project.category || '—' },
    { key: 'Stage', value: project.stage || '—' },
    { key: 'Visibility', value: project.visibility || '—' },
    { key: 'Repository', value: project.repositoryType === 'github' ? project.repositoryUrl || 'GitHub (no URL)' : 'No Repository' },
    { key: 'Demo Link', value: project.demoLink || '—' },
    { key: 'Banner', value: project.banner ? project.banner.name : '—' },
    { key: 'Logo', value: project.logo ? project.logo.name : '—' },
  ]

  const settingsItems = [
    { key: 'Recruitment', value: project.recruitmentStatus },
    { key: 'Who Can Apply', value: project.whoCanApply },
    { key: 'Max Team Size', value: project.maxTeamSize || '—' },
    { key: 'Join Approval', value: project.joinApproval },
    { key: 'Members Invite', value: project.membersCanInvite },
    { key: 'Leaving Policy', value: project.leavingPolicy },
    { key: 'Communication', value: project.communication || '—' },
    { key: 'Completion Date', value: project.completionDate || '—' },
  ]

  return (
    <div className="cp-form">
      <h2 className="cp-step-title">⑤ Review Your Project</h2>

      <div className="cp-review-section">

        {/* Project Info */}
        <div className="cp-review-block">
          <p className="cp-review-block-title">Project Information</p>
          {reviewItems.map(item => (
            <div className="cp-review-row" key={item.key}>
              <span className="cp-review-key">{item.key}</span>
              <span className="cp-review-value">{item.value}</span>
            </div>
          ))}
          {project.description && (
            <div className="cp-review-row">
              <span className="cp-review-key">Description</span>
              <span className="cp-review-value" style={{
                whiteSpace: 'pre-wrap',
                color: 'var(--gray-text)',
                fontSize: '12px',
                lineHeight: '1.6'
              }}>
                {project.description}
              </span>
            </div>
          )}
        </div>

        {/* Roles */}
        {project.roles.length > 0 && (
          <div className="cp-review-block">
            <p className="cp-review-block-title">Team Roles ({project.roles.length})</p>
            <div className="cp-review-roles-list">
              {project.roles.map((role, i) => (
                <div className="cp-review-role-item" key={role.id}>
                  <span className="cp-review-role-name">
                    {role.roleName || `Role ${i + 1}`}
                  </span>
                  <span className="cp-review-role-count">
                    Need {role.numberRequired} · {role.experience} · {role.commitment}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invited */}
        {project.invitedMembers.length > 0 && (
          <div className="cp-review-block">
            <p className="cp-review-block-title">Invited Members ({project.invitedMembers.length})</p>
            {project.invitedMembers.map(m => (
              <div className="cp-review-row" key={m._id}>
                <span className="cp-review-key">@{m.username}</span>
                <span className="cp-review-value">{m.assignedRole} · Pending</span>
              </div>
            ))}
          </div>
        )}

        {/* Settings */}
        <div className="cp-review-block">
          <p className="cp-review-block-title">Project Settings</p>
          {settingsItems.map(item => (
            <div className="cp-review-row" key={item.key}>
              <span className="cp-review-key">{item.key}</span>
              <span className="cp-review-value">{item.value}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Preview Button */}
      <button className="cp-preview-btn" onClick={onPreview}>
        👁️ Preview Project Page
      </button>

    </div>
  )
}

export default StepFive