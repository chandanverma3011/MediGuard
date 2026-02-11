import { useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const LandingNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="landing-nav" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="landing-container nav-content">
                <div className="brand-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/mediguard.svg" alt="MediGuard Logo" style={{ width: '32px', height: '32px' }} />
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>MediGuard</span>
                </div>
                <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <span
                        onClick={() => navigate('/features')}
                        style={{
                            cursor: 'pointer',
                            color: isActive('/features') ? 'var(--accent)' : 'var(--text)',
                            fontWeight: isActive('/features') ? '600' : '500'
                        }}
                    >
                        Features
                    </span>
                    <span
                        onClick={() => navigate('/about')}
                        style={{
                            cursor: 'pointer',
                            color: isActive('/about') ? 'var(--accent)' : 'var(--text)',
                            fontWeight: isActive('/about') ? '600' : '500'
                        }}
                    >
                        About
                    </span>
                    <span
                        onClick={() => navigate('/contact')}
                        style={{
                            cursor: 'pointer',
                            color: isActive('/contact') ? 'var(--accent)' : 'var(--text)',
                            fontWeight: isActive('/contact') ? '600' : '500'
                        }}
                    >
                        Contact
                    </span>
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
};

export default LandingNavbar;
