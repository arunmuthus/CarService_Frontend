import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CustomerDashboard() {
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            // Find active job for this vehicle
            // We need an endpoint for this. We can reuse /job-cards and filter, or add specific endpoint.
            // Or since we have `vehicleId` in user object, let's just fetch all and find ours.
            // SECURITY NOTE: In real app, backend should only return this customer's data.
            // For prototype, we'll fetch list and filter client side or correct backend.
            // Let's rely on filtered backend endpoint or assume get all returns all.
            // Better: GET /api/job-cards?vehicleId=...
            const res = await api.get('job-cards'); // Ideally constrained
            const myJob = res.data.find(j => j.vehicle.id === user.vehicleId && (j.status !== 'DELIVERED'));
            // Showing active or recently completed job.

            setJob(myJob || null);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Pending';
        return new Date(dateStr).toLocaleString();
    };

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            <div className="card">
                <h2>Vehicle Status: {user.plate}</h2>
                <p>Customer: <strong>{user.customerName}</strong></p>

                {!job ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No active service job found for this vehicle.
                        <br />It may have been delivered or not checked in yet.
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0', padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius)' }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Current Status</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{job.status}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Estimated Cost</div>
                                <div style={{ fontSize: '1.2rem' }}>${job.totalCost}</div>
                            </div>
                        </div>

                        <h3>Service Timeline</h3>
                        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                            <div className="timeline-item">
                                <strong>Vehicle In</strong>
                                <div>{formatDate(job.vehicleInTime)}</div>
                            </div>
                            <div className="timeline-item">
                                <strong>Work Started</strong>
                                <div>{formatDate(job.workStartTime)}</div>
                            </div>
                            <div className="timeline-item">
                                <strong>Work Completed</strong>
                                <div>{formatDate(job.workEndTime)}</div>
                            </div>
                            <div className="timeline-item">
                                <strong>Ready for Delivery</strong>
                                <div>{job.status === 'COMPLETED' ? 'Yes' : 'No'}</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <h4>Service Details</h4>
                            <p>{job.description}</p>
                            {job.spareParts.length > 0 && (
                                <ul>
                                    {job.spareParts.map(p => <li key={p.id}>{p.name} (${p.cost})</li>)}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
