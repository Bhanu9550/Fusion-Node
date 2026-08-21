import { useContext, useState } from 'react';
import '../Navbar/navbar.css';
import { NavLink, Link } from 'react-router-dom';

import FusionLogo from '../../assets/FusionNode_Logo.png';
import FusionTitle from '../../assets/FusionNode_Title.png';
import AuthContext from '../../Context/AuthContext';

const Navbar = () => {
    const {User} = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);

    const navLinkClass = ({ isActive }) =>
        isActive ? "active-style" : "inactive-style";

    return (
        <nav className="navbar">
            {/* Logo and Title */}
            <Link  to="/" className="nav-brand">
                <div className="nav-logo">
                    <img src={FusionLogo} alt="FusionNode Logo" />
                </div>
                <div className="nav-title">
                    <img src={FusionTitle} alt="FusionNode" />
                </div>
            </Link>

            {/* Navigation Links (Wrapped in a drawer for mobile) */}
            <div className={`nav-links-container ${isOpen ? 'open' : ''}`}>
                <ul className="nav-links">
                    <li><NavLink className={navLinkClass} to="/">Home</NavLink></li>
                    <li><NavLink className={navLinkClass} to="/about">About</NavLink></li>
                    <li><NavLink className={navLinkClass} to="/services">Services</NavLink></li>
                    <li><NavLink className={navLinkClass} to="/contactUs">Contact</NavLink></li>

                    <li className="nav-mobile-auth-item">
                        {!User ? (
                            <>
                                <NavLink className={navLinkClass} to="/signUp">Sign Up</NavLink>
                                <NavLink className={navLinkClass} to="/signIn">Sign In</NavLink>
                            </>
                        ) : (
                            <NavLink className={navLinkClass} to="/dashboard">Open Dashboard</NavLink>
                        )}
                    </li>
                </ul>
            </div>

            {/* SignIn and SignUp Button (Desktop Only) */}
            {!User ? (
                <>
                    <Link to="/signUp" className="signin-btn">SignUp</Link>
                    <Link to="/signIn" className="signin-btn">SignIn</Link>
                </>
            ) : (
                <Link to="/dashboard" className='signin-btn'>Open Dashboard</Link>
            )}

            {/* Hamburger */}
            <button
                className={`nav-toggle ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle navigation">
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </button>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div 
                    className="backdrop-overlay" 
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </nav>
    );
};

export default Navbar;