import { Navigate, Outlet } from "react-router-dom";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" />;

  return (
    <div className="app-3d-container" style={{
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      display: 'flex',
      gap: '20px',
      padding: '20px',
      perspective: '1200px' // THE 3D MAGIC
    }}>
      {/* Floating 3D Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0, rotateY: 15 }}
        animate={{ x: 0, opacity: 1, rotateY: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        style={{ height: '100%', flexShrink: 0 }}
      >
        <Sidebar />
      </motion.div>

      {/* Main Content Area - Floating Glass */}
      <motion.div
        className="main glass-panel layout-main"
        initial={{ x: 100, opacity: 0, rotateY: -10 }}
        animate={{ x: 0, opacity: 1, rotateY: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          borderRadius: '24px',
          // background handled by CSS now
        }}
      >
        <Navbar />
        <div className="content-area" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
};

export default ProtectedRoute;
