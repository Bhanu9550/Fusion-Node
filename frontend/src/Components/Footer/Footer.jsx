import './Footer.css'
import FN_Title from '../../assets/FusionNode_Title.png'

const Footer = () => {
    return (
        <>
            <footer className="about-footer">
                <div className="about-container">
                    <div className="about-footer-grid">

                        <div className="about-footer-brand">
                            <div className="about-footer-logo">
                                <img src={FN_Title} alt="logo" />
                            </div>
                            <p className="about-footer-desc">
                                More than a platform, it's a movement to empower
                                everyone to build, learn and create together.
                            </p>
                            <div className="about-socials">
                                <span className="about-social">𝕏</span>
                                <span className="about-social">in</span>
                                <span className="about-social">G</span>
                                <span className="about-social">D</span>
                            </div>
                        </div>

                        <div className="about-footer-col">
                            <h4 className="about-footer-title">Quick Links</h4>
                            <ul className="about-footer-links">
                                <li><a href="#">Home</a></li>
                                <li><a href="#">About Us</a></li>
                                <li><a href="#">Services</a></li>
                                <li><a href="#">Contact Us</a></li>
                            </ul>
                        </div>

                        <div className="about-footer-col">
                            <h4 className="about-footer-title">Resources</h4>
                            <ul className="about-footer-links">
                                <li><a href="#">Docs</a></li>
                                <li><a href="#">Blog</a></li>
                                <li><a href="#">Privacy Policy</a></li>
                                <li><a href="#">Terms of Service</a></li>
                            </ul>
                        </div>

                        <div className="about-footer-col">
                            <h4 className="about-footer-title">Services</h4>
                            <ul className="about-footer-links">
                                <li><a href="#">Project Management</a></li>
                                <li><a href="#">Team Collaboration</a></li>
                                <li><a href="#">Events</a></li>
                            </ul>
                        </div>

                        <div className="about-footer-col">
                            <h4 className="about-footer-title">Stay Updated</h4>
                            <p className="about-footer-newsletter-text">
                                Subscribe to our newsletter for latest updates and news.
                            </p>
                            <div className="about-newsletter">
                                <input type="email" placeholder="Enter your email" />
                                <button>Subscribe</button>
                            </div>
                        </div>

                    </div>

                    <div className="about-footer-bottom">
                        <p>© 2026 Fusion Node. All rights reserved.</p>
                    </div>

                </div>
            </footer>
        </>
    )
}

export default Footer