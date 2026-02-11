import LandingNavbar from "../Components/LandingNavbar";

const Features = () => {
    return (
        <div className="landing-page">
            <LandingNavbar />

            <div className="landing-container" style={{ padding: '60px 24px' }}>
                <h1 style={{ fontSize: '36px', color: 'var(--text)', marginBottom: '24px', textAlign: 'center' }}>Key Features</h1>
                <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '60px', maxWidth: '600px', margin: '0 auto 60px' }}>
                    Everything you need to manage your pharmacy inventory efficiently and safely.
                </p>

                <div className="grid">
                    <div className="card">
                        <h3 style={{ color: 'var(--accent)', marginBottom: '12px' }}>Real-time Stock Alerts</h3>
                        <p style={{ color: 'var(--text)' }}>Get instant notifications when medicine stock falls below the threshold. Never run out of essential supplies.</p>
                    </div>
                    <div className="card">
                        <h3 style={{ color: 'var(--accent)', marginBottom: '12px' }}>Expiry Tracking</h3>
                        <p style={{ color: 'var(--text)' }}>Automated alerts for medicines nearing expiration. Prevent losses and ensure patient safety by removing expired drugs on time.</p>
                    </div>
                    <div className="card">
                        <h3 style={{ color: 'var(--accent)', marginBottom: '12px' }}>Batch Management</h3>
                        <p style={{ color: 'var(--text)' }}>Track medicines by batch numbers for precise inventory control and easy recall management if necessary.</p>
                    </div>
                    <div className="card">
                        <h3 style={{ color: 'var(--accent)', marginBottom: '12px' }}>Supplier Integration</h3>
                        <p style={{ color: 'var(--text)' }}>Manage supplier details and order history in one place. Streamline your reordering process.</p>
                    </div>
                    <div className="card">
                        <h3 style={{ color: 'var(--accent)', marginBottom: '12px' }}>Detailed Analytics</h3>
                        <p style={{ color: 'var(--text)' }}>Visual reports on inventory turnover, stock value, and expiry trends to help you make informed business decisions.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Features;
