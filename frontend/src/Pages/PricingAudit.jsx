import { useState, useEffect } from "react";
import api from "../Services/api";

const PricingAudit = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showActionableOnly, setShowActionableOnly] = useState(false);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await api.get(
                    "/pricing/recommendations"
                );
                setRecommendations(res.data);
            } catch (error) {
                console.error("Error fetching pricing data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    const filteredData = showActionableOnly
        ? recommendations.filter(
            (rec) =>
                rec.status === "DISCOUNT_RECOMMENDED" ||
                rec.status === "MARGIN_PROTECTED"
        )
        : recommendations;

    const getStatusColor = (status) => {
        switch (status) {
            case "SAFE": return "bg-green-100 text-green-800";
            case "DISCOUNT_RECOMMENDED": return "bg-amber-100 text-amber-800";
            case "MARGIN_PROTECTED": return "bg-purple-100 text-purple-800";
            case "EXPIRED": return "bg-red-100 text-red-800";
            case "NOT_APPLICABLE": return "bg-gray-100 text-gray-600";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="dashboard-container">
            <main className="main-content">
                <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Pricing Decision Support</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)' }}>
                            Show Actionable Only
                        </label>
                        <input
                            type="checkbox"
                            checked={showActionableOnly}
                            onChange={(e) => setShowActionableOnly(e.target.checked)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                    </div>
                </header>

                {loading ? (
                    <p>Loading analysis...</p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Medicine / Batch</th>
                                    <th>Expiry</th>
                                    <th>Cost / MRP</th>
                                    <th>Recommendation</th>
                                    <th>Margin</th>
                                    <th>Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                                            No records found matching criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((rec) => (
                                        <tr key={rec.batchId || Math.random()} style={{ opacity: rec?.status === 'EXPIRED' ? 0.6 : 1 }}>
                                            <td>
                                                <div style={{ fontWeight: "600", color: "var(--text)" }}>{rec.medicineName || 'Unknown'}</div>
                                                <div style={{ fontSize: "12px", color: "var(--muted)" }}>{rec.batchNumber || 'N/A'}</div>
                                            </td>
                                            <td>
                                                <span className={`badge-common ${getStatusColor(rec?.status || 'SAFE')}`}>
                                                    {(rec?.status || 'SAFE').replace(/_/g, " ")}
                                                </span>
                                                <div style={{ fontSize: "11px", marginTop: "4px", color: "var(--muted)" }}>
                                                    {rec.expiryDate ? new Date(rec.expiryDate).toLocaleDateString() : 'Invalid Date'}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: "13px" }}>MRP: ₹{rec.originalMRP || 0}</div>
                                                <div style={{ fontSize: "11px", color: "var(--muted)" }}>Cost: ₹{rec.costPrice || 0}</div>
                                            </td>
                                            <td>
                                                {(rec?.status === 'DISCOUNT_RECOMMENDED' || rec?.status === 'MARGIN_PROTECTED') ? (
                                                    <div>
                                                        <div style={{ fontWeight: "bold", color: "var(--accent)", fontSize: "15px" }}>
                                                            ₹{rec.recommendedPrice || 0}
                                                        </div>
                                                        <div style={{ fontSize: "11px", color: "#ef4444", fontWeight: "600" }}>
                                                            {rec.effectiveDiscountPercent || 0}% OFF
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: "var(--muted)", fontSize: "13px" }}>No Change</span>
                                                )}
                                            </td>
                                            <td>
                                                {/* Margin calculation: (Selling - Cost) / Selling */}
                                                {rec?.status !== 'EXPIRED' && rec?.status !== 'NOT_APPLICABLE' && rec.recommendedPrice > 0 && (
                                                    <div style={{
                                                        color: (rec.recommendedPrice > rec.costPrice) ? '#10b981' : '#ef4444',
                                                        fontWeight: '600'
                                                    }}>
                                                        {Math.round(((rec.recommendedPrice - rec.costPrice) / rec.recommendedPrice) * 100)}%
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ maxWidth: "250px", fontSize: "12px", color: "var(--text)", lineHeight: "1.4" }}>
                                                {rec.reason || 'No reason provided'}
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

export default PricingAudit;
