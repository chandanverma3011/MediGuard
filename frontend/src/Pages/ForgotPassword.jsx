import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [devLink, setDevLink] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setDevLink(null);
        try {
            const res = await axios.post("http://localhost:5000/api/auth/forgotpassword", { email });
            setMessage(res.data.data);
            if (res.data.resetUrl) {
                setDevLink(res.data.resetUrl);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Email not found");
        }
    };

    return (
        <div className="landing-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div className="login-card" style={{ maxWidth: '400px' }}>
                <div className="login-header">
                    <h2>Forgot Password</h2>
                    <p>Enter your email to request a reset link</p>
                </div>

                {message && <div style={{ marginBottom: '16px', padding: '12px', background: '#dcfce7', color: '#166534', borderRadius: '8px', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{message}</div>}

                {/* DEV MODE LINK DISPLAY */}
                {devLink && (
                    <div style={{ marginBottom: '16px', padding: '12px', border: '2px dashed #3b82f6', borderRadius: '8px', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>DEV MODE: SIMULATED EMAIL LINK</p>
                        <a href={devLink} className="btn" style={{ display: 'block', textDecoration: 'none', backgroundColor: '#3b82f6' }}>
                            Click to Reset Password
                        </a>
                    </div>
                )}

                {error && <div style={{ marginBottom: '16px', padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button className="btn full-width">Send Request</button>
                    <div className="login-footer">
                        <Link to="/login">Back to Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
