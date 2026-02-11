import { useState, useEffect } from "react";
import api from "../Services/api";

const Disposals = () => {
    const [disposals, setDisposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchDisposals = async () => {
            try {
                const res = await api.get(
                    "/disposals"
                );
                setDisposals(res.data);
            } catch (error) {
                console.error("Error fetching disposals:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDisposals();
    }, []);

    return (
        <div className="dashboard-container">
            <main className="main-content">
                <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Disposal Audit Log</h2>
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
                            placeholder="Search disposals..."
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
                </header>

                {loading ? (
                    <p>Loading records...</p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Medicine</th>
                                    <th>Batch</th>
                                    <th>Qty</th>
                                    <th>Method</th>
                                    <th>Reason</th>
                                    <th>Approved By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {disposals.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                                            No disposal records found.
                                        </td>
                                    </tr>
                                ) : (
                                    disposals
                                        .filter(log => {
                                            const term = searchTerm.toLowerCase().trim();
                                            if (!term) return true; // Show all if search is empty

                                            // Safe Date Inspection
                                            let dateStr = "";
                                            let isoDateStr = "";
                                            try {
                                                if (log.disposedAt) {
                                                    const d = new Date(log.disposedAt);
                                                    if (!isNaN(d.getTime())) {
                                                        dateStr = d.toLocaleDateString().toLowerCase();
                                                        isoDateStr = d.toISOString().slice(0, 10);
                                                    }
                                                }
                                            } catch {
                                                // Ignore date parsing errors
                                            }

                                            return (
                                                (log.batchNumber && log.batchNumber.toLowerCase().includes(term)) ||
                                                (log.medicineId?.name && log.medicineId.name.toLowerCase().includes(term)) ||
                                                (log.method && log.method.toLowerCase().replace(/_/g, ' ').includes(term)) ||
                                                (log.reason && log.reason.toLowerCase().includes(term)) ||
                                                (dateStr && dateStr.includes(term)) ||
                                                (isoDateStr && isoDateStr.includes(term))
                                            );
                                        })
                                        .map((log) => (
                                            <tr key={log._id}>
                                                <td style={{ color: "var(--muted)" }}>
                                                    {new Date(log.disposedAt).toLocaleDateString()}
                                                </td>
                                                <td style={{ fontWeight: "600", color: "var(--text)" }}>
                                                    {log.medicineId?.name || "Unknown"}
                                                </td>
                                                <td>{log.batchNumber}</td>
                                                <td>{log.quantityDisposed}</td>
                                                <td>
                                                    <span
                                                        style={{
                                                            display: "inline-block",
                                                            padding: "4px 8px",
                                                            borderRadius: "4px",
                                                            background: "var(--pattern-bg)",
                                                            fontSize: "12px",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        {log.method.replace(/_/g, " ")}
                                                    </span>
                                                </td>
                                                <td style={{ color: "var(--text)" }}>{log.reason}</td>
                                                <td style={{ fontSize: "13px", color: "var(--muted)" }}>
                                                    {log.approvedBy?.name || "Admin"}
                                                </td>
                                            </tr>
                                        ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Disposals;
