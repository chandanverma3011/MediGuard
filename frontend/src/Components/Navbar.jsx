import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user] = useState(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    return userData || { name: 'User', email: '', role: '' };
  });

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      if (!localStorage.getItem("token")) return;

      const { data } = await api.get("/notifications");
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchNotifications();
    };
    init();

    // Poll every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  return (
    <header className="topbar">
      <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <h1
          onClick={() => navigate('/dashboard')}
          style={{ cursor: 'pointer', opacity: window.location.pathname === '/dashboard' ? 1 : 0.5, fontSize: '20px', margin: 0 }}
        >
          Overview
        </h1>
        <h1
          onClick={() => navigate('/medicines')}
          style={{ cursor: 'pointer', opacity: window.location.pathname === '/medicines' ? 1 : 0.5, fontSize: '20px', margin: 0 }}
        >
          Medicines
        </h1>
        <h1
          onClick={() => navigate('/batches')}
          style={{ cursor: 'pointer', opacity: window.location.pathname === '/batches' ? 1 : 0.5, fontSize: '20px', margin: 0 }}
        >
          Batches
        </h1>
        <h1
          onClick={() => navigate('/sales')}
          style={{ cursor: 'pointer', opacity: window.location.pathname === '/sales' ? 1 : 0.5, fontSize: '20px', margin: 0 }}
        >
          Sales
        </h1>
        <h1
          onClick={() => navigate('/analytics')}
          style={{ cursor: 'pointer', opacity: window.location.pathname === '/analytics' ? 1 : 0.5, fontSize: '20px', margin: 0 }}
        >
          Analytics
        </h1>
        {user?.role === 'admin' && (
          <>
            <h1
              onClick={() => navigate('/disposals')}
              style={{ cursor: 'pointer', opacity: window.location.pathname === '/disposals' ? 1 : 0.5, fontSize: '20px', margin: 0 }}
            >
              Disposals
            </h1>
          </>
        )}
        <h1
          onClick={() => navigate('/pricing')}
          style={{ cursor: 'pointer', opacity: window.location.pathname === '/pricing' ? 1 : 0.5, fontSize: '20px', margin: 0 }}
        >
          Pricing
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ThemeToggle />

        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              background: 'transparent',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              color: 'var(--muted)',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: '#ef4444',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--panel)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              width: '320px',
              backgroundColor: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              overflow: 'hidden',
              marginTop: '10px'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--text)' }}>Notifications</h3>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{unreadCount} unread</span>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => !notif.isRead && markAsRead(notif._id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: notif.isRead ? 'transparent' : 'rgba(16, 185, 129, 0.05)',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          color: notif.type === 'EXPIRY' ? '#ef4444' : '#f59e0b',
                          textTransform: 'uppercase'
                        }}>
                          {notif.type.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text)', lineHeight: '1.4' }}>
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--muted)'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>{user.name}</span>
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(13, 148, 136, 0.1)', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: '700' }}>
                {user.role}
              </span>
            </div>
            {/* Email removed as per request */}
          </div>
        </div>

        <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border)' }}></div>

        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--muted)',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px',
            borderRadius: '6px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = '#fef2f2'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
};


export default Navbar;
