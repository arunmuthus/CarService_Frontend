import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="header">
            <div className="container nav">
                <Link to="/" className="logo">TurboFix</Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{user.username} ({user.role})</span>
                    <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
