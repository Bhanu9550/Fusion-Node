import { useContext } from "react"
import AuthContext from "../../Context/AuthContext"
import { NavLink, useLocation } from "react-router-dom"
import FusionLogo from '../../assets/FusionNode_Logo.png'
import './SideNavbar.css'


const SideNavbar = () => {

    const {User} = useContext(AuthContext)

    const location = useLocation()
    const path = location.pathname

    return (
        <>
            <div className={`side-nav `}>

                <div className="side-nav-logo">
                    <div className="nav-logo">
                        <img src={FusionLogo} alt="FusionNode Logo" />
                    </div>
                    <button className="side-nav-close-btn" >✕</button>
                </div>

                <nav className="side-nav-menu" >
                    <NavLink to="/dashboard" className={`menu-item ${path == '/dashboard'? "menu-item-active" : ""} `}>
                        <span className="menu-icon">🏠</span>
                        <span className="menu-label">Dashboard</span>
                    </NavLink>
                    <NavLink to="/projects" className={`menu-item ${path.includes('/projects') ? "menu-item-active" : ""} `}>
                        <span className="menu-icon">📁</span>
                        <span className="menu-label">Projects</span>
                    </NavLink>
                    <NavLink to="/messages" className={`menu-item ${path.startsWith('/messages')? "menu-item-active" : ""} `}>
                        <span className="menu-icon">💬</span>
                        <span className="menu-label">Messages</span>
                    </NavLink>
                    <NavLink to="/notifications" className={`menu-item ${path == '/notifications'? "menu-item-active" : ""} `}>
                        <span className="menu-icon">🔔</span>
                        <span className="menu-label">Notifications</span>
                    </NavLink>
                    <NavLink to={`/profile/${User.username}`} className={`menu-item ${path.includes('/profile') ? "menu-item-active" : ""} `}>
                        <span className="menu-icon">👤</span>
                        <span className="menu-label">Profile</span>
                    </NavLink>
                    <NavLink to="/settings" className={`menu-item ${path == '/settings'? "menu-item-active" : ""} `}>
                        <span className="menu-icon">⚙️</span>
                        <span className="menu-label">Settings</span>
                    </NavLink>
                </nav>

                <NavLink to={`/profile/${User.username}`} className="side-nav-user">
                    <div className="user-avatar-wrapper">
                        {User.profilePicture ? (
                            <img className="user-avatar" src={ User.profilePicture} alt="user" />
                        ) : (
                            <span className="user-avatar user-avatar-fallback">{User.fullname?.[0]?.toUpperCase()}</span>
                        )}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{User.fullname}</span>
                        <span className="user-role">{User.designation ? User.designation : "💭"}</span>
                    </div>
                </NavLink>

            </div>
        </>
    )
}

export default SideNavbar
