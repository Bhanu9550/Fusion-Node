import { useContext } from 'react'
import UIContext from '../../Context/UIContext'
import './ProjectFilters.css'

export const STATUS_OPTIONS     = ['Recruiting', 'In Progress', 'Completed', 'Paused']
export const CATEGORY_OPTIONS   = ['Web Development', 'Mobile App', 'AI / ML', 'Blockchain', 'Cyber Security', 'IoT', 'Desktop Application', 'Open Source', 'Game Development', 'Other']
export const ROLE_OPTIONS       = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'UI/UX Designer', 'DevOps Engineer', 'QA Tester',
    'Database Engineer', 'AI/ML Engineer', 'Mobile Developer', 'Other'
]
export const EXPERIENCE_OPTIONS = ['No Preference', 'Student', 'Fresher', 'Junior', 'Mid-Level', 'Senior']

const FilterSection = ({ title, field, options, selected, onToggle, type = 'checkbox' }) => {
    const isSelected = (option) => {
        if (!selected && selected !== '') return false
        return Array.isArray(selected) 
            ? selected.includes(option) 
            : selected === option
    }

    // FIX: Stop propagation for radio/checkbox clicks
    const handleInputChange = (e, val) => {
        e.stopPropagation(); // Prevents the click from reaching the backdrop
        onToggle(field, val);
    };

    return (
        <div className="pf-section">
            <p className="pf-section-title">{title}</p>
            <div className="pf-options-list">
                {options.map(option => (
                    <label 
                        key={option} 
                        className={`pf-option ${isSelected(option) ? 'pf-option-selected' : ''}`}
                        onClick={(e) => e.stopPropagation()} // ALSO stop label clicks
                    >
                        <input
                            type={type}
                            name={field}
                            value={option}
                            className="pf-checkbox"
                            checked={isSelected(option)}
                            onChange={(e) => handleInputChange(e, option)} // Use fixed handler
                        />
                        <span className="pf-option-label">{option}</span>
                    </label>
                ))}
            </div>
        </div>
    )
}

const ProjectFilters = ({ filters, onToggle, onReset }) => {
    const { isFilterDrawerOpen, closeFilterDrawer } = useContext(UIContext)

    // Only close if clicking DIRECTLY on the backdrop div
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closeFilterDrawer();
        }
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className={`pf-backdrop ${isFilterDrawerOpen ? 'pf-backdrop-visible' : ''}`}
                onClick={handleBackdropClick}
                style={{ zIndex: 100 }} // Force z-index in case CSS fails
            />

            {/* Panel */}
            <div className={`pf-panel ${isFilterDrawerOpen ? 'pf-panel-open' : ''}`} style={{ zIndex: 200 }}>
                
                <div className="pf-header">
                    <span className="pf-title">Filters</span>
                    <div className="pf-header-actions">
                        <button className="pf-reset-btn" onClick={(e) => { e.stopPropagation(); onReset(); }}>Reset</button>
                        <button className="pf-close-btn" onClick={(e) => { e.stopPropagation(); closeFilterDrawer(); }}>✕</button>
                    </div>
                </div>

                <FilterSection title="Status" field="status" options={STATUS_OPTIONS} selected={filters.status} onToggle={onToggle} type="radio" />
                <div className="pf-divider" />
                <FilterSection title="Category" field="category" options={CATEGORY_OPTIONS} selected={filters.category} onToggle={onToggle} type="checkbox" />
                <div className="pf-divider" />
                <FilterSection title="Roles" field="role" options={ROLE_OPTIONS} selected={filters.role} onToggle={onToggle} type="checkbox" />
                <div className="pf-divider" />
                <FilterSection title="Experience Level" field="experience" options={EXPERIENCE_OPTIONS} selected={filters.experience} onToggle={onToggle} type="radio" />

            </div>
        </>
    )
}

export default ProjectFilters