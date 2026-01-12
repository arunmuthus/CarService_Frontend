import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login';
import CustomerLogin from './views/CustomerLogin';
import AdvisorDashboard from './views/AdvisorDashboard';
import TechnicianDashboard from './views/TechnicianDashboard';
import CustomerDashboard from './views/CustomerDashboard';
import Header from './components/Header';
import { useAuth } from './context/AuthContext';

function App() {
    const { user } = useAuth();

    return (
        <Router>
            {user && <Header />}
            <Routes>
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                <Route path="/track-login" element={!user ? <CustomerLogin /> : <Navigate to="/" />} />

                <Route path="/advisor" element={user && (user.role === 'ADVISOR' || user.role === 'ADMIN') ? <AdvisorDashboard /> : <Navigate to="/login" />} />
                <Route path="/technician" element={user && user.role === 'TECHNICIAN' ? <TechnicianDashboard /> : <Navigate to="/login" />} />
                <Route path="/track-vehicle" element={user && user.role === 'CUSTOMER' ? <CustomerDashboard /> : <Navigate to="/track-login" />} />

                <Route path="/" element={() => {
                    if (!user) return <Navigate to="/login" />;
                    if (user.role === 'ADVISOR' || user.role === 'ADMIN') return <Navigate to="/advisor" />;
                    if (user.role === 'TECHNICIAN') return <Navigate to="/technician" />;
                    if (user.role === 'CUSTOMER') return <Navigate to="/track-vehicle" />;
                    return <Navigate to="/login" />;
                }} />
            </Routes>
        </Router>
    );
}

export default App;
