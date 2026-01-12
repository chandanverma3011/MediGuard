import { useState, useEffect } from "react";
import axios from "axios";

const Analytics = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get('http://localhost:5000/api/analytics/demand-drift', config);
                setEvents(res.data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div className="dashboard-container">
            <main className="main-content">
                <header className="page-header">
                    <div>
                        <h2>Demand Drift Analytics</h2>
                        <p style={{ color: 'var(--muted)', marginTop: '4px' }}>AI-driven detection of abnormal changes in medicine consumption trends.</p>
                    </div>
                </header>

                {loading ? (
                    <div style={{ color: 'var(--muted)', padding: '20px' }}>Analyzing consumption patterns...</div>
                ) : events.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
                        <h3 style={{ color: 'var(--text)' }}>No Anomalies Detected</h3>
                        <p style={{ color: 'var(--muted)', marginTop: '8px' }}>
                            All consumption trends are stable within expected baselines.
                        </p>
                    </div>
                ) : (
                    <div className="analytics-grid">
                        {events.map(event => {
                            const isSurge = event.driftType === 'SURGE';
                            return (
                                <div key={event._id} className={`drift-card ${isSurge ? 'surge' : 'drop'}`}>
                                    <div className="drift-icon">
                                        {isSurge ? '📈' : '📉'}
                                    </div>

                                    <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text)' }}>
                                        {event.medicineId?.name || 'Unknown Medicine'}
                                    </h3>

                                    <div className={`drift-badge ${isSurge ? 'surge' : 'drop'}`}>
                                        {event.driftType} DETECTED
                                    </div>

                                    <div className="stat-row">
                                        <div>
                                            <div className="stat-label">Baseline (14d)</div>
                                            <div className="stat-value">{event.baselineAvg.toFixed(1)} <span style={{ fontSize: '12px', fontWeight: '400', color: 'var(--muted)' }}>units/day</span></div>
                                        </div>
                                        <div>
                                            <div className="stat-label">Current (7d)</div>
                                            <div className="stat-value">{event.currentAvg.toFixed(1)} <span style={{ fontSize: '12px', fontWeight: '400', color: 'var(--muted)' }}>units/day</span></div>
                                        </div>
                                    </div>

                                    <div className={`drift-change ${isSurge ? 'surge' : 'drop'}`}>
                                        <span>
                                            {event.percentChange > 0 ? '+' : ''}{event.percentChange.toFixed(1)}% Change
                                        </span>
                                        <span className="drift-date">
                                            {new Date(event.detectedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Analytics;
