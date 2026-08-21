import { useState, useEffect, useContext, useCallback } from 'react'
import SideNavbar from '../../../Components/SideNavbar/SideNavbar'
import TopNavbar from '../../../Components/TopNavbar/TopNavbar'
import ProjectCard from '../../../Components/ProjectCard/ProjectCard'
import ProjectFilters from '../../../Components/ProjectFilters/ProjectFilters'
import BottomNavbar from '../../../Components/BottomNavbar/BottomNavbar'
import api from '../../../Configure/axiosConfigure'
import { ProjectCardSkeletonList } from '../../../Components/ProjectSkeleton/ProjectCardSkeleton'
import { useNavigate } from 'react-router-dom'
import UIContext from '../../../Context/UIContext'
import './Projects.css'
import JoinRequestModel from '../../../Components/JoinRequestModal/JoinRequestModel'

// Initial State: role is an array, experience defaults to "No Preference"
const EMPTY_FILTERS = { 
    status: null, 
    category: [], 
    role: [],          // Matches Backend 'role' param
    experience: 'No Preference' 
}

const Projects = () => {
  // Define which fields are Single Select vs Multi Select
  const SINGLE_SELECT_FIELDS = ['status', 'experience']; 
  const MULTI_SELECT_FIELDS = ['category', 'role']; 

  const [projectData, setProjectData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const { toggleFilterDrawer, isFilterDrawerOpen, closeFilterDrawer } = useContext(UIContext)
  const navigate = useNavigate()
  const [selectedProject, setSelectedProject] = useState(null)

  const handleOpenModal = (project) => setSelectedProject(project)
  const handleCloseModal = () => setSelectedProject(null)

  // Count active filters (exclude "No Preference")
  const activeFilterCount = Object.values(filters).reduce((sum, val) => {
    if (!val || val === 'No Preference') return sum;
    if (Array.isArray(val)) return sum + val.length;
    return sum + 1;
  }, 0);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = {}
      // 1. Search: Queries Name AND Tech Stack (Backend handles the OR logic)
      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      }    
      // 2. Status (Radio)
      if (filters.status && filters.status !== 'No Preference') {
         params.status = String(filters.status);
      }
      // 3. Category (Checkbox)
      if (filters.category && filters.category.length > 0) {
        params.category = filters.category.join(',');
      }
      // 4. Role Filter (Checkbox - Multi-select)
      // This sends 'role=Frontend Developer&role=Backend Developer' or 'role=Frontend%2C%20Developer'
      if (filters.role && filters.role.length > 0) {
        params.role = filters.role.join(',');
      }
      // 5. Experience (Radio with "No Preference")
      // Only send if NOT "No Preference"
      if (filters.experience && filters.experience !== 'No Preference') {
        params.experience = String(filters.experience);
      }
      
      const res = await api.get('/projects/projectData', { params })
      setProjectData(res.data.data || [])
    } catch (err) {
      console.error('❌ Error fetching projects:', err)
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, filters])

  // Debounce effect
  useEffect(() => {
    const timeout = setTimeout(fetchProjects, 400)
    return () => clearTimeout(timeout)
  }, [fetchProjects])

  function toggleFilter(field, value) {
    setFilters(prev => {
      const current = prev[field];
      const isSingleSelect = SINGLE_SELECT_FIELDS.includes(field);
      const isMultiSelect = MULTI_SELECT_FIELDS.includes(field);

      let next;

      if (isSingleSelect) {
        // RADIO LOGIC: Replace value or clear
        next = (current === value) ? null : value;
      } else if (isMultiSelect) {
        // CHECKBOX LOGIC: Toggle in/out of array
        const exists = Array.isArray(current) && current.includes(value);
        next = exists 
          ? current.filter(v => v !== value) 
          : [...(current || []), value];
      } else {
         next = value; // Fallback
      }

      return { ...prev, [field]: next };
    });
  }

  function resetFilters() {
    setFilters({
      status: null,          
      category: [],          
      role: [],              // Reset role to empty
      experience: 'No Preference' 
    });
    setSearchTerm('');
  }

  return (
    <section className="page-wrapper">
      <SideNavbar />
      <div className="right-dashboard">
        <TopNavbar />

        <div className="proj-container">
          {/* ── Page Header ── */}
          <div className='topContainer'>
            <div className="proj-header">
              <div className="proj-header-left">
                <h1 className="proj-title">Browse Projects</h1>
                <p className="proj-subtitle">Discover projects and find your next collaboration.</p>
              </div>
              <div className='prj-head-Btns'>
                <button className="proj-new-btn" onClick={() => navigate('/projects/myProjects')}>My Projects</button>
                <button className="proj-new-btn" onClick={() => navigate("/projects/createProject")}>＋ New Project</button>
              </div>
            </div>

            {/* ── Search Row ── */}
            <div className="proj-search-row">
              <div className="proj-search-bar">
                <span className="proj-search-icon">🔍</span>
                <input
                  className="proj-search-input"
                  type="text"
                  placeholder="Search by Project Name or Tech Stack..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button className="proj-filter-toggle-btn" onClick={toggleFilterDrawer}>
                ⚙️ Filters 
                {activeFilterCount > 0 && <span className="proj-filter-count">{activeFilterCount}</span>}
              </button>
            </div>

            <p className="proj-results-count">
              Showing <strong>{projectData.length}</strong> projects
            </p>
          </div>

          {/* ── Body ── */}
          <div className="proj-body">
            <div className="proj-cards-col">
              {isLoading ? (
                <ProjectCardSkeletonList />
              ) : projectData.length === 0 ? (
                <div className="proj-empty-state">No projects match your criteria.</div>
              ) : (
                projectData.map(project => (
                  <ProjectCard key={project._id} project={project} onReviewClick={handleOpenModal} />
                ))
              )}
            </div>

            <div className={`proj-filter-col ${isFilterDrawerOpen ? 'proj-filter-open' : ''}`}>
              <ProjectFilters filters={filters} onToggle={toggleFilter} onReset={resetFilters} />
            </div>
          </div>
        </div>
      </div>

      <BottomNavbar />
      {selectedProject && (
        <JoinRequestModel key={selectedProject._id} project={selectedProject} onClose={handleCloseModal} />
      )}
    </section>
  )
}

export default Projects