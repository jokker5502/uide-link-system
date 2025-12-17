import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import axios from 'axios';

const AdminPage = () => {
    const [qrs, setQrs] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = `http://${window.location.hostname}:8000`;
    const CLIENT_URL = window.location.origin; // e.g., http://localhost:5173

    useEffect(() => {
        fetchQRs();
    }, []);

    const fetchQRs = async () => {
        try {
            const response = await axios.get(`${API_URL}/qr-codes`);
            setQrs(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    if (loading) return <div className="card">Cargando datos...</div>;

    return (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2>Panel de Administración - Códigos QR</h2>
            <p className="description">
                Estos son los códigos generados para las rutas.
                Los administradores pueden imprimir esta pantalla y pegar los códigos en los buses.
            </p>

            <div style={{ display: 'grid', gap: '2rem', width: '100%' }}>
                {qrs.map((qr) => {
                    // Construction of the URL represented by the QR
                    const scanLink = `${CLIENT_URL}/scan?id=${qr.id}`;

                    return (
                        <div key={qr.id} style={{
                            border: '1px solid #555',
                            padding: '1rem',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            backgroundColor: '#2a2a2a'
                        }}>
                            <h3 style={{ margin: '0 0 10px 0' }}>{qr.schedule?.route?.name || 'Ruta desconocida'}</h3>
                            <p style={{ color: '#aaa', margin: '0 0 15px 0' }}>
                                🕒 {qr.schedule?.departure_time} | 📅 {qr.schedule?.day_of_week}
                            </p>

                            <div style={{ background: 'white', padding: '16px', borderRadius: '8px' }}>
                                <QRCode value={scanLink} size={150} />
                            </div>

                            <p style={{ marginTop: '15px', wordBreak: 'break-all', fontSize: '0.8em', fontFamily: 'monospace' }}>
                                <a href={scanLink} target="_blank" rel="noreferrer" style={{ color: '#646cff' }}>
                                    {scanLink}
                                </a>
                            </p>

                            <div style={{ fontSize: '0.8em', color: '#666' }}>ID Interno: {qr.id}</div>
                        </div>
                    );
                })}

                {qrs.length === 0 && (
                    <p>No hay rutas cargadas. Ejecuta /seed en la API primero.</p>
                )}
            </div>

            <hr style={{ margin: '3rem 0', borderColor: '#444' }} />

            <h2>📊 Últimos Viajes Registrados</h2>
            <ScanList />
        </div>
    );
};

const ScanList = () => {
    const [scans, setScans] = useState([]);
    const API_URL = `http://${window.location.hostname}:8000`;

    useEffect(() => {
        const interval = setInterval(fetchScans, 5000); // Auto-refresh
        fetchScans();
        return () => clearInterval(interval);
    }, []);

    const fetchScans = async () => {
        try {
            const res = await axios.get(`${API_URL}/scans?limit=20`);
            setScans(res.data);
        } catch (e) { console.error(e); }
    };

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #555' }}>
                        <th style={{ padding: '10px' }}>ID</th>
                        <th style={{ padding: '10px' }}>Hora (UTC)</th>
                        <th style={{ padding: '10px' }}>QR</th>
                        <th style={{ padding: '10px' }}>Usuario (Anon)</th>
                        <th style={{ padding: '10px' }}>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {scans.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #333', backgroundColor: s.is_valid ? 'transparent' : 'rgba(255,0,0,0.1)' }}>
                            <td style={{ padding: '10px' }}>{s.id}</td>
                            <td style={{ padding: '10px' }}>{new Date(s.timestamp).toLocaleTimeString()}</td>
                            <td style={{ padding: '10px' }}>{s.qr_code_id}</td>
                            <td style={{ padding: '10px' }} title={s.anonymous_user_id}>{s.anonymous_user_id.substring(0, 8)}...</td>
                            <td style={{ padding: '10px' }}>
                                {s.is_valid ? <span style={{ color: '#66bb6a' }}>✅ OK</span> : <span style={{ color: '#ef5350' }}>❌ {s.validation_notes}</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {scans.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>Esperando datos...</p>}
        </div>
    );
};

export default AdminPage;
