import LandingNavbar from "../Components/LandingNavbar";

const About = () => {
    return (
        <div className="landing-page">
            <LandingNavbar />

            <div className="landing-container" style={{ padding: '60px 24px', maxWidth: '800px' }}>
                <h1 style={{ fontSize: '36px', color: 'var(--text)', marginBottom: '32px' }}>About MediGuard</h1>

                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '24px', color: 'var(--text)', marginBottom: '16px' }}>Our Mission</h2>
                    <p style={{ fontSize: '18px', color: 'var(--muted)', lineHeight: '1.8' }}>
                        At MediGuard, our mission is to enhance patient safety and pharmacy efficiency through innovative technology. We believe that robust inventory management is the backbone of excellent healthcare delivery.
                    </p>
                </div>

                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '24px', color: 'var(--text)', marginBottom: '16px' }}>Who We Are</h2>
                    <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: '1.8', marginBottom: '16px' }}>
                        Founded by a team of pharmacists and software engineers, MediGuard understands the unique challenges faced by modern pharmacies. From managing thousands of SKUs to strictly adhering to regulation expiration guidelines, we've built a tool that simplifies complication.
                    </p>
                    <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: '1.8' }}>
                        Our system is trusted by retail pharmacies, hospital dispensaries, and clinics to keep their operations running smoothly and compliantly.
                    </p>
                </div>

                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '32px', borderRadius: '16px' }}>
                    <h3 style={{ color: 'var(--accent)', marginBottom: '12px' }}>Join the network</h3>
                    <p style={{ color: 'var(--muted)' }}>
                        Over 500+ pharmacies trust MediGuard for their daily inventory operations.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
