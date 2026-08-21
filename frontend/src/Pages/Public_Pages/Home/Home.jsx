import './Home.css'
import Footer from '../../../Components/Footer/Footer';
import boyImg from '../../../assets/boy-img.png'
import girlImg from '../../../assets/girl-img.png'

const Home = () => {
    return (
        <>
            <div className="home-wrapper">

                {/* ─── HERO SECTION  */}
                <section className="home-hero">
                    <div className="home-hero-content">
                        <div className="home-hero-text">
                            <span className="home-hero-tag">WELCOME TO PLATFORM</span>
                            <h1 className="home-hero-title">
                                Build Together.<br />
                                Grow Together.<br />
                                <span className="home-hero-title-green">Succeed Together.</span>
                            </h1>
                            <p className="home-hero-desc">
                                The all-in-one platform for developers to connect, collaborate,
                                build projects, and accelerate their careers.
                            </p>
                            <div className="home-hero-buttons">
                                <button className="home-btn-primary">
                                    Get Started <span className="home-arrow">→</span>
                                </button>
                                <button className="home-btn-secondary">
                                    Explore Projects
                                </button>
                            </div>
                            <div className="home-trust">
                                <span className="home-trust-text">TRUSTED BY DEVELOPERS</span>
                                {/* <div className="home-avatars">
                                    <div className="home-avatar"></div>
                                    <div className="home-avatar"></div>
                                    <div className="home-avatar"></div>
                                    <div className="home-avatar"></div>
                                    <span className="home-trust-plus">+12K</span>
                                </div> */}
                            </div>
                        </div>


                        {/* dashboard image */}
                        <div className="home-hero-visual">
                            <div className="home-dashboard-mockup">
                                <div className="home-mockup-header">
                                    <span className="home-mockup-dot"></span>
                                    <span className="home-mockup-dot"></span>
                                    <span className="home-mockup-dot"></span>
                                </div>
                                <div className="home-mockup-content">
                                    <div className="home-mockup-sidebar">
                                        <div className="home-mockup-nav-item active"></div>
                                        <div className="home-mockup-nav-item"></div>
                                        <div className="home-mockup-nav-item"></div>
                                        <div className="home-mockup-nav-item"></div>
                                    </div>
                                    <div className="home-mockup-main">
                                        <div className="home-mockup-card"></div>
                                        <div className="home-mockup-card"></div>
                                        <div className="home-mockup-list">
                                            <div className="home-mockup-row"></div>
                                            <div className="home-mockup-row"></div>
                                            <div className="home-mockup-row"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── FEATURES SECTION ─ */}
                <section className="home-features">
                    <div className="home-container">
                        <div className="home-features-grid">

                            <div className="home-feature-card">
                                <div className="home-feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                                <h3 className="home-feature-title">Collaborate</h3>
                                <p className="home-feature-desc">Build projects together in real-time</p>
                            </div>

                            <div className="home-feature-card">
                                <div className="home-feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>
                                <h3 className="home-feature-title">Communities</h3>
                                <p className="home-feature-desc">Join tech communities and share knowledge</p>
                            </div>

                            <div className="home-feature-card">
                                <div className="home-feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <line x1="9" y1="9" x2="15" y2="15" />
                                        <line x1="15" y1="9" x2="9" y2="15" />
                                    </svg>
                                </div>
                                <h3 className="home-feature-title">Showcase</h3>
                                <p className="home-feature-desc">Build your profile and showcase your work</p>
                            </div>

                            <div className="home-feature-card">
                                <div className="home-feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                </div>
                                <h3 className="home-feature-title">Get Opportunities</h3>
                                <p className="home-feature-desc">Find jobs, internships and hackathons</p>
                            </div>

                        </div>
                    </div>
                </section>

                {/* ─── PLATFORM SECTION ─ */}
                <section className="home-platform">
                    <div className="home-container">
                        <div className="home-section-header">
                            <span className="home-section-tag">SEE PLATFORM IN ACTION</span>
                            <h2 className="home-section-title">A Platform Built for Innovators</h2>
                            <p className="home-section-subtitle">
                                Everything you need to build, collaborate and grow your developer journey.
                            </p>
                        </div>

                        <div className="home-platform-grid">

                            <div className="home-platform-card">
                                <div className="home-platform-preview">
                                    <div className="home-preview-ui">
                                        <img src='/s1.png' alt="Dashboard Preview" />
                                    </div>
                                </div>
                                <h3 className="home-platform-card-title">Dashboard</h3>
                                <p className="home-platform-card-desc">
                                    Track your projects and activities in one place.
                                </p>
                            </div>

                            <div className="home-platform-card">
                                <div className="home-platform-preview">
                                    <div className="home-preview-ui">
                                        <img src='/s2.png' alt="project Preview" />
                                    </div>
                                </div>
                                <h3 className="home-platform-card-title">Projects</h3>
                                <p className="home-platform-card-desc">
                                    Manage tasks, collaborate and ship projects.
                                </p>
                            </div>

                            <div className="home-platform-card">
                                <div className="home-platform-preview">
                                    <div className="home-preview-ui">
                                        <img src='/s3.png' alt="Connections Preview" />
                                    </div>
                                </div>
                                <h3 className="home-platform-card-title">Connections</h3>
                                <p className="home-platform-card-desc">
                                    Connect with developers worldwide.
                                </p>
                            </div>

                            <div className="home-platform-card">
                                <div className="home-platform-preview">
                                    <div className="home-preview-ui">
                                        <img src='/s4.png' alt="Profile Preview" />
                                    </div>
                                </div>
                                <h3 className="home-platform-card-title">Profile</h3>
                                <p className="home-platform-card-desc">
                                    Showcase your skills and achievements.
                                </p>
                            </div>

                        </div>
                    </div>
                </section>

                {/* ─── CTA SECTION ────── */}
                <section className="home-cta">
                    <div className="home-container">
                        <div className="home-cta-content">
                            <div className="home-cta-illustration left">
                                {/* <div className="home-person home-person-left"></div> */}
                                <img src={boyImg} alt="boy img" srcSet="" />
                            </div>

                            <div className="home-cta-text">
                                <h2 className="home-cta-title">
                                    Ready to build the future together?
                                </h2>
                                <p className="home-cta-desc">
                                    Join thousands of students, developers and creators who are already
                                    building, learning and growing on our platform.
                                </p>
                                <button className="home-btn-primary home-btn-large">
                                    Join Platform Now <span className="home-arrow">→</span>
                                </button>
                            </div>

                            <div className="home-cta-illustration right">
                                {/* <div className="home-person home-person-right"></div> */}
                                <img src={girlImg} alt="girl-img" srcSet="" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── FOOTER ─────────── */}
                <Footer />

            </div>
        </>
    )
}

export default Home;