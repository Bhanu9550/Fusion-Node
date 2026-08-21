const StepOne = ({ project, handleValue }) => {
  return (
    <div className="cp-form">
      <h2 className="cp-step-title">① Project Information</h2>

      {/* Name */}
      <div className="cp-field">
        <label className="cp-label">Project Name <span>*</span></label>
        <input
          className="cp-input"
          type="text"
          placeholder="e.g. DevCollab"
          value={project.name}
          onChange={(e) => handleValue('name', e.target.value)}
        />
      </div>

      {/* Tagline */}
      <div className="cp-field">
        <label className="cp-label">Project Tagline <span>*</span></label>
        <input
          className="cp-input"
          type="text"
          placeholder="e.g. A collaborative platform for developers."
          maxLength={100}
          value={project.tagline}
          onChange={(e) => handleValue('tagline', e.target.value)}
        />
        <span className="cp-char-count">{project.tagline.length} / 100</span>
      </div>

      {/* Description */}
      <div className="cp-field">
        <label className="cp-label">Project Description <span>*</span></label>
        <textarea
          className="cp-textarea"
          placeholder={`What is the project?\nWhy is it being built?\nWhat problem does it solve?\nWhat is the final goal?\nWhy should someone join?`}
          value={project.description}
          onChange={(e) => handleValue('description', e.target.value)}
        />
      </div>

      {/* Category and Stage */}
      <div className="cp-row-2">
        <div className="cp-field">
          <label className="cp-label">Category <span>*</span></label>
          <select
            className="cp-select"
            value={project.category}
            onChange={(e) => handleValue('category', e.target.value)}>
            <option value="">Select category</option>
            <option>Web Development</option>
            <option>Mobile App</option>
            <option>AI / ML</option>
            <option>Blockchain</option>
            <option>Cyber Security</option>
            <option>IoT</option>
            <option>Desktop Application</option>
            <option>Open Source</option>
            <option>Game Development</option>
            <option>Other</option>
          </select>
        </div>

        <div className="cp-field">
          <label className="cp-label">Project Stage <span>*</span></label>
          <select
            className="cp-select"
            required
            value={project.stage}
            onChange={(e) => handleValue('stage', e.target.value)}>
            <option value="">Select stage</option>
            <option>💡 Idea</option>
            <option>📋 Planning</option>
            <option>💻 Development</option>
            <option>🧪 Testing</option>
            <option>🚀 Deployment</option>
            <option>✅ Completed</option>
          </select>
        </div>
      </div>

      {/* Visibility */}
      <div className="cp-field">
        <label className="cp-label">Visibility <span>*</span></label>
        <div className="cp-radio-group">
          {['public', 'private'].map((visibilityItem) => (
            <label
              key={visibilityItem}
              className={`cp-radio-option ${project.visibility === visibilityItem ? 'cp-radio-selected' : ''}`}>
              <input
                type="radio"
                name="visibility"
                value={visibilityItem}
                checked={project.visibility === visibilityItem}
                onChange={() => handleValue('visibility', visibilityItem)}
              />
              {visibilityItem === 'public' ? '🌐 Public' : '🔒 Private'}
            </label>
          ))}
        </div>
      </div>

      {/* Repository */}
      <div className="cp-field">
        <label className="cp-label">Existing Repository</label>
        <div className="cp-radio-group">
          {['none', 'github'].map((prjGitLink) => (
            <label
              key={prjGitLink}
              className={`cp-radio-option ${project.repositoryType === prjGitLink ? 'cp-radio-selected' : ''}`}
            >
              <input
                type="radio"
                name="repositoryType"
                value={prjGitLink}
                checked={project.repositoryType === prjGitLink}
                onChange={() => handleValue('repositoryType', prjGitLink)}
              />
              {prjGitLink === 'none' ? '🚫 No Repository Yet' : '🐙 GitHub Repository'}
            </label>
          ))}
        </div>
        {project.repositoryType === 'github' && (
          <input
            className="cp-input"
            type="url"
            placeholder="https://github.com/username/repo"
            value={project.repositoryUrl}
            onChange={(e) => handleValue('repositoryUrl', e.target.value)}
            style={{ marginTop: '10px' }}
          />
        )}
      </div>

      {/* Demo Link */}
      <div className="cp-field">
        <label className="cp-label">Demo Link <span style={{color:'var(--gray-text)', fontWeight:400}}>(Optional)</span></label>
        <input
          className="cp-input"
          type="url"
          placeholder="https://yourproject.com"
          value={project.demoLink}
          onChange={(e) => handleValue('demoLink', e.target.value)}
        />
      </div>

      {/* Banner + Logo */}
      <div className="cp-row-2">
        <div className="cp-field">
          <label className="cp-label">Banner Image <span style={{color:'var(--gray-text)', fontWeight:400}}>(Optional)</span></label>
          <label className="cp-file-upload">
            <span className="cp-file-icon">🖼️</span>
            <div className="cp-file-info">
              <span className="cp-file-label">
                {project.banner ? project.banner.name : 'Upload Banner'}
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

        <div className="cp-field">
          <label className="cp-label">Project Logo <span style={{color:'var(--gray-text)', fontWeight:400}}>(Optional)</span></label>
          <label className="cp-file-upload">
            <span className="cp-file-icon">🎨</span>
            <div className="cp-file-info">
              <span className="cp-file-label">
                {project.logo ? project.logo.name : 'Upload Logo'}
              </span>
              <span className="cp-file-sub">PNG, SVG up to 2MB</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleValue('logo', e.target.files[0] || null)}
            />
          </label>
        </div>
      </div>

    </div>
  )
}

export default StepOne