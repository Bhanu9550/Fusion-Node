const COMMUNICATION_OPTIONS = [
  'Built-in Chat', 'Discord']

const RadioGroup = ({ options, value, onChange }) => (
  <div className="cp-radio-group">
    {options.map(opt => (
      <label
        key={opt.value}
        className={`cp-radio-option ${value === opt.value ? 'cp-radio-selected' : ''}`}
      >
        <input
          type="radio"
          value={opt.value}
          checked={value === opt.value}
          onChange={() => onChange(opt.value)}
        />
        {opt.label}
      </label>
    ))}
  </div>
)

const StepFour = ({ project, handleValue }) => {
  return (
    <div className="cp-form">
      <h2 className="cp-step-title">④ Project Settings</h2>

      <div className="cp-settings-section">

        {/* Recruitment Status */}
        <div className="cp-field">
          <label className="cp-label">Recruitment Status</label>
          <RadioGroup
            value={project.recruitmentStatus}
            onChange={(val) => handleValue('recruitmentStatus', val)}
            options={[
              { value: 'open',   label: '🟢 Open'   },
              { value: 'closed', label: '🔴 Closed' },
              { value: 'paused', label: '⏸️ Paused' },
            ]}
          />
        </div>

        <hr className="cp-settings-divider" />

        {/* Who Can Apply */}
        <div className="cp-field">
          <label className="cp-label">Who Can Apply?</label>
          <RadioGroup
            value={project.whoCanApply}
            onChange={(val) => handleValue('whoCanApply', val)}
            options={[
              { value: 'everyone',     label: '🌐 Everyone'     },
              { value: 'invite_only',  label: '📩 Invite Only'  },
            ]}
          />
        </div>

        <hr className="cp-settings-divider" />

        {/* Max Team Size */}
        <div className="cp-field">
          <label className="cp-label">Maximum Team Size</label>
          <input
            className="cp-input"
            type="number"
            min={1}
            max={25}
            placeholder="e.g. 8"
            value={project.maxTeamSize}
            onChange={(e) => handleValue('maxTeamSize', e.target.value)}
            style={{ maxWidth: '180px' }}
          />
        </div>

        <hr className="cp-settings-divider" />

        {/* Join Request Approval */}
        <div className="cp-field">
          <label className="cp-label">Join Request Approval</label>
          <RadioGroup
            value={project.joinApproval}
            onChange={(val) => handleValue('joinApproval', val)}
            options={[
              { value: 'owner',           label: '👤 Owner Only'          },
              { value: 'owner_managers',  label: '👥 Owner + Managers'    },
            ]}
          />
        </div>

        <hr className="cp-settings-divider" />

        {/* Members Can Invite */}
        <div className="cp-field">
          <label className="cp-label">Members Can Invite Others?</label>
          <RadioGroup
            value={project.membersCanInvite}
            onChange={(val) => handleValue('membersCanInvite', val)}
            options={[
              { value: 'yes', label: '✅ Yes' },
              { value: 'no',  label: '❌ No'  },
            ]}
          />
        </div>

        <hr className="cp-settings-divider" />

        {/* Leaving Policy */}
        <div className="cp-field">
          <label className="cp-label">Leaving Policy</label>
          <RadioGroup
            value={project.leavingPolicy}
            onChange={(val) => handleValue('leavingPolicy', val)}
            options={[
              { value: 'anytime',  label: '🚪 Members can leave anytime'      },
              { value: 'approval', label: '📋 Members must request approval'   },
            ]}
          />
          <p className="cp-hint">
            💡 Request approval is recommended so handover can be discussed.
          </p>
        </div>

        <hr className="cp-settings-divider" />

        {/* Communication */}
        <div className="cp-field">
          <label className="cp-label">Preferred Communication</label>
          <div className="cp-radio-group" style={{ flexWrap: 'wrap' }}>
            {COMMUNICATION_OPTIONS.map(opt => (
              <label
                key={opt}
                className={`cp-radio-option ${project.communication === opt ? 'cp-radio-selected' : ''}`}
              >
                <input
                  type="radio"
                  value={opt}
                  checked={project.communication === opt}
                  onChange={() => handleValue('communication', opt)}
                />
                {opt}
              </label>
            ))}
          </div>
          {project.communication && project.communication !== 'Built-in Chat' && (
            <input
              className="cp-input"
              type="text"
              placeholder={`Paste your ${project.communication} invite link (you can also add this later)`}
              value={project.communicationLink || ''}
              onChange={(e) => handleValue('communicationLink', e.target.value)}
              style={{ marginTop: '10px' }}
            />
          )}
        </div>

        <hr className="cp-settings-divider" />

        {/* Completion Date */}
        <div className="cp-field">
          <label className="cp-label">Expected Completion Date <span style={{ color: 'var(--gray-text)', fontWeight: 400 }}>(Optional)</span></label>
          <input
            className="cp-input"
            type="date"
            value={project.completionDate}
            onChange={(e) => handleValue('completionDate', e.target.value)}
            style={{ maxWidth: '220px', colorScheme: 'dark' }}
          />
        </div>

      </div>
    </div>
  )
}

export default StepFour