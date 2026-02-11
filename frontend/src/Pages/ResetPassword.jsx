import { useState } from "react";
import api from "../Services/api";
import { useNavigate, useParams } from "react-router-dom";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const { resetToken } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            await api.put(`/auth/resetpassword/${resetToken}`, { password });
            navigate("/login");
            alert("Password Reset Successfully! Please login.");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid or Expired Token");
        }
    };

    return (
        <div className="landing-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div className="login-card" style={{ maxWidth: '400px' }}>
                <div className="login-header">
                    <h2>Reset Password</h2>
                    <p>Enter your new password below</p>
                </div>

                {error && <div style={{ marginBottom: '16px', padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength="6"
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            minLength="6"
                        />
                    </div>
                    <button className="btn full-width">Reset Password</button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
