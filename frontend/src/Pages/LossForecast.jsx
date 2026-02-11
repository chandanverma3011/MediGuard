import { useState, useEffect } from "react";
import api from "../Services/api";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars

const LossForecast = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                const { data } = await api.get("/analytics/loss-forecast");
                setData(data);
            } catch (error) {
                console.error("Error fetching forecast:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchForecast();
    }, []);

    if (loading) return <div style={{ padding: '24px', color: 'var(--muted)' }}>Calculating Forecast...</div>;
    if (!data) return <div style={{ padding: '24px', color: 'var(--muted)' }}>No forecast data available.</div>;

    const { summary, details } = data;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="dashboard-container">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Loss Forecast</h2>
                    <p style={{ color: 'var(--muted)' }}>Projected financial impact of unsold inventory expiring within 30 days.</p>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '40px' }}>
                <motion.div
                    className="card glass-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ borderLeft: '4px solid #ef4444' }}
                >
                    <h3 style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>Total Projected Loss</h3>
                    <div style={{ fontSize: '36px', fontWeight: '800', color: '#ef4444' }}>
                        {formatCurrency(summary.totalPotentialLoss)}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
                        Across {summary.totalBatchesAtRisk} batches
                    </p>
                </motion.div>

                <motion.div
                    className="card glass-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ borderLeft: '4px solid #f59e0b' }}
                >
                    <h3 style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>Risk Breakdown</h3>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', height: '60px' }}>
                        {Object.entries(summary.riskBreakdown).map(([level, amount]) => (
                            <div key={level} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{level}</div>
                                <div style={{
                                    height: '6px',
                                    background: level === 'HIGH' ? '#ef4444' : level === 'MEDIUM' ? '#f59e0b' : '#3b82f6',
                                    borderRadius: '4px',
                                    width: '100%'
                                }}></div>
                                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>
                                    {formatCurrency(amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Detailed Table */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text)' }}>At-Risk Batches</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Batch / Product</th>
                                <th>Expiry</th>
                                <th>Risk Level</th>
                                <th>Stock</th>
                                <th>Cost</th>
                                <th>Est. Loss</th>
                            </tr>
                        </thead>
                        <tbody>
                            {details.map(batch => (
                                <tr key={batch._id}>
                                    <td>
                                        <div style={{ fontWeight: '600', color: 'var(--text)' }}>{batch.medicineName}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{batch.batchNumber}</div>
                                    </td>
                                    <td>
                                        <div style={{ color: batch.daysToExpiry <= 7 ? '#ef4444' : 'var(--text)' }}>
                                            {new Date(batch.expiryDate).toLocaleDateString()}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{batch.daysToExpiry} days left</div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${batch.riskLevel === 'HIGH' ? 'danger' : batch.riskLevel === 'MEDIUM' ? 'warning' : 'safe'}`} style={{
                                            backgroundColor: batch.riskLevel === 'LOW' ? 'rgba(59, 130, 246, 0.1)' : undefined,
                                            color: batch.riskLevel === 'LOW' ? '#3b82f6' : undefined,
                                            borderColor: batch.riskLevel === 'LOW' ? 'rgba(59, 130, 246, 0.3)' : undefined
                                        }}>
                                            {batch.riskLevel}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text)' }}>{batch.stock}</td>
                                    <td style={{ color: 'var(--muted)' }}>{formatCurrency(batch.costPrice)}</td>
                                    <td style={{ fontWeight: 'bold', color: 'var(--text)' }}>{formatCurrency(batch.estimatedLossValue)}</td>
                                </tr>
                            ))}
                            {details.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                                        No at-risk inventory detected. Good job!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LossForecast;
