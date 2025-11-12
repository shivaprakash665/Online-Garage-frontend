// src/components/Home/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className={`home-header ${isScrolled ? 'home-header-scrolled' : ''}`}>
        <div className="home-header-content">
          {/* Logo - Left Side */}
          <div className="home-logo">
            <div className="home-logo-icon">
              <i className="bi bi-car-front-fill"></i>
            </div>
            <span className="home-logo-text">FleetTrackR</span>
          </div>

          {/* Navigation - Right Side */}
          <nav className="home-nav">
            <button 
              className="home-nav-link" 
              onClick={() => scrollToSection('home-about')}
            >
              About Us
            </button>
            <button 
              className="home-nav-link" 
              onClick={() => scrollToSection('home-contact')}
            >
              Contact
            </button>
            <button 
              className="home-nav-btn home-nav-login" 
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button 
              className="home-nav-btn home-nav-register" 
              onClick={() => navigate('/register')}
            >
              Register
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home-hero" className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-hero-title">
            Smart Vehicle Management
            <span className="home-hero-highlight"> Made Simple</span>
          </h1>
          <p className="home-hero-subtitle">
            Track, manage, and maintain your entire vehicle fleet with our comprehensive 
            management platform. Get real-time insights and automated reminders.
          </p>
          <button className="home-cta-btn" onClick={() => navigate('/register')}>
            <span>Let's Get Started</span>
            <i className="bi bi-arrow-right"></i>
          </button>
        </div>
        <div className="home-scroll-indicator" onClick={() => scrollToSection('home-about')}>
          <i className="bi bi-chevron-down"></i>
        </div>
      </section>

      {/* About Section */}
      <section id="home-about" className="home-about">
        <div className="home-container-inner">
          <h2 className="home-section-title">About FleetTrackR</h2>
          <p className="home-section-desc">
            FleetTrackR is your all-in-one solution for vehicle fleet management. 
            We help businesses and individuals streamline their vehicle operations.
          </p>
          <div className="home-features">
            <div className="home-feature-card">
              <div className="home-feature-icon">
                <i className="bi bi-shield-check"></i>
              </div>
              <h3>Insurance Tracking</h3>
              <p>Never miss insurance renewals with smart alerts</p>
            </div>
            <div className="home-feature-card">
              <div className="home-feature-icon">
                <i className="bi bi-tools"></i>
              </div>
              <h3>Service Management</h3>
              <p>Automated service scheduling and maintenance</p>
            </div>
            <div className="home-feature-card">
              <div className="home-feature-icon">
                <i className="bi bi-graph-up"></i>
              </div>
              <h3>Smart Analytics</h3>
              <p>Detailed insights into fleet performance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="home-contact" className="home-contact">
        <div className="home-container-inner">
          <h2 className="home-section-title">Contact Us</h2>
          <p className="home-section-desc">
            Get in touch with us for any inquiries or support
          </p>
          <div className="home-contact-cards">
            <div className="home-contact-card">
              <div className="home-contact-icon">
                <i className="bi bi-envelope-fill"></i>
              </div>
              <h3>Email</h3>
              <p>fleettrackr@gmail.com</p>
            </div>
            <div className="home-contact-card">
              <div className="home-contact-icon">
                <i className="bi bi-geo-alt-fill"></i>
              </div>
              <h3>Location</h3>
              <p>Kochi, Kerala</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-container-inner">
          <div className="home-footer-content">
            <div className="home-footer-logo">
              <i className="bi bi-car-front-fill"></i>
              <span>FleetTrackR</span>
            </div>
            <p className="home-footer-text">
              &copy; 2024 FleetTrackR. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;