const EditStepInfo = ({ project, handleValue }) => {
    return (
        <div className="cp-form">
            <h2 className="cp-step-title">① Project Info</h2>
            <p className="cp-hint">
                Name, category, stage, and links were set at creation and can't be changed here.
            </p>

            {/* ── Read-only fields ── */}
            <div className="edp-readonly-grid">
                <div className="edp-readonly-item">
                    <span className="edp-readonly-label">Project Name</span>
                    <span className="edp-readonly-value">{project.name}</span>
                </div>
                <div className="edp-readonly-item">
                    <span className="edp-readonly-label">Tagline</span>
                    <span className="edp-readonly-value">{project.tagline}</span>
                </div>
                <div className="edp-readonly-item">
                    <span className="edp-readonly-label">Category</span>
                    <span className="edp-readonly-value">{project.category}</span>
                </div>
                <div className="edp-readonly-item">
                    <span className="edp-readonly-label">Stage</span>
                    <span className="edp-readonly-value">{project.stage}</span>
                </div>
                {project.repositoryUrl && (
                    <div className="edp-readonly-item">
                        <span className="edp-readonly-label">Repository</span>
                        <span className="edp-readonly-value">{project.repositoryUrl}</span>
                    </div>
                )}
                {project.demoLink && (
                    <div className="edp-readonly-item">
                        <span className="edp-readonly-label">Demo Link</span>
                        <span className="edp-readonly-value">{project.demoLink}</span>
                    </div>
                )}
            </div>

            <hr className="cp-settings-divider" />

            {/* ── Editable: Description ── */}
            <div className="cp-field">
                <label className="cp-label">Project Description <span>*</span></label>
                <textarea
                    className="cp-textarea"
                    value={project.description}
                    onChange={(e) => handleValue('description', e.target.value)}
                />
            </div>

            {/* ── Editable: Visibility ── */}
            <div className="cp-field">
                <label className="cp-label">Visibility <span>*</span></label>
                <div className="cp-radio-group">
                    {['public', 'private'].map((v) => (
                        <label key={v} className={`cp-radio-option ${project.visibility === v ? 'cp-radio-selected' : ''}`}>
                            <input
                                type="radio"
                                name="visibility"
                                value={v}
                                checked={project.visibility === v}
                                onChange={() => handleValue('visibility', v)}
                            />
                            {v === 'public' ? '🌐 Public' : '🔒 Private'}
                        </label>
                    ))}
                </div>
                <p className="cp-hint">
                    {project.visibility === 'private'
                        ? '🔒 Only you can see this project on the Browse Projects page.'
                        : '🌐 Anyone can find and view this project.'}
                </p>
            </div>

            {/* ── Editable: Project Logo (New) ── */}
            <div className="cp-field">
                <label className="cp-label">Project Logo</label>
                <label className="cp-file-upload">
                    <span className="cp-file-icon">🎨</span>
                    <div className="cp-file-info">
                        <span className="cp-file-label">
                            {project.logo ? project.logo.name : (project.logoUrl ? 'Replace current logo' : 'Upload Project Logo')}
                        </span>
                        <span className="cp-file-sub">PNG, JPG up to 5MB</span>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleValue('logo', e.target.files[0] || null)}
                    />
                </label>
            </div>

            {/* ── Editable: Banner ── */}
            <div className="cp-field">
                <label className="cp-label">Banner Image</label>
                <label className="cp-file-upload">
                    <span className="cp-file-icon">🖼️</span>
                    <div className="cp-file-info">
                        <span className="cp-file-label">
                            {project.banner ? project.banner.name : (project.bannerImageUrl ? 'Replace current banner' : 'Upload Banner')}
                        </span>
                        <span className="cp-file-sub">PNG, JPG up to 5MB</span>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleValue('banner', e.target.files[0] || null)}
                    />
                </label>
            </div>
        </div>
    )
}

export default EditStepInfo