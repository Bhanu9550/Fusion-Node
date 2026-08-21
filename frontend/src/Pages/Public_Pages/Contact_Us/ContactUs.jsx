import  { useState } from 'react'
import './ContactUs.css'
import Footer from '../../../Components/Footer/Footer'

const ContactUs = () => {
  const [openFaq, setOpenFaq] = useState(null)

  const faqs = [
    {
      question: "How quickly will I get a response?",
      answer: "We aim to respond to all inquiries within 24-48 hours during our regular business days."
    },
    {
      question: "Do you offer technical support?",
      answer: "Yes, we have a dedicated technical support team for all platform-related issues."
    },
    {
      question: "I have an idea for a partnership. Who should I contact?",
      answer: "Please select 'Partnership' in the subject line of the contact form, and it will be routed to our business team."
    },
    {
      question: "Can I contribute to the platform?",
      answer: "Absolutely! We love open-source and community contributions. Check out our GitHub repository."
    },
    {
      question: "Where can I find more resources?",
      answer: "You can find tutorials, documentation, and guides in our Resources section from the top navigation."
    }
  ]

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="cnt-wrapper">

      {/* ─── HERO SECTION */}
      <section className="cnt-hero">
        <div className="cnt-container">
          <div className="cnt-hero-grid">
            
            {/* Left Content */}
            <div className="cnt-hero-text">
              <span className="cnt-tag">CONTACT US</span>
              <h1 className="cnt-title">
                Let's Build Something<br />
                Amazing <span className="cnt-green">Together!</span>
              </h1>
              <p className="cnt-desc">
                Have a question, idea, or just want to say hello? 
                We'd love to hear from you. Reach out to us and 
                we'll get back to you as soon as possible.
              </p>
              
              <div className="cnt-socials-large">
                <a href="#" className="cnt-social-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                </a>
                <a href="#" className="cnt-social-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="cnt-social-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" className="cnt-social-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                </a>
              </div>
            </div>

            {/* Right Visual */}
            <div className="cnt-hero-visual">
              <div className="cnt-mock-envelope">
                <div className="cnt-env-text">We're Here<br/>to Help!</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── INFO CARDS ────── */}
      <section className="cnt-info-section">
        <div className="cnt-container">
          <div className="cnt-info-grid">
            
            <div className="cnt-info-card">
              <div className="cnt-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div className="cnt-info-content">
                <h4>Email Us</h4>
                <a href="mailto:hello@platform.dev">hello@platform.dev</a>
                <p>We'll respond as soon as possible</p>
              </div>
            </div>

            <div className="cnt-info-card">
              <div className="cnt-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div className="cnt-info-content">
                <h4>Call Us</h4>
                <a href="tel:+919876543210">+91 98765 43210</a>
                <p>Mon - Fri<br/>9:00 AM - 6:00 PM IST</p>
              </div>
            </div>

            <div className="cnt-info-card">
              <div className="cnt-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div className="cnt-info-content">
                <h4>Visit Us</h4>
                <span>Hyderabad, Telangana<br/>India - 500081</span>
                <p>We love meeting our community</p>
              </div>
            </div>

            <div className="cnt-info-card">
              <div className="cnt-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="cnt-info-content">
                <h4>Support Hours</h4>
                <span>Mon - Fri: 9AM - 6PM<br/>Saturday: 10AM - 2PM</span>
                <p>Sunday: Closed</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── MAIN GRID (FORM & MAP) ──────── */}
      <section className="cnt-main-section">
        <div className="cnt-container">
          <div className="cnt-main-grid">

            {/* FORM */}
            <div className="cnt-form-box">
              <div className="cnt-box-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                <h3>Send Us a Message</h3>
              </div>
              
              <form className="cnt-form" onSubmit={e => e.preventDefault()}>
                <div className="cnt-form-row">
                  <div className="cnt-input-group">
                    <div className="cnt-input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <input type="text" placeholder="Full Name" />
                  </div>
                  <div className="cnt-input-group">
                    <div className="cnt-input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    <input type="email" placeholder="Email Address" />
                  </div>
                </div>

                <div className="cnt-input-group">
                  <div className="cnt-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <input type="text" placeholder="Subject" />
                </div>

                <div className="cnt-input-group cnt-textarea-group">
                  <div className="cnt-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <textarea rows="5" placeholder="Your Message"></textarea>
                </div>

                <button type="submit" className="cnt-btn-submit">
                  Send Message <span>→</span>
                </button>

                <div className="cnt-secure-note">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Your information is secure and will never be shared.
                </div>
              </form>
            </div>

            {/* LOCATION */}
            <div className="cnt-location-box">
              <div className="cnt-box-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                <h3>Our Location</h3>
              </div>
              
              <div className="cnt-map-visual">
                {/* Dots map placeholder */}
                <div className="cnt-map-dots"></div>
              </div>

              <div className="cnt-address-card">
                <div className="cnt-addr-info">
                  <h5>Headquarters</h5>
                  <strong>Platform Technologies Pvt. Ltd.</strong>
                  <p>Hyderabad, Telangana, India - 500081</p>
                </div>
                <div className="cnt-addr-img">
                  {/* Photo of city */}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION ───── */}
      <section className="cnt-faq-section">
        <div className="cnt-container">
          <div className="cnt-faq-grid">
            
            {/* Left */}
            <div className="cnt-faq-left">
              <span className="cnt-tag">FAQ</span>
              <h2 className="cnt-section-title">
                Frequently Asked <span className="cnt-green">Questions</span>
              </h2>
              
              <div className="cnt-faq-illustration">
                <div className="cnt-bubble cnt-b1">?</div>
                <div className="cnt-bubble cnt-b2">...</div>
              </div>
              <div className="cnt-faq-help-text">
                Still have questions?<br/>
                <span className="cnt-green">We're here to help!</span>
              </div>
            </div>

            {/* Right */}
            <div className="cnt-faq-right">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`cnt-faq-item ${openFaq === index ? 'open' : ''}`}
                  onClick={() => toggleFaq(index)}
                >
                  <div className="cnt-faq-question">
                    {faq.question}
                    <span className="cnt-faq-plus">
                      {openFaq === index ? '−' : '+'}
                    </span>
                  </div>
                  <div className="cnt-faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA CARDS  */}
      <section className="cnt-bottom-section">
        <div className="cnt-container">
          <div className="cnt-bottom-grid">
            
            <div className="cnt-bottom-card">
              <div className="cnt-bc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="cnt-bc-text">
                <h3>Join Our Community</h3>
                <p>Connect with thousands of developers, learn together and build the future.</p>
                <button className="cnt-btn-outline">Join Discord →</button>
              </div>
            </div>

            <div className="cnt-bottom-card">
              <div className="cnt-bc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
                </svg>
              </div>
              <div className="cnt-bc-text">
                <h3>Report an Issue</h3>
                <p>Found a bug or have a feature request? Let us know and help us improve.</p>
                <button className="cnt-btn-outline">Report Issue →</button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────── */}
      <Footer />

    </div>
  )
}

export default ContactUs;