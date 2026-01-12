import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CustomerLogin() {
    const [plate, setPlate] = useState('CAM-01');
    const [pin, setPin] = useState('1234');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('auth/customer-login', { licensePlate: plate, pin });
            login(res.data);
            navigate('/track-vehicle');
        } catch (err) {
            console.error(err);
            if (err.response) {
                const status = err.response.status;
                const data = err.response.data;
                if (status === 401) {
                    setError(data || "Invalid Vehicle Number or PIN");
                } else {
                    const msg = (data && (data.message || data.details || data)) || `Server error (${status})`;
                    setError(msg);
                }
            } else {
                setError("Network error. Is the backend running?");
            }
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--primary)' }}>Track Your Vehicle</h2>
                <p style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>Enter Vehicle Number and PIN</p>

                {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="label">Vehicle Number (Plate)</label>
                        <input
                            className="input"
                            placeholder="e.g. CAM-01"
                            value={plate}
                            onChange={(e) => setPlate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">PIN</label>
                        <input
                            className="input"
                            type="password"
                            placeholder="Default: 1234"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn" style={{ width: '100%' }}>Track Status</button>
                </form>

                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Employee Login</a>
                </div>
            </div>
        </div>
    );
}
