import { useState, useEffect } from "react";
import api from "../Services/api";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await api.get("/auth/users");
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await api.delete(`/auth/users/${id}`);
                fetchUsers(); // Refresh list
            } catch (error) {
                alert("Error deleting user");
            }
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="dashboard-container">
            <main className="main-content">
                <header className="page-header">
                    <h2>User Management</h2>
                </header>

                <div className="analytics-grid" style={{ marginBottom: '32px' }}>
                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%',
                            backgroundColor: 'rgba(13, 148, 136, 0.1)', color: 'var(--accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <div>
                            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '4px' }}>Total Registered Users</p>
                            <h3 style={{ fontSize: '28px', color: 'var(--text)', margin: 0 }}>{users.length}</h3>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <p>Loading users...</p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td style={{ fontWeight: "600", color: "var(--text)" }}>{user.name}</td>
                                        <td style={{ color: "var(--text)" }}>{user.email}</td>
                                        <td>
                                            <span style={{
                                                padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600", textTransform: "uppercase",
                                                background: user.role === 'admin' ? '#e0e7ff' : '#f0fdfa',
                                                color: user.role === 'admin' ? '#3730a3' : '#0f766e'
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge-common ${user.isApproved ? 'badge-safe' : 'badge-warning'}`}>
                                                {user.isApproved ? 'Active' : 'Pending'}
                                            </span>
                                        </td>
                                        <td style={{ color: "var(--muted)" }}>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <td>
                                                {user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleDelete(user._id)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Users;
