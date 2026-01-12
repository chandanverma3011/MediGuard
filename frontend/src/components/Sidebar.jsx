import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="sidebar glass-panel" style={{ height: '100%', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
      <div className="logo" style={{ textShadow: '0 0 15px var(--neon-blue)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/mediguard.svg" alt="MediGuard Logo" style={{ width: '32px', height: '32px' }} />
        <span style={{ fontSize: '20px', fontWeight: 'bold', background: 'linear-gradient(to right, #00f0ff, #bc13fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MediGuard</span>
      </div>
      <nav className="nav-list" style={{ marginTop: '20px' }}>
        {[
          { path: "/dashboard", label: "Dashboard", icon: "📊" },
          { path: "/medicines", label: "Medicines", icon: "💊" },
          { path: "/forecast", label: "Forecast", icon: "📉" },
          { path: "/batches", label: "Batches", icon: "📦" },
          { path: "/pricing", label: "Pricing", icon: "💲" },
          ...(isAdmin ? [{ path: "/users", label: "Users", icon: "👥" }] : [])
        ].map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{link.icon}</span>
            <span className="nav-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside >
  );
};

export default Sidebar;
