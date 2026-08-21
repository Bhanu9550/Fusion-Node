import { useState } from 'react'
import './About.css'
import Footer from '../../../Components/Footer/Footer'
import groupPage from '../../../assets/group-image.png'
const About = () => {

  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const testimonials = [
    {
      text: "This platform helped me find amazing collaborators for my final year project. We built something we're all proud of!",
      name: "Rohit Sharma",
      role: "Frontend Developer",
      stars: 5
    },
    {
      text: "The community here is super supportive. I learned so much and got opportunities I never thought possible.",
      name: "Ananya Verma",
      role: "UI/UX Designer",
      stars: 5
    },
    {
      text: "The AI assistant is a game changer. It saves me so much time every single day.",
      name: "Aditya Reddy",
      role: "Backend Developer",
      stars: 5
    }
  ]

  const handlePrev = () => {
    setActiveTestimonial(prev =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    )
  }

  const handleNext = () => {
    setActiveTestimonial(prev =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    )
  }

  return (
    <div className="about-wrapper">

      {/* ─── HERO SECTION ─────────────────────────── */}
      <section className="about-hero">
        <div className="about-container">
          <div className="about-hero-content">

            {/* Left */}
            <div className="about-hero-left">
              <span className="about-tag">ABOUT US</span>
              <h1 className="about-hero-title">
                We're on a Mission to<br />
                Empower <span className="about-green">Everyone</span>
              </h1>
              <p className="about-hero-desc">
                Our platform was built on a simple vision: to unite students, developers, designers, and innovators from around the 
                world in one community where they can connect, learn, collaborate, and build 
                meaningful projects together.
              </p>

              {/* Mini Stats */}
              <div className="about-mini-stats">
                <div className="about-mini-stat">
                  <div className="about-mini-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className="about-mini-stat-number">10K+</div>
                  <div className="about-mini-stat-label">Active Users</div>
                </div>
                <div className="about-mini-stat">
                  <div className="about-mini-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div className="about-mini-stat-number">2K+</div>
                  <div className="about-mini-stat-label">Projects Built</div>
                </div>
                <div className="about-mini-stat">
                  <div className="about-mini-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div className="about-mini-stat-number">150+</div>
                  <div className="about-mini-stat-label">Communities</div>
                </div>
              </div>
            </div>

            {/* Right - Image */}
            <div className="about-hero-right">
              <div className="about-hero-image-wrapper">
                <img
                  src={groupPage}
                  alt="team"
                  className="about-hero-image"
                />
                <div className="about-hero-glow"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── BUILT FOR EVERYONE ───────────────────── */}
      <section className="about-everyone">
        <div className="about-container">
          <div className="about-everyone-content">

            <div className="about-everyone-left">
              <h2 className="about-section-title">Built for Everyone</h2>
              <p className="about-everyone-desc">
                Whether you're a student learning new skills, a developer building
                the next big thing, or a creator sharing your ideas – our platform
                is built for you.
              </p>
            </div>

            <div className="about-everyone-right">
              <div className="about-audience-grid">

                <div className="about-audience-card">
                  <div className="about-audience-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                  <div className="about-audience-title">Students</div>
                  <div className="about-audience-desc">Learn and grow</div>
                </div>

                <div className="about-audience-card">
                  <div className="about-audience-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                  </div>
                  <div className="about-audience-title">Developers</div>
                  <div className="about-audience-desc">Build and collaborate</div>
                </div>

                <div className="about-audience-card">
                  <div className="about-audience-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                  </div>
                  <div className="about-audience-title">Designers</div>
                  <div className="about-audience-desc">Create and inspire</div>
                </div>

                <div className="about-audience-card">
                  <div className="about-audience-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div className="about-audience-title">Creators</div>
                  <div className="about-audience-desc">Share and showcase</div>
                </div>

                <div className="about-audience-card">
                  <div className="about-audience-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div className="about-audience-title">Innovators</div>
                  <div className="about-audience-desc">Ideate and build</div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US ────────────────────────── */}
      <section className="about-why">
        <div className="about-container">
          <h2 className="about-section-title">Why Choose Us?</h2>
          <p className="about-why-sub">
            We bring everything you need to collaborate and succeed.
          </p>

          <div className="about-why-grid">

            <div className="about-why-card">
              <div className="about-why-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="about-why-text">
                <h4>Collaborate Seamlessly</h4>
                <p>Work together in real-time with your team, no matter where you are.</p>
              </div>
            </div>

            <div className="about-why-card">
              <div className="about-why-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="about-why-text">
                <h4>Project Management</h4>
                <p>Organize tasks, track progress and deliver projects efficiently from start to finish.</p>
              </div>
            </div>

            <div className="about-why-card">
              <div className="about-why-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="about-why-text">
                <h4>Community Driven</h4>
                <p>Join communities, share knowledge and learn from others.</p>
              </div>
            </div>

            <div className="about-why-card">
              <div className="about-why-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="about-why-text">
                <h4>Secure & Reliable</h4>
                <p>Your data and projects are safe with enterprise grade security.</p>
              </div>
            </div>

            <div className="about-why-card">
              <div className="about-why-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div className="about-why-text">
                <h4>Open Opportunities</h4>
                <p>Find collaborators, join projects and explore new opportunities.</p>
              </div>
            </div>

            <div className="about-why-card">
              <div className="about-why-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div className="about-why-text">
                <h4>Skill Development</h4>
                <p>Enhance your skills with resources, events and real-world projects.</p>
              </div>
            </div>

            <div className="about-why-card">
              <div className="about-why-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <div className="about-why-text">
                <h4>Cross Platform</h4>
                <p>Access the platform on any device, anytime, anywhere.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────── */}
      <section className="about-testimonials">
        <div className="about-container">
          <h2 className="about-section-title">What Our Community Says</h2>
          <p className="about-testimonials-sub">Real stories from real people.</p>

          <div className="about-testimonials-slider">

            <button className="about-slider-btn left" onClick={handlePrev}>
              &#8592;
            </button>

            <div className="about-testimonials-track">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className={`about-testimonial-card ${i === activeTestimonial ? 'active' : ''}`}
                >
                  <p className="about-testimonial-text">"{t.text}"</p>
                  <div className="about-testimonial-author">
                    <div className="about-testimonial-avatar"></div>
                    <div className="about-testimonial-info">
                      <span className="about-testimonial-name">{t.name}</span>
                      <span className="about-testimonial-role">{t.role}</span>
                    </div>
                  </div>
                  <div className="about-testimonial-stars">
                    {'★'.repeat(t.stars)}
                  </div>
                </div>
              ))}
            </div>

            <button className="about-slider-btn right" onClick={handleNext}>
              &#8594;
            </button>

          </div>

          {/* Dots */}
          <div className="about-dots">
            {testimonials.map((_, i) => (
              <span
                key={i}
                className={`about-dot ${i === activeTestimonial ? 'active' : ''}`}
                onClick={() => setActiveTestimonial(i)}
              ></span>
            ))}
          </div>

        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────── */}
      <Footer />

    </div>
  )
}

export default About;