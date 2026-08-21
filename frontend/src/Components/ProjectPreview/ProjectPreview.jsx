import './ProjectPreview.css'

const ProjectPreview = ({ project, onClose }) => {

  const stageColorMap = {
    '💡 Idea':        '#f59e0b',
    '📋 Planning':    '#3b82f6',
    '💻 Development': '#a855f7',
    '🧪 Testing':     '#14b8a6',
    '🚀 Deployment':  '#22c55e',
    '✅ Completed':   '#22c55e',
  }

  const stageColor = stageColorMap[project.stage] || 'var(--main-green)'

  return (
    <div className="pv-overlay">

      {/* Close Bar */}
      <div className="pv-topbar">
        <span className="pv-preview-badge">👁️ Preview Mode</span>
        <button className="pv-close-btn" onClick={onClose}>
          ✕ Back to Review
        </button>
      </div>

      {/* Page Content */}
      <div className="pv-page">

        {/* Banner */}
        <div className="pv-banner">
          {project.banner ? (
            <img src={URL.createObjectURL(project.banner)} alt="banner" className="pv-banner-img" />
          ) : (
            <div className="pv-banner-placeholder" />
          )}

          {/* Logo overlay */}
          <div className="pv-logo-wrapper">
            {project.logo ? (
              <img src={URL.createObjectURL(project.logo)} alt="logo" className="pv-logo-img" />
            ) : (
              <div className="pv-logo-fallback">
                {project.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="pv-container">

          {/* Header */}
          <div className="pv-header">
            <div className="pv-header-left">
              <div className="pv-badges">
                <span className="pv-badge pv-badge-stage" style={{ borderColor: stageColor, color: stageColor }}>
                  {project.stage || 'Stage'}
                </span>
                <span className="pv-badge pv-badge-visibility">
                  {project.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                </span>
                <span className="pv-badge pv-badge-recruitment">
                  🟢 {project.recruitmentStatus?.charAt(0).toUpperCase() + project.recruitmentStatus?.slice(1) || 'Open'}
                </span>
              </div>
              <h1 className="pv-project-name">{project.name || 'Untitled Project'}</h1>
              <p className="pv-tagline">{project.tagline || 'No tagline provided.'}</p>
            </div>

            <div className="pv-header-actions">
              <button className="pv-btn-secondary">❤️ Like</button>
              <button className="pv-btn-primary">Apply to Join</button>
            </div>
          </div>

          {/* Body Grid */}
          <div className="pv-body">

            {/* Left — Main Info */}
            <div className="pv-main">

              {/* About */}
              <div className="pv-section">
                <h3 className="pv-section-title">About This Project</h3>
                <p className="pv-description">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              {/* Roles */}
              {project.roles.length > 0 && (
                <div className="pv-section">
                  <h3 className="pv-section-title">Open Roles</h3>
                  <div className="pv-roles-list">
                    {project.roles.map((role) => (
                      <div className="pv-role-card" key={role.id}>
                        <div className="pv-role-header">
                          <span className="pv-role-name">{role.roleName || 'Unnamed Role'}</span>
                          <span className="pv-role-slots">
                            {role.numberRequired} slot{role.numberRequired > 1 ? 's' : ''}
                          </span>
                        </div>
                        {role.responsibilities && (
                          <p className="pv-role-responsibilities">{role.responsibilities}</p>
                        )}
                        {role.skills.length > 0 && (
                          <div className="pv-skills-row">
                            {role.skills.map(skill => (
                              <span className="pv-skill-tag" key={skill}>{skill}</span>
                            ))}
                          </div>
                        )}
                        <div className="pv-role-meta">
                          <span>🎯 {role.experience}</span>
                          <span>⏱️ {role.commitment}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right — Sidebar */}
            <div className="pv-sidebar">

              {/* Project Details */}
              <div className="pv-sidebar-card">
                <h4 className="pv-sidebar-title">Project Details</h4>
                <div className="pv-detail-list">
                  <div className="pv-detail-row">
                    <span className="pv-detail-key">📁 Category</span>
                    <span className="pv-detail-value">{project.category || '—'}</span>
                  </div>
                  <div className="pv-detail-row">
                    <span className="pv-detail-key">🚀 Stage</span>
                    <span className="pv-detail-value">{project.stage || '—'}</span>
                  </div>
                  <div className="pv-detail-row">
                    <span className="pv-detail-key">👥 Who Can Apply</span>
                    <span className="pv-detail-value">{project.whoCanApply || '—'}</span>
                  </div>
                  <div className="pv-detail-row">
                    <span className="pv-detail-key">🌍 Communication</span>
                    <span className="pv-detail-value">{project.communication || '—'}</span>
                  </div>
                  {project.completionDate && (
                    <div className="pv-detail-row">
                      <span className="pv-detail-key">📅 Target Date</span>
                      <span className="pv-detail-value">{project.completionDate}</span>
                    </div>
                  )}
                  {project.demoLink && (
                    <div className="pv-detail-row">
                      <span className="pv-detail-key">🔗 Demo</span>
                      <a
                        className="pv-detail-link"
                        href={project.demoLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visit Site ↗
                      </a>
                    </div>
                  )}
                  {project.repositoryType === 'github' && project.repositoryUrl && (
                    <div className="pv-detail-row">
                      <span className="pv-detail-key">🐙 Repository</span>
                      <a
                        className="pv-detail-link"
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        GitHub ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Slots */}
              {project.roles.length > 0 && (
                <div className="pv-sidebar-card">
                  <h4 className="pv-sidebar-title">Team Slots</h4>
                  <div className="pv-detail-list">
                    {project.roles.filter(r => r.roleName).map(role => (
                      <div className="pv-detail-row" key={role.id}>
                        <span className="pv-detail-key">{role.roleName}</span>
                        <span className="pv-detail-value pv-slot-open">
                          {role.numberRequired} open
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectPreview