import { useState, useEffect } from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import api from "../Services/api";

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRole, setUserRole] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    manufacturer: ""
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) setUserRole(user.role);
  }, []);

  const fetchMedicines = async () => {
    try {
      const { data } = await api.get('/medicines');
      setMedicines(data);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      alert(`Medicines Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setFormData({ name: "", category: "", manufacturer: "" });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (med) => {
    setFormData({ name: med.name, category: med.category, manufacturer: med.manufacturer });
    setCurrentId(med._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        await api.delete(`/medicines/${id}`);
        fetchMedicines(); // Refresh list
      } catch {
        alert("Error deleting medicine");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/medicines/${currentId}`, formData);
      } else {
        await api.post('/medicines', formData);
      }

      setShowModal(false);
      fetchMedicines(); // Refresh list
    } catch {
      alert("Error saving medicine");
    }
  };

  return (
    <div className="dashboard-container">
      <main className="main-content">
        <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <h2>Medicines Registry</h2>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="search-wrapper" style={{
              position: 'relative',
              width: '300px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              border: '1px solid var(--glass-border)',
              padding: '0 16px',
              transition: 'all 0.3s ease',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
            }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.2)';
                e.currentTarget.style.borderColor = 'var(--neon-blue)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
              tabIndex="-1" // Allow div to receive focus events for style change
            >
              <svg
                style={{ color: 'var(--muted)', minWidth: '18px' }}
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'white',
                  width: '100%',
                  marginLeft: '10px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            {userRole === 'admin' && (
              <button onClick={openAddModal} className="btn">
                + Add Medicine
              </button>
            )}
          </div>
        </header>

        {loading ? (
          <p>Loading medicines...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Manufacturer</th>
                  {userRole === 'admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {medicines
                  .filter(med =>
                    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    med.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    med.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((med, index) => (
                    <motion.tr
                      key={med._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    >
                      <td style={{ color: 'var(--text)' }}>{med.name}</td>
                      <td style={{ color: 'var(--muted)' }}>{med.category}</td>
                      <td style={{ color: 'var(--muted)' }}>{med.manufacturer}</td>
                      {userRole === 'admin' && (
                        <td>
                          <button
                            onClick={() => openEditModal(med)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px', color: 'var(--accent)' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(med._id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'var(--panel)', padding: '24px', borderRadius: '12px', width: '400px',
              border: '1px solid var(--border)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginTop: 0, color: 'var(--text)' }}>{isEditing ? 'Edit Medicine' : 'Add New Medicine'}</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '14px' }}>Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '14px' }}>Category</label>
                  <input
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '14px' }}>Manufacturer</label>
                  <input
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" className="btn">Save Medicine</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Medicines;
