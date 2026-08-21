import { NavLink, useLocation } from 'react-router-dom'
import { useContext } from "react"
import AuthContext from "../../Context/AuthContext"
import './BottomNavbar.css'

const BottomNavbar = () => {

  const {User} = useContext(AuthContext)
  const location = useLocation()
  const path = location.pathname

  return (
    <>
        <nav className="mobile-bottom-nav">
          <NavLink to="/dashboard" className={`mobile-nav-item ${path.includes('/dashboard')? "active" : ""}`}>
            <span className="mobile-nav-icon">
              {path.includes('/dashboard') ?
                <img src="/dashb-active.png" alt="Dashboard" id="mobile-nav-icon-img1" /> :
                <img src="/dashboard.png" alt="Dashboard" id="mobile-nav-icon-img1" />}
            </span>
          </NavLink>
          
          <NavLink to="/projects" className={`mobile-nav-item ${path.includes('/projects')? "active" : ""}`}>
            <span className="mobile-nav-icon">
              {path.includes('/projects') ?
                <img src="/proj-active.png" alt="Projects" id="mobile-nav-icon-img2" /> :
                <img src="/projects.png" alt="Projects" id="mobile-nav-icon-img2" />}
            </span>
          </NavLink>
          
          <NavLink to="/messages" className={`mobile-nav-item ${path.includes('/messages') ? "active" : ""}`}>
            <span className="mobile-nav-icon">
              {path.includes('/messages') ?
                <img src="/msg-active.png" alt="Messages" id="mobile-nav-icon-msg" /> :
                <img src="/message.png" alt="Messages" id="mobile-nav-icon-img3" />}
            </span>
          </NavLink>
          
          <NavLink to={`/profile/${User.username}`} className={`mobile-nav-item ${path.includes(`/profile`) ? "active" : ""}`}>
            <span className="mobile-nav-icon">
                {path.includes(`/profile`) ?
                  <img src="/prof-active.png" alt="Profile" id="mobile-nav-icon-img4" /> :
                  <img src="/profile.png" alt="Profile" id="mobile-nav-icon-img4" />}
            </span>
          </NavLink>
          
          <NavLink to="/settings" className={`mobile-nav-item ${path.includes('/settings') ? "active" : ""}`}>
            <span className="mobile-nav-icon">
              {path.includes('/settings') ?
                <img src="/sett-active.png" alt="Settings" id="mobile-nav-icon-img5" /> :
                <img src="/settings.png" alt="Settings" id="mobile-nav-icon-img5" />}
            </span>
          </NavLink>
        </nav>
    </>
  )
}

export default BottomNavbar