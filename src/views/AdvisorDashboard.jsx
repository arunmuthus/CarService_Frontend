import React, { useState } from 'react';
import api from '../services/api';

export default function AdvisorDashboard() {
    // Mode: 'SEARCH', 'REGISTER', 'CREATE_JOB', 'VIEW_JOB'
    const [mode, setMode] = useState('SEARCH');

    const [searchQuery, setSearchQuery] = useState('');
    const [vehicle, setVehicle] = useState(null);
    const [activeJob, setActiveJob] = useState(null);
    const [error, setError] = useState('');

    // Forms
    const [regForm, setRegForm] = useState({ make: '', model: '', year: '', licensePlate: '', customerName: '', customerPhone: '', customerEmail: '', customerAddress: '' });
    const [jobDesc, setJobDesc] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setVehicle(null);
        setActiveJob(null);

        try {
            const res = await api.get(`vehicles/search?plate=${searchQuery}`);
            setVehicle(res.data);
            // Check for active job
            // We don't have a direct endpoint for "check status", but we can try creating a job and handle error,
            // OR add an endpoint. For now, let's assume if vehicle found, we go to details.
            // Ideally backend should return active job with vehicle or separate call.
            // Let's rely on Create Job validation for now.
            setMode('VIEW_JOB');
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setMode('REGISTER');
                // Pre-fill plate
                setRegForm(prev => ({ ...prev, licensePlate: searchQuery }));
            } else {
                setError("Search failed");
            }
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                make: regForm.make,
                model: regForm.model,
                year: regForm.year,
                licensePlate: regForm.licensePlate,
                customer: {
                    name: regForm.customerName,
                    email: regForm.customerEmail,
                    phone: regForm.customerPhone,
                    address: regForm.customerAddress
                }
            };

            const res = await api.post('vehicles', payload);
            setVehicle(res.data);
            setMode('VIEW_JOB');
        } catch (err) {
            setError("Registration failed: " + err.message);
        }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            await api.post('job-cards', {
                vehicleId: vehicle.id,
                description: jobDesc
            });
            alert("Job Created Successfully!");
            setJobDesc('');
            setMode('SEARCH');
            setSearchQuery('');
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create job. Check if active job exists.");
        }
    };

    return (
        <div className="container">
            <h2>Service Advisor - New Job Workflow</h2>

            {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '1rem', marginBottom: '1rem', borderRadius: 'var(--radius)' }}>{error}</div>}

            {mode === 'SEARCH' && (
                <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <h3>Find Vehicle</h3>
                    <form onSubmit={handleSearch}>
                        <label className="label">Vehicle Number (License Plate)</label>
                        <input
                            className="input"
                            placeholder="e.g. MH-12-AB-1234 OR CAM-01"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            required
                        />
                        <button className="btn" style={{ width: '100%' }}>Search</button>
                    </form>
                </div>
            )}

            {mode === 'REGISTER' && (
                <div className="card">
                    <button className="btn btn-secondary" onClick={() => setMode('SEARCH')} style={{ float: 'right' }}>Cancel</button>
                    <h3>Register New Vehicle</h3>
                    <p>Vehicle Number <strong>{searchQuery}</strong> not found. Enter details:</p>

                    <form onSubmit={handleRegister} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="label">Make</label>
                            <input className="input" required value={regForm.make} onChange={e => setRegForm({ ...regForm, make: e.target.value })} />
                        </div>
                        <div>
                            <label className="label">Model</label>
                            <input className="input" required value={regForm.model} onChange={e => setRegForm({ ...regForm, model: e.target.value })} />
                        </div>
                        <div>
                            <label className="label">Year</label>
                            <input className="input" required value={regForm.year} onChange={e => setRegForm({ ...regForm, year: e.target.value })} />
                        </div>
                        <div>
                            <label className="label">Plate (Verify)</label>
                            <input className="input" required value={regForm.licensePlate} onChange={e => setRegForm({ ...regForm, licensePlate: e.target.value })} />
                        </div>

                        <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                            <strong>Customer Details</strong>
                        </div>

                        <div>
                            <label className="label">Customer Name</label>
                            <input className="input" required value={regForm.customerName} onChange={e => setRegForm({ ...regForm, customerName: e.target.value })} />
                        </div>
                        <div>
                            <label className="label">Phone</label>
                            <input className="input" required value={regForm.customerPhone} onChange={e => setRegForm({ ...regForm, customerPhone: e.target.value })} />
                        </div>
                        <div>
                            <label className="label">Email</label>
                            <input className="input" type="email" value={regForm.customerEmail} onChange={e => setRegForm({ ...regForm, customerEmail: e.target.value })} />
                        </div>
                        <div>
                            <label className="label">Address</label>
                            <input className="input" value={regForm.customerAddress} onChange={e => setRegForm({ ...regForm, customerAddress: e.target.value })} />
                        </div>

                        <button className="btn" style={{ gridColumn: '1 / -1' }}>Register & Continue</button>
                    </form>
                </div>
            )}

            {mode === 'VIEW_JOB' && vehicle && (
                <div className="card">
                    <button className="btn btn-secondary" onClick={() => setMode('SEARCH')} style={{ float: 'right' }}>Back to Search</button>
                    <h3>Vehicle Found</h3>
                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', padding: '1rem', background: 'var(--bg-color)' }}>
                        <div>
                            <div style={{ color: 'var(--text-muted)' }}>Vehicle</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{vehicle.make} {vehicle.model} ({vehicle.year})</div>
                            <div>{vehicle.licensePlate}</div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)' }}>Customer</div>
                            <div style={{ fontSize: '1.2rem' }}>{vehicle.customer?.name}</div>
                            <div>{vehicle.customer?.phone}</div>
                        </div>
                    </div>

                    <h4>Create Service Job Card</h4>
                    <form onSubmit={handleCreateJob}>
                        <label className="label">Problem Description / Service Notes</label>
                        <textarea
                            className="input"
                            rows="4"
                            value={jobDesc}
                            onChange={e => setJobDesc(e.target.value)}
                            required
                        ></textarea>
                        <button className="btn">Open Job Card</button>
                    </form>
                </div>
            )}
        </div>
    );
}
