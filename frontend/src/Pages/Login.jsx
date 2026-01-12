import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem("token", "demo-token");
    navigate("/dashboard");
  };

  return (
    <form className="login card" onSubmit={handleLogin}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <img src="/mediguard.svg" alt="MediGuard" style={{ width: '48px', height: '48px' }} />
      </div>
      <h2 style={{ marginBottom: 12, textAlign: 'center' }}>MediGuard Login</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <div style={{ textAlign: 'right', margin: '8px 0' }}>
        <a href="/forgot-password" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '14px' }}>Forgot Password?</a>
      </div>
      <button className="btn" style={{ marginTop: 8 }}>Login</button>
    </form>
  );
};

export default Login;
