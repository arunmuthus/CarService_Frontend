import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function TechnicianDashboard() {
    const [tab, setTab] = useState('JOBS');

    // Jobs State
    const [jobCards, setJobCards] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);

    // Part Form State
    const [partSource, setPartSource] = useState('INVENTORY'); // 'INVENTORY' or 'MANUAL'
    const [partData, setPartData] = useState({ name: '', cost: '' });
    const [selectedInventoryId, setSelectedInventoryId] = useState('');

    // Inventory State
    const [inventory, setInventory] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', sku: '', quantity: 0, price: 0.0 });

    useEffect(() => {
        fetchJobCards();
        fetchInventory(); // Always fetch inventory for part selection
    }, []);

    useEffect(() => {
        if (tab === 'INVENTORY') fetchInventory();
    }, [tab]);

    const fetchJobCards = async () => {
        try {
            const res = await api.get('job-cards');
            const sorted = res.data.sort((a, b) => {
                if (a.status === 'COMPLETED') return 1;
                if (b.status === 'COMPLETED') return -1;
                return 0;
            });
            setJobCards(sorted);
        } catch (e) { console.error(e); }
    };

    const fetchInventory = async () => {
        try {
            const res = await api.get('inventory');
            setInventory(res.data);
        } catch (e) { console.error(e); }
    };

    const updateStatus = async (id, status) => {
        try {
            const res = await api.put(`job-cards/${id}/status`, status, {
                headers: { 'Content-Type': 'text/plain' }
            });
            fetchJobCards();
            if (selectedJob && selectedJob.id === id) {
                setSelectedJob({ ...selectedJob, status, ...res.data });
            }
        } catch (e) { console.error(e); }
    };

    const addPart = async (e) => {
        e.preventDefault();
        if (!selectedJob) return;

        const payload = {};
        if (partSource === 'INVENTORY') {
            const id = parseInt(selectedInventoryId);
            payload.inventoryItemId = isNaN(id) ? null : id;
        } else {
            payload.name = partData.name;
            payload.cost = partData.cost;
        }

        try {
            const res = await api.post(`job-cards/${selectedJob.id}/parts`, payload);
            if (res.status === 200) {
                setPartData({ name: '', cost: '' });
                setSelectedInventoryId('');
                fetchJobCards();
                fetchInventory(); // Update stock count
                setSelectedJob(res.data);
            }
        } catch (e) {
            console.error(e);
            alert("Error adding part: " + (e.response?.data?.message || e.message));
        }
    };

    const addInventoryItem = async (e) => {
        e.preventDefault();
        try {
            await api.post('inventory', newItem);
            setNewItem({ name: '', sku: '', quantity: 0, price: 0.0 });
            fetchInventory();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Technician Dashboard</h2>
                <div>
                    <button className={`btn ${tab === 'JOBS' ? '' : 'btn-secondary'}`} onClick={() => setTab('JOBS')}>My Jobs</button>
                    <button className={`btn ${tab === 'INVENTORY' ? '' : 'btn-secondary'}`} style={{ marginLeft: '0.5rem' }} onClick={() => setTab('INVENTORY')}>Inventory</button>
                </div>
            </div>

            {tab === 'JOBS' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
                    <div style={{ display: 'grid', gap: '1rem', alignContent: 'start' }}>
                        {jobCards.map(card => (
                            <div
                                key={card.id}
                                className="card"
                                style={{ cursor: 'pointer', borderColor: selectedJob?.id === card.id ? 'var(--primary)' : 'var(--border)' }}
                                onClick={() => setSelectedJob(card)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>{card.vehicle?.make} {card.vehicle?.model}</strong>
                                    <span className={`badge badge-${card.status.toLowerCase()}`}>
                                        {card.status}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    Plate: {card.vehicle?.licensePlate}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        {selectedJob ? (
                            <div className="card">
                                <h3 style={{ marginBottom: '1rem' }}>Job #{selectedJob.id}</h3>
                                <p><strong>Vehicle:</strong> {selectedJob.vehicle?.year} {selectedJob.vehicle?.make} {selectedJob.vehicle?.model}</p>
                                <p><strong>Plate:</strong> {selectedJob.vehicle?.licensePlate}</p>
                                <p style={{ marginTop: '0.5rem' }}><strong>Issue:</strong> {selectedJob.description}</p>

                                <div style={{ margin: '1.5rem 0', padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Labor Cost:</span> <strong>${selectedJob.laborCost}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '1.1em' }}>
                                        <span>Total Cost:</span> <strong style={{ color: 'var(--primary)' }}>${selectedJob.totalCost}</strong>
                                    </div>
                                </div>

                                <div style={{ margin: '1.5rem 0' }}>
                                    <label className="label">Update Status</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <button className="btn btn-secondary" onClick={() => updateStatus(selectedJob.id, 'IN_PROGRESS')}>In Progress</button>
                                        <button className="btn btn-secondary" onClick={() => updateStatus(selectedJob.id, 'COMPLETED')}>Completed</button>
                                        <button className="btn btn-secondary" onClick={() => updateStatus(selectedJob.id, 'DELIVERED')}>Delivered</button>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                                    <h4>Spare Parts Used</h4>
                                    <ul style={{ paddingLeft: '1.2rem', marginBottom: '1rem' }}>
                                        {selectedJob.spareParts && selectedJob.spareParts.map(p => (
                                            <li key={p.id}>{p.name} - ${p.cost}</li>
                                        ))}
                                    </ul>

                                    <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                                        <h5>Add Part</h5>
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <label style={{ marginRight: '1rem' }}><input type="radio" name="source" checked={partSource === 'INVENTORY'} onChange={() => setPartSource('INVENTORY')} /> From Inventory</label>
                                            <label><input type="radio" name="source" checked={partSource === 'MANUAL'} onChange={() => setPartSource('MANUAL')} /> Manual Entry</label>
                                        </div>

                                        <form onSubmit={addPart}>
                                            {partSource === 'INVENTORY' ? (
                                                <div style={{ marginBottom: '0.5rem' }}>
                                                    <select className="input" value={selectedInventoryId} onChange={e => setSelectedInventoryId(e.target.value)} required>
                                                        <option value="">Select Part...</option>
                                                        {inventory.map(item => (
                                                            <option key={item.id} value={item.id} disabled={item.quantity <= 0}>
                                                                {item.name} (${item.price}) - Stock: {item.quantity}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <input className="input" placeholder="Part Name" style={{ marginBottom: 0 }} required value={partData.name} onChange={e => setPartData({ ...partData, name: e.target.value })} />
                                                    <input className="input" type="number" placeholder="Cost" style={{ marginBottom: 0 }} required value={partData.cost} onChange={e => setPartData({ ...partData, cost: e.target.value })} />
                                                </div>
                                            )}
                                            <button type="submit" className="btn" style={{ marginTop: '0.5rem', width: '100%' }}>Add Part & Recalculate</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>
                                Select a job to view details
                            </div>
                        )}
                    </div>
                </div>
            )}

            {tab === 'INVENTORY' && (
                <div className="card">
                    <h3>Inventory Management</h3>

                    <form onSubmit={addInventoryItem} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end', marginBottom: '1rem' }}>
                        <div>
                            <label className="label">Name</label>
                            <input className="input" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} required />
                        </div>
                        <div>
                            <label className="label">SKU</label>
                            <input className="input" value={newItem.sku} onChange={e => setNewItem({ ...newItem, sku: e.target.value })} />
                        </div>
                        <div>
                            <label className="label">Qty</label>
                            <input className="input" type="number" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} required />
                        </div>
                        <div>
                            <label className="label">Price</label>
                            <input className="input" type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} required />
                        </div>
                        <button className="btn" style={{ marginBottom: '1rem' }}>Add Item</button>
                    </form>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '0.5rem' }}>Name</th>
                                <th style={{ padding: '0.5rem' }}>SKU</th>
                                <th style={{ padding: '0.5rem' }}>Price</th>
                                <th style={{ padding: '0.5rem' }}>Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.5rem' }}>{item.name}</td>
                                    <td style={{ padding: '0.5rem' }}>{item.sku}</td>
                                    <td style={{ padding: '0.5rem' }}>${item.price}</td>
                                    <td style={{ padding: '0.5rem' }}>{item.quantity}</td>
                                </tr>
                            ))}
                            {inventory.length === 0 && <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No items in inventory</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
