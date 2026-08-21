import { useState } from 'react'
import './Services.css'
import Footer from '../../../Components/Footer/Footer'
import servicesImg from '../../../assets/services-img.png'

const Services = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const testimonials = [
    {
      text: "This platform helped me find amazing collaborators for my final year project. The community is super supportive!",
      name: "Rohit Sharma",
      role: "Frontend Developer",
      stars: 5
    },
    {
      text: "The AI assistant is a game changer! It saves me so much time every single day.",
      name: "Ananya Verma",
      role: "UI/UX Designer",
      stars: 5
    },
    {
      text: "I learned so much and got opportunities I never thought possible. Thank you!",
      name: "Aditya Reddy",
      role: "Backend Developer",
      stars: 5
    }
  ]

  const handlePrev = () => {
    setActiveTestimonial(prev => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveTestimonial(prev => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="srv-wrapper">

      {/* ─── HERO & SERVICES GRID ────*/}
      <section className="srv-hero-section">
        <div className="srv-container">
          
          {/* Top text & visual */}
          <div className="srv-hero-top">
            <div className="srv-hero-text">
              <span className="srv-tag">OUR SERVICES</span>
              <h1 className="srv-hero-title">
                Everything You Need to<br />
                <span className="srv-green">Build, Learn & Grow</span>
              </h1>
              <p className="srv-hero-desc">
                We provide a complete ecosystem of tools and features
                designed for everyone to collaborate, learn and grow.
              </p>
            </div>
            <div className="srv-hero-visual">
              {/* Placeholder for the 3D blocks image */}
              <img 
                src={servicesImg} 
                alt="services illustration" 
                className="srv-hero-img"
              />
            </div>
          </div>

          {/* 8 Cards Grid */}
          <div className="srv-cards-grid">
            
            <div className="srv-card">
              <div className="srv-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className="srv-card-title">Project Collaboration</h3>
              <p className="srv-card-desc">Create projects, manage tasks, track progress and collaborate with your team.</p>
            </div>

            <div className="srv-card">
              <div className="srv-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className="srv-card-title">Communities</h3>
              <p className="srv-card-desc">Join communities, participate in discussions and share your knowledge.</p>
            </div>

            <div className="srv-card">
              <div className="srv-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3 className="srv-card-title">Messaging</h3>
              <p className="srv-card-desc">Chat in real-time with your team or communities.</p>
            </div>

            <div className="srv-card">
              <div className="srv-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>
                </svg>
              </div>
              <h3 className="srv-card-title">Showcase Profile</h3>
              <p className="srv-card-desc">Build your profile, showcase projects and achievements.</p>
            </div>

            <div className="srv-card">
              <div className="srv-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h3 className="srv-card-title">Opportunities</h3>
              <p className="srv-card-desc">Discover internships, jobs and collaborate on exciting opportunities.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── CTA BANNER 1 ──────────*/}
      <section className="srv-banner-cta">
        <div className="srv-container">
          <div className="srv-banner-inner">
            <div className="srv-banner-text">
              <h2>One Platform. <span className="srv-green">Endless</span> Possibilities.</h2>
              <p>Join us today and start your journey of learning, building and growing together.</p>
            </div>
            <button className="srv-btn-primary">
              Get Started for Free →
            </button>
          </div>
        </div>
      </section>

      {/* ─── STATS ROW ─────────────*/}
      <section className="srv-stats-row">
        <div className="srv-container">
          <div className="srv-stats-grid">
            <div className="srv-stat-box">
              <div className="srv-stat-icon">👥</div>
              <h4>10K+</h4>
              <p>Active Users</p>
            </div>
            <div className="srv-stat-box">
              <div className="srv-stat-icon">💻</div>
              <h4>2K+</h4>
              <p>Projects Built</p>
            </div>
            <div className="srv-stat-box">
              <div className="srv-stat-icon">🌐</div>
              <h4>150+</h4>
              <p>Communities</p>
            </div>
            <div className="srv-stat-box">
              <div className="srv-stat-icon">🛡️</div>
              <h4>99.9%</h4>
              <p>Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────*/}
      <section className="srv-steps-section">
        <div className="srv-container">
          <span className="srv-tag">HOW IT WORKS</span>
          <h2 className="srv-section-title">Simple Steps to Get Started</h2>

          <div className="srv-steps-container">
            <div className="srv-step-line"></div>
            
            <div className="srv-step">
              <div className="srv-step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h4 className="srv-step-title"><span className="srv-green">1</span> Create Account</h4>
              <p className="srv-step-desc">Sign up and set up your profile in seconds.</p>
            </div>

            <div className="srv-step">
              <div className="srv-step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h4 className="srv-step-title"><span className="srv-green">2</span> Explore & Join</h4>
              <p className="srv-step-desc">Discover communities, projects and resources.</p>
            </div>

            <div className="srv-step">
              <div className="srv-step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
              </div>
              <h4 className="srv-step-title"><span className="srv-green">3</span> Collaborate & Build</h4>
              <p className="srv-step-desc">Work with others, share ideas and build amazing things.</p>
            </div>

            <div className="srv-step">
              <div className="srv-step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h4 className="srv-step-title"><span className="srv-green">4</span> Grow & Achieve</h4>
              <p className="srv-step-desc">Learn, earn opportunities and achieve your goals together.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ──────────*/}
      <section className="srv-testimonials">
        <div className="srv-container">
          <span className="srv-tag">WHAT OUR COMMUNITY SAYS</span>
          <h2 className="srv-section-title">Loved by Learners & Builders</h2>

          <div className="srv-testimonials-slider">
            <button className="srv-slider-btn" onClick={handlePrev}>&#8592;</button>

            <div className="srv-testimonials-track">
              {testimonials.map((t, i) => (
                <div key={i} className={`srv-testimonial-card ${i === activeTestimonial ? 'active' : ''}`}>
                  <div className="srv-quote-icon">"</div>
                  <p className="srv-testimonial-text">{t.text}</p>
                  <div className="srv-testimonial-author">
                    <div className="srv-testimonial-avatar"></div>
                    <div className="srv-testimonial-info">
                      <span className="srv-testimonial-name">{t.name}</span>
                      <span className="srv-testimonial-role">{t.role}</span>
                    </div>
                  </div>
                  <div className="srv-testimonial-stars">{'★'.repeat(t.stars)}</div>
                </div>
              ))}
            </div>

            <button className="srv-slider-btn" onClick={handleNext}>&#8594;</button>
          </div>

          <div className="srv-dots">
            {testimonials.map((_, i) => (
              <span key={i} className={`srv-dot ${i === activeTestimonial ? 'active' : ''}`} onClick={() => setActiveTestimonial(i)}></span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DISCORD BANNER ────────*/}
      <section className="srv-discord-section">
        <div className="srv-container">
          <div className="srv-discord-box">
            <div className="srv-discord-left">
              <div className="srv-discord-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              <div>
                <h2>Join Our Discord Community</h2>
                <p>Connect with developers, get help, share ideas and stay updated.</p>
              </div>
            </div>
            <button className="srv-btn-discord">Join Discord →</button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────*/}
      <Footer />

    </div>
  )
}

export default Services;