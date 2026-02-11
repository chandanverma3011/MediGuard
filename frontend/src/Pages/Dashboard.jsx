import { useState, useEffect } from "react";
import api from "../Services/api";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStock: 0,
    expiringSoon: 0,
    totalBatches: 0
  });
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 1. Check Admin from LocalStorage (Simple & Fast)
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    if (user && user.role === 'admin') setIsAdmin(true);

    const fetchData = async () => {
      try {
        if (!localStorage.getItem('token')) return;

        const statsRes = await api.get('/dashboard/stats');
        setStats(statsRes.data);

        // Fetch Pending Users if Admin
        if (user && user.role === 'admin') {
          const usersRes = await api.get('/auth/pending');
          setPendingUsers(usersRes.data);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {

      await api.put(`/auth/${id}/approve`);
      // Remove from list
      setPendingUsers(prev => prev.filter(u => u._id !== id));
      alert("User Approved!");
    } catch {
      alert("Approval failed");
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '24px', color: 'var(--text)' }}>Dashboard Overview</h2>

      {/* 1. CRITICAL / EXPIRED BLOCKING BANNER */}
      {stats.alertBreakdown && (stats.alertBreakdown.CRITICAL > 0 || stats.alertBreakdown.EXPIRED > 0) && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #ef4444',
          color: '#b91c1c',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: 'bold'
        }}>
          <span style={{ fontSize: '24px' }}>⚠️</span>
          <div>
            ACTION REQUIRED: {stats.alertBreakdown.CRITICAL || 0} Critical & {stats.alertBreakdown.EXPIRED || 0} Expired Batches found.
            <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '4px' }}>Immediate removal or verification required.</div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--muted)' }}>Loading stats...</div>
      ) : (
        <div className="grid">
          {/* Main Inventory Card */}
          <motion.div
            className="card glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -10, rotateX: 5, rotateY: 5, boxShadow: "0 20px 50px -10px rgba(0, 240, 255, 0.3)" }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{ borderLeft: '4px solid var(--neon-blue)' }}
          >
            <h3 style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>Total Inventory</h3>
            <div style={{ fontSize: '42px', fontWeight: '700', color: 'var(--text)', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>{stats.totalBatches}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Batches in stock</div>
          </motion.div>

          {/* Warning Card */}
          <motion.div
            className="card glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -10, rotateX: 5, rotateY: 5, boxShadow: "0 20px 50px -10px rgba(217, 119, 6, 0.3)" }}
            style={{ borderLeft: '4px solid #f59e0b' }}
          >
            <h3 style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>Warning (16-30 Days)</h3>
            <div style={{ fontSize: '42px', fontWeight: '700', color: '#f59e0b', textShadow: '0 0 15px rgba(245, 158, 11, 0.4)' }}>
              {stats.alertBreakdown?.WARNING || 0}
            </div>
          </motion.div>

          {/* Urgent Card */}
          <motion.div
            className="card glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -10, rotateX: 5, rotateY: 5, boxShadow: "0 20px 50px -10px rgba(234, 88, 12, 0.3)" }}
            style={{ borderLeft: '4px solid #f97316' }}
          >
            <h3 style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>Urgent (8-15 Days)</h3>
            <div style={{ fontSize: '42px', fontWeight: '700', color: '#ea580c', textShadow: '0 0 15px rgba(234, 88, 12, 0.4)' }}>
              {stats.alertBreakdown?.URGENT || 0}
            </div>
          </motion.div>

          {/* Critical Card */}
          <motion.div
            className="card glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -10, rotateX: 5, rotateY: 5, boxShadow: "0 20px 50px -10px rgba(220, 38, 38, 0.3)" }}
            style={{ borderLeft: '4px solid #ef4444' }}
          >
            <h3 style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>Critical (≤ 7 Days)</h3>
            <div style={{ fontSize: '42px', fontWeight: '700', color: '#ef4444', textShadow: '0 0 15px rgba(220, 38, 38, 0.4)' }}>
              {stats.alertBreakdown?.CRITICAL || 0}
            </div>
          </motion.div>
        </div>
      )}

      {/* Admin Approval Section */}
      {isAdmin && pendingUsers.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--text)' }}>Pending Access Requests</h3>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="badge" style={{ fontSize: '12px' }}>{user.role}</span>
                    </td>
                    <td>
                      <button
                        className="btn"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleApprove(user._id)}
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
