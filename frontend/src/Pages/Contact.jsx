import LandingNavbar from "../Components/LandingNavbar";

const Contact = () => {
    return (
        <div className="landing-page">
            <LandingNavbar />

            <div className="landing-container" style={{ padding: '60px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', color: 'var(--text)', marginBottom: '24px' }}>Get in Touch</h1>
                        <p style={{ fontSize: '18px', color: 'var(--muted)', marginBottom: '40px' }}>
                            Have questions about our enterprise solutions or need support? Our team is ready to help.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', background: 'var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    📧
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text)' }}>Email Us</div>
                                    <div style={{ color: 'var(--accent)' }}>support@mediguard.com</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', background: 'var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    📍
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text)' }}>Visit Us</div>
                                    <div style={{ color: 'var(--muted)' }}>123 Health Tech Park, Innovation Way</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', background: 'var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    📞
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text)' }}>Call Us</div>
                                    <div style={{ color: 'var(--muted)' }}>+1 (555) 123-4567</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Send us a Message</h2>
                        <form>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Name</label>
                            <input type="text" placeholder="Your Name" style={{ marginBottom: '16px' }} />

                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
                            <input type="email" placeholder="you@company.com" style={{ marginBottom: '16px' }} />

                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Message</label>
                            <textarea style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', minHeight: '120px', marginBottom: '20px', resize: 'vertical' }} placeholder="How can we help you?"></textarea>

                            <button type="button" className="btn" style={{ width: '100%' }}>Send Message</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
