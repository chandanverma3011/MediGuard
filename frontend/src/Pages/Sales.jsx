import { useState, useEffect } from "react";
import axios from "axios";

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        medicineId: "",
        quantity: ""
    });

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [salesRes, medicinesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/sales', config),
                axios.get('http://localhost:5000/api/medicines', config)
            ]);

            setSales(salesRes.data);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.post('http://localhost:5000/api/sales', {
                medicineId: formData.medicineId,
                quantity: Number(formData.quantity)
            }, config);

            // Reset form and refresh list
            setFormData({ medicineId: "", quantity: "" });
            fetchData();
            alert("Sale recorded successfully!");
        } catch (error) {
            console.error("Sale Error:", error);
            alert(error.response?.data?.message || "Error recording sale");
        }
    };

    return (
        <div className="dashboard-container">
            <main className="main-content">
                <header className="page-header">
                    <h2>Sales Management</h2>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>

                    {/* New Sale Form */}
                    <div className="card">
                        <h3 style={{ marginTop: 0, color: 'var(--text)' }}>New Sale</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '14px' }}>Medicine</label>
                                <select
                                    name="medicineId"
                                    value={formData.medicineId}
                                    onChange={handleInputChange}
                                    className="glass-input"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--panel)',
                                        color: 'var(--text)',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        appearance: 'none',
                                        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 12px center',
                                        backgroundSize: '12px',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                    required
                                >
                                    <option value="" style={{ background: '#0f172a', color: 'var(--text)' }}>Select Medicine</option>
                                    {medicines.map(med => (
                                        <option key={med._id} value={med._id} style={{ background: '#0f172a', color: 'var(--text)' }}>
                                            {med.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)', fontSize: '14px' }}>Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    className="glass-input"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--panel)',
                                        color: 'var(--text)',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn" style={{ width: '100%' }}>Record Sale</button>
                        </form>
                    </div>

                    {/* Sales History */}
                    <div className="card">
                        <h3 style={{ marginTop: 0, color: 'var(--text)', marginBottom: '16px' }}>Recent Sales</h3>
                        {loading ? (
                            <p>Loading sales...</p>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Medicine</th>
                                            <th>Quantity</th>
                                            <th>Sold By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sales.map((sale) => (
                                            <tr key={sale._id}>
                                                <td style={{ color: 'var(--muted)' }}>{new Date(sale.saleDate).toLocaleDateString()} {new Date(sale.saleDate).toLocaleTimeString()}</td>
                                                <td style={{ color: 'var(--text)', fontWeight: '500' }}>{sale.medicineId?.name || 'Unknown'}</td>
                                                <td style={{ color: 'var(--text)' }}>{sale.totalQuantity}</td>
                                                <td style={{ color: 'var(--muted)' }}>{sale.soldBy?.name || 'Admin'}</td>
                                            </tr>
                                        ))}
                                        {sales.length === 0 && (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>No sales recorded yet</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Sales;
