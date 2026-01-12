import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';

const RoleSync = () => {
    const { getToken } = useAuth();
    const { user } = useUser();

    useEffect(() => {
        const syncRole = async () => {
            // 1. Get Token
            const token = await getToken();
            if (!token) return;

            try {
                // 2. Fetch Profile from Backend (which has the MongoDB Role)
                const res = await axios.get('http://localhost:5000/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const dbUser = res.data;
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

                // 3. Check for mismatch
                if (storedUser.role !== dbUser.role || storedUser.email !== dbUser.email) {
                    console.log("Role Mismatch - Syncing...", dbUser);
                    localStorage.setItem('user', JSON.stringify(dbUser));
                    localStorage.setItem('token', token); // Legacy components might use this

                    // Force reload to update Sidebar/Dashboard immediately
                    window.location.reload();
                } else {
                    // Update token if just expired/missing but user is same
                    localStorage.setItem('token', token);
                }

            } catch (err) {
                console.error("Role Sync Failed", err);
            }
        };

        if (user) {
            syncRole();
        }
    }, [user, getToken]);

    return null; // Invisible component
};

export default RoleSync;
