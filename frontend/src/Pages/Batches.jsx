import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../Services/api";
import { getAlertColor, getAlertLabel } from "../utils/alertHelper";

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showDisposalModal, setShowDisposalModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Disposal Form State
  const [disposalReason, setDisposalReason] = useState("");
  const [disposalMethod, setDisposalMethod] = useState("INCINERATION");
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    batchNumber: "",
    medicineId: "",
    expiryDate: "",
    stock: 0,
    costPrice: 0,
    mrp: 0
  });

  const fetchData = async () => {
    try {
      const [batchesRes, medicinesRes] = await Promise.all([
        api.get('/batches'),
        api.get('/medicines')
      ]);

      setBatches(batchesRes.data);
      setMedicines(medicinesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setFormData({ batchNumber: "", medicineId: "", expiryDate: "", stock: 0, costPrice: 0, mrp: 0 });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (batch) => {
    setFormData({
      batchNumber: batch.batchNumber,
      medicineId: batch.medicineId?._id || "",
      expiryDate: batch.expiryDate.split('T')[0], // Format for date input
      stock: batch.stock,
      costPrice: batch.costPrice || 0,
      mrp: batch.mrp || 0
    });
    setCurrentId(batch._id);
    setIsEditing(true);
    setShowModal(true);
    setShowModal(true);
  };

  const openDisposalModal = (batch) => {
    setSelectedBatch(batch);
    setDisposalReason("");
    setDisposalMethod("INCINERATION");
    setShowDisposalModal(true);
  };

  const handleDisposal = async (e) => {
    e.preventDefault();
    if (!disposalReason) return alert("Reason is required");

    try {
      await api.post('/disposals', {
        batchId: selectedBatch._id,
        reason: disposalReason,
        method: disposalMethod
      });

      setShowDisposalModal(false);
      fetchData(); // Refresh list
      alert("Batch disposed successfully.");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Disposal failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      try {
        await api.delete(`/batches/${id}`);
        fetchData(); // Refresh list
      } catch {
        alert("Error deleting batch");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/batches/${currentId}`, formData);
      } else {
        await api.post('/batches', formData);
      }

      setShowModal(false);
      fetchData(); // Refresh list
    } catch {
      alert("Error saving batch");
    }
  };



  return (
    <div className="dashboard-container">
      <main className="main-content">
        <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <h2>Batch Registry</h2>
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
              tabIndex="-1"
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
                placeholder="Search batches..."
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
            <button onClick={openAddModal} className="btn">
              + Add Batch
            </button>
          </div>
        </header>

        {loading ? (
          <p>Loading batches...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Medicine</th>
                  <th>MRP</th>
                  <th>Expiry</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches
                  .filter(batch =>
                    batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (batch.medicineId && batch.medicineId.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map((batch, index) => (
                    <motion.tr
                      key={batch._id}
                      style={{ opacity: batch.isLocked ? 0.6 : 1, backgroundColor: batch.isLocked ? 'rgba(0,0,0,0.05)' : 'transparent' }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    >
                      <td style={{ fontWeight: '600', color: 'var(--text)' }}>
                        {batch.batchNumber}
                        {batch.isLocked && <span title="Locked" style={{ marginLeft: '8px' }}>🔒</span>}
                      </td>
                      <td style={{ color: 'var(--text)' }}>{batch.medicineId ? batch.medicineId.name : 'Unknown'}</td>
                      <td style={{ color: 'var(--text)', fontWeight: '500' }}>₹{batch.mrp || 0}</td>
                      <td style={{ color: 'var(--muted)' }}>{new Date(batch.expiryDate).toLocaleDateString()}</td>
                      <td style={{ color: 'var(--text)' }}>{batch.stock}</td>
                      <td>
                        <span className={`badge-common ${getAlertColor(batch.cachedStatus || 'SAFE')}`}>
                          {getAlertLabel(batch.cachedStatus || 'SAFE')}
                        </span>
                      </td>
                      <td>
                        {!batch.isLocked && (
                          <button
                            onClick={() => openEditModal(batch)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px', color: 'var(--accent)' }}
                          >
                            Edit
                          </button>
                        )}
                        {(batch.cachedStatus === 'EXPIRED') && (
                          <button
                            onClick={() => openDisposalModal(batch)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px', color: '#ef4444' }}
                          >
                            Dispose
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(batch._id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                        >
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        )
        }

        {/* Modal */}
        {
          showModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'var(--panel)', padding: '24px', borderRadius: '12px', width: '400px',
                border: '1px solid var(--border)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ marginTop: 0, color: 'var(--text)' }}>{isEditing ? 'Edit Batch' : 'Add New Batch'}</h3>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '14px' }}>Batch Number</label>
                    <input
                      name="batchNumber"
                      value={formData.batchNumber}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '14px' }}>Medicine</label>
                    <select
                      name="medicineId"
                      value={formData.medicineId}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                      required
                    >
                      <option value="">Select Medicine</option>
                      {medicines.map(med => (
                        <option key={med._id} value={med._id}>{med.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '14px' }}>Expiry Date</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '14px' }}>Stock</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '14px' }}>Cost Price (₹)</label>
                      <input
                        type="number"
                        name="costPrice"
                        value={formData.costPrice}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                        min="0"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '14px' }}>MRP (₹)</label>
                      <input
                        type="number"
                        name="mrp"
                        value={formData.mrp}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                        min="0"
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" className="btn">Save Batch</button>
                  </div>
                </form>
              </div>
            </div>
          )
        }

        {/* Disposal Modal */}
        {
          showDisposalModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'var(--panel)', padding: '24px', borderRadius: '12px', width: '450px',
                border: '1px solid var(--border)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ marginTop: 0, color: '#dc2626' }}>Confirm Batch Disposal</h3>
                <p style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--muted)' }}>
                  This action is <strong>irreversible</strong>. The batch stock will be zeroed out and the record will be locked.
                </p>
                <form onSubmit={handleDisposal}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '14px' }}>Disposal Method</label>
                    <select
                      value={disposalMethod}
                      onChange={(e) => setDisposalMethod(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                    >
                      <option value="INCINERATION">Incineration</option>
                      <option value="RETURN_TO_SUPPLIER">Return to Supplier</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '14px' }}>Reason / Notes</label>
                    <textarea
                      value={disposalReason}
                      onChange={(e) => setDisposalReason(e.target.value)}
                      required
                      placeholder="e.g. Expired on 2024-01-01"
                      rows="3"
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setShowDisposalModal(false)}
                      style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn" style={{ backgroundColor: '#dc2626', color: 'white' }}>
                      Confirm Disposal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }
      </main >
    </div >
  );
};

export default Batches;
