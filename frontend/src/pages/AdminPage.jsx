import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import api from '../api/axios';
import { CLIENT_URL } from '../config';

// Fallback API URL – ensures the admin page never points to localhost if env var is missing
const API_URL = import.meta.env.VITE_API_URL || "https://54.196.132.183.nip.io";

const AdminPage = () => {
    const [qrs, setQrs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQRs();
    }, []);

    const fetchQRs = async () => {
        try {
            // Utilizamos la constante API_URL como base en caso de que la instancia de axios no tenga la URL correcta
            const response = await api.get('/qr-codes', { baseURL: API_URL });
            setQrs(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    if (loading) return <div className="card text-center">Cargando datos...</div>;

    return (
        <div className="animate-fade-in w-full" style={{ maxWidth: '800px' }}>
            <div className="text-center mb-4">
                <h2>Panel de Administración</h2>
                <p>Gestión de Códigos QR y Viajes</p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {qrs.map((qr) => {
                    const scanLink = `${CLIENT_URL}/scan?id=${qr.id}`;
                    return (
                        <div key={qr.id} className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>{qr.schedule?.route?.name || 'Ruta desconocida'}</h3>
                            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                                🕒 {qr.schedule?.departure_time} | 📅 {qr.schedule?.day_of_week}
                            </p>

                            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px' }}>
                                <QRCode value={scanLink} size={140} />
                            </div>

                            <div style={{ marginTop: '1rem', width: '100%' }}>
                                <a href={scanLink} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>
                                    Abrir Link
                                </a>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>ID: {qr.id}</div>
                        </div>
                    );
                })}

                {qrs.length === 0 && (
                    <div className="card text-center">
                        <p>No hay rutas cargadas. Ejecuta /seed en la API.</p>
                    </div>
                )}
            </div>

            <hr style={{ margin: '3rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />

            <h2 className="mb-4">📊 Últimos Viajes</h2>
            <ScanList />
        </div>
    );
};

const ScanList = () => {
    const [scans, setScans] = useState([]);

    useEffect(() => {
        const interval = setInterval(fetchScans, 5000);
        fetchScans();
        return () => clearInterval(interval);
    }, []);

    const fetchScans = async () => {
        try {
            const res = await api.get('/scans?limit=20');
            setScans(res.data);
        } catch (e) { console.error(e); }
    };

    return (
        <div className="card" style={{ overflowX: 'auto', padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <tr>
                        <th style={{ padding: '1rem' }}>Hora</th>
                        <th style={{ padding: '1rem' }}>Ruta</th>
                        <th style={{ padding: '1rem' }}>Usuario</th>
                        <th style={{ padding: '1rem' }}>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {scans.map((s, i) => (
                        <tr key={s.id} style={{
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'
                        }}>
                            <td style={{ padding: '1rem' }}>{new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td style={{ padding: '1rem' }}>{s.qr_code_id.split('-')[1] || s.qr_code_id}</td>
                            <td style={{ padding: '1rem' }} title={s.anonymous_user_id}>{s.anonymous_user_id.substring(0, 6)}...</td>
                            <td style={{ padding: '1rem' }}>
                                {s.is_valid ?
                                    <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>✅ OK</span> :
                                    <span style={{ color: 'var(--error-color)', fontWeight: 'bold' }}>❌ {s.validation_notes}</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {scans.length === 0 && <p style={{ padding: '2rem', textAlign: 'center' }}>Esperando datos...</p>}
        </div>
    );
};

export default AdminPage;
