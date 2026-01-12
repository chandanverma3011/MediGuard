import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LandingNavbar from "../components/LandingNavbar";

const Landing = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const payload = isLogin ? { email, password } : { name, email, password };
      const { data } = await axios.post(`http://localhost:5000${endpoint}`, payload);

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
        navigate("/dashboard");
      } else {
        setSuccessMsg("Registration successful! Your account is pending Admin approval.");
        setIsLogin(true); // Switch back to login
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Authentication failed";
      setError(msg);
      // alert(`Error: ${msg}`); 
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="landing-page">
      {/* Navbar */}
      <LandingNavbar />

      {/* Hero Section */}
      <header className="hero-section">
        <div className="landing-container hero-content">
          <div className="hero-text">
            <h1>Precision Pharmacy Inventory Management</h1>
            <p>
              Streamline your pharmacy operations with real-time stock alerts, batch tracking, and expiry notifications.
              Ensure patient safety and operational efficiency with MediGuard.
            </p>
            <div className="hero-badges">
              <span className="badge">✓ Real-time Tracking</span>
              <span className="badge">✓ Expiry Alerts</span>
              <span className="badge">✓ Batch Management</span>
            </div>
          </div>

          <div className="hero-login">
            <div className="login-card">
              <div className="login-header">
                <h2>{isLogin ? 'Welcome Back' : 'Join MediGuard'}</h2>
                <p>{isLogin ? 'Access your pharmacy dashboard' : 'Create a Pharmacist account'}</p>
                {/* Success Message */}
                {successMsg && <p style={{ color: '#10b981', fontSize: '14px', marginTop: '8px', fontWeight: 'bold' }}>{successMsg}</p>}
                {error && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>{error}</p>}
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@pharmacy.com"
                    required
                  />
                </div>
                {!isLogin && (
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                </div>
                {isLogin && (
                  <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                    <a href="/forgot-password" style={{ color: '#14b8a6', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Forgot password?</a>
                  </div>
                )}
                <button type="submit" className="btn full-width">
                  {isLogin ? 'Sign In to Dashboard' : 'Submit Request'}
                </button>
              </form>
              <div className="login-footer">
                <p>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={toggleAuthMode}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      padding: 0,
                      fontFamily: 'inherit',
                      fontSize: 'inherit'
                    }}
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Wave attached to Hero */}
        <div className="wave-divider">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>
      </header>

      {/* Features Section */}
      <section className="how-it-works" style={{ flex: 1 }}>
        <div className="landing-container">
          <div className="section-header">
            <h2>Why Choose MediGuard?</h2>
            <p>Empowering pharmacies with next-generation tools.</p>
          </div>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <h3>Smart Analytics</h3>
              <p>Visualize your inventory trends and predict stock needs before they become critical.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔔</div>
              <h3>Instant Alerts</h3>
              <p>Receive notifications via Email and SMS for low stock and expiring medicines.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🛡️</div>
              <h3>Compliance Ready</h3>
              <p>Maintain full audit trails and batch tracking to support regulatory compliance.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container footer-content">
          <div className="footer-brand">
            <div className="brand-logo" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/mediguard.svg" alt="MediGuard Logo" style={{ width: '24px', height: '24px' }} />
              <span>MediGuard</span>
            </div>
            <p>Your partner in safe and efficient pharmacy management.</p>
          </div>

          <div className="footer-links-col">
            <h4>Quick Links</h4>
            <a href="/features">Features</a>
            <a href="/about">About Us</a>
            <a href="/contact">Contact</a>
          </div>

          <div className="footer-links-col">
            <h4>Legal</h4>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/compliance">Compliance</a>
          </div>

          <div className="footer-links-col">
            <h4>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span>support@mediguard.com</span>
              <span>+1 (555) 123-4567</span>
              <div className="social-icons" style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <span style={{ cursor: 'pointer', opacity: 0.8 }}>🐦</span>
                <span style={{ cursor: 'pointer', opacity: 0.8 }}>📘</span>
                <span style={{ cursor: 'pointer', opacity: 0.8 }}>📸</span>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom" style={{ borderTop: '1px solid var(--glass-border)', marginTop: '40px', paddingTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          © 2024 MediGuard Systems. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default Landing;
