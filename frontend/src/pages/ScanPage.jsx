import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../api/axios';

const STOPS = [
    "Campus UIDE", "Lumbisí", "Scala Shopping", "Paseo San Francisco",
    "Tumbaco Centro", "Puembo", "San Rafael", "Triángulo",
    "San Luis Shopping", "Recreo", "Villaflora", "El Ejido",
    "La Carolina", "Carcelén", "Cumbayá", "Los Chillos"
];

const ScanPage = () => {
    const [searchParams] = useSearchParams();
    const qrId = searchParams.get('id');

    const [status, setStatus] = useState('idle');
    // States: idle, requesting_gps, scanning, loading, success, error, offline, selecting_dropoff

    const [data, setData] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [dropoffLocation, setDropoffLocation] = useState('');
    const [scannedId, setScannedId] = useState(null);

    // Geolocation
    const [gpsStatus, setGpsStatus] = useState('pending'); // pending, granted, denied, unavailable
    const [coordinates, setCoordinates] = useState({ lat: 0, long: 0 });

    // ========================================
    // GPS Request Flow
    // ========================================
    useEffect(() => {
        if (qrId) {
            setScannedId(qrId);
            return;
        }

        // Request GPS permission before scanning
        requestGPSPermission();
    }, [qrId]);

    const requestGPSPermission = () => {
        setStatus('requesting_gps');

        if (!navigator.geolocation) {
            console.warn('Geolocation not available');
            setGpsStatus('unavailable');
            setStatus('scanning'); // Continue without GPS
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoordinates({
                    lat: position.coords.latitude,
                    long: position.coords.longitude
                });
                setGpsStatus('granted');
                setStatus('scanning');
            },
            (error) => {
                console.warn('GPS error:', error.message);
                setGpsStatus('denied');
                setStatus('scanning'); // Continue anyway with 0,0
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    // ========================================
    // QR Scanning Flow
    // ========================================
    useEffect(() => {
        if (scannedId) {
            if (scannedId.includes('SALIDA')) {
                setStatus('selecting_dropoff');
            } else {
                registerScan(scannedId);
            }
        }
    }, [scannedId]);

    useEffect(() => {
        if (status === 'scanning') {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );

            scanner.render(
                (decodedText) => {
                    let id = decodedText;
                    if (decodedText.includes('id=')) {
                        id = decodedText.split('id=')[1];
                    }
                    scanner.clear();
                    setScannedId(id);
                },
                (error) => {
                    // Silent errors for scanning
                }
            );

            return () => {
                scanner.clear().catch(e => console.error("Failed to clear scanner", e));
            };
        }
    }, [status]);

    // ========================================
    // Registration Logic
    // ========================================
    const registerScan = async (id, selectedDropoff = null) => {
        setStatus('loading');
        try {
            let userId = localStorage.getItem('uide_user_id');
            if (!userId) {
                userId = 'user_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('uide_user_id', userId);
            }

            const payload = {
                qr_code_id: id,
                anonymous_user_id: userId,
                lat: coordinates.lat || 0,
                long: coordinates.long || 0,
                client_timestamp: new Date().toISOString(),
                dropoff_location: selectedDropoff
            };

            const response = await api.post('/scan', payload);
            setData(response.data);
            setStatus('success');

        } catch (error) {
            console.error(error);
            if (!error.response) {
                setStatus('offline');
                const offlineQueue = JSON.parse(localStorage.getItem('offline_scans') || '[]');
                offlineQueue.push(payload);
                localStorage.setItem('offline_scans', JSON.stringify(offlineQueue));
            } else {
                setStatus('error');
                setErrorMsg(error.response.data?.detail || 'Error al registrar el viaje.');
            }
        }
    };

    const handleDropoffConfirm = () => {
        if (!dropoffLocation) {
            alert("Por favor selecciona una parada de destino.");
            return;
        }
        registerScan(scannedId, dropoffLocation);
    };

    // ========================================
    // UI STATES
    // ========================================

    // 1. REQUESTING GPS
    if (status === 'requesting_gps') {
        return (
            <div className="card animate-fade-in text-center" style={{ padding: '3rem 2rem' }}>
                <div className="icon-large animate-spin">📍</div>
                <h2 style={{ marginBottom: '0.5rem' }}>Solicitando Ubicación</h2>
                <p style={{ marginBottom: '1.5rem' }}>
                    Necesitamos tu ubicación para mejorar el servicio
                </p>
                <div className="gps-indicator loading">
                    <span>⏳</span> Esperando permiso GPS...
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                    Si no otorgas permiso, se registrará el viaje sin ubicación
                </p>
            </div>
        );
    }

    // 2. SCANNING
    if (status === 'scanning') {
        return (
            <div className="animate-fade-in w-full">
                <div className="flex-row" style={{ marginBottom: '1rem', justifyContent: 'space-between' }}>
                    <h2 style={{ margin: 0 }}>Escanear QR</h2>
                    <Link to="/" className="btn-ghost" style={{ padding: '0.5rem', fontSize: '1.2rem' }}>
                        ✕
                    </Link>
                </div>

                {/* GPS Status Indicator */}
                <div style={{ marginBottom: '1rem' }}>
                    {gpsStatus === 'granted' && (
                        <div className="gps-indicator">
                            <span>✓</span> GPS Activo
                        </div>
                    )}
                    {gpsStatus === 'denied' && (
                        <div className="gps-indicator error">
                            <span>⚠</span> GPS Desactivado
                        </div>
                    )}
                    {gpsStatus === 'unavailable' && (
                        <div className="gps-indicator error">
                            <span>⚠</span> GPS No Disponible
                        </div>
                    )}
                </div>

                {/* Scanner */}
                <div className="card scanner-container" style={{ padding: 0, overflow: 'hidden', marginBottom: '1rem' }}>
                    <div id="reader" style={{ width: '100%' }}></div>
                    <div className="scanner-overlay"></div>
                </div>

                <p className="text-center" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    📷 Apunta tu cámara al código QR del bus
                </p>

                <Link to="/" className="btn btn-secondary">
                    Cancelar
                </Link>
            </div>
        );
    }

    // 3. SELECTING DROPOFF (Modal Style)
    if (status === 'selecting_dropoff') {
        return (
            <div className="modal-backdrop animate-fade-in">
                <div className="modal-sheet animate-slide-up">
                    <div className="modal-handle"></div>

                    <div className="text-center" style={{ marginBottom: '1.5rem' }}>
                        <div className="icon-large" style={{ fontSize: '4rem' }}>📍</div>
                        <h2 style={{ marginBottom: '0.5rem' }}>¿Dónde te bajas?</h2>
                        <p style={{ fontSize: '0.95rem' }}>
                            Esta es una ruta de <strong style={{ color: 'var(--warning)' }}>SALIDA</strong>.
                            Selecciona tu parada de destino.
                        </p>
                    </div>

                    {/* GPS Info if available */}
                    {gpsStatus === 'granted' && (
                        <div className="gps-indicator" style={{ marginBottom: '1rem', justifyContent: 'center' }}>
                            <span>✓</span> Ubicación registrada
                        </div>
                    )}

                    <select
                        value={dropoffLocation}
                        onChange={(e) => setDropoffLocation(e.target.value)}
                        style={{
                            fontSize: '1rem',
                            padding: '1.25rem',
                            marginBottom: '1rem',
                            background: 'rgba(0,0,0,0.4)'
                        }}
                    >
                        <option value="">📍 Selecciona tu parada...</option>
                        {STOPS.map(stop => (
                            <option key={stop} value={stop}>{stop}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleDropoffConfirm}
                        className="btn btn-primary"
                        disabled={!dropoffLocation}
                    >
                        ✓ Confirmar Viaje
                    </button>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="btn btn-ghost mt-2"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        );
    }

    // 4. LOADING
    if (status === 'loading') {
        return (
            <div className="card animate-fade-in text-center" style={{ padding: '3rem 2rem' }}>
                <div className="spinner">⏳</div>
                <h3 style={{ marginTop: '1rem' }}>Registrando viaje...</h3>
                <p style={{ fontSize: '0.9rem' }}>Por favor espera</p>
            </div>
        );
    }

    // 5. SUCCESS
    if (status === 'success') {
        const parts = scannedId ? scannedId.split('-') : [];
        const routeName = parts.length > 1 ? parts[1] : 'Ruta UIDE';
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <div className="card animate-fade-in text-center" style={{
                borderTop: '4px solid var(--success)',
                padding: '2rem'
            }}>
                <div className="icon-xl">✅</div>
                <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>¡Viaje Registrado!</h2>
                <p>Tu asistencia ha sido guardada exitosamente.</p>

                <div className="info-display">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div className="info-label">RUTA</div>
                        <div className="info-value">{routeName}</div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div className="info-label">HORA</div>
                        <div className="info-value">{time}</div>
                    </div>

                    {dropoffLocation && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div className="info-label">DESTINO</div>
                            <div className="info-value" style={{ color: 'var(--warning)' }}>
                                📍 {dropoffLocation}
                            </div>
                        </div>
                    )}

                    {gpsStatus === 'granted' && (
                        <div className="badge badge-success" style={{ marginTop: '1rem' }}>
                            <span>📍</span> Ubicación registrada
                        </div>
                    )}
                </div>

                <Link to="/" className="btn btn-primary mt-4">
                    Volver al Inicio
                </Link>
            </div>
        );
    }

    // 6. OFFLINE
    if (status === 'offline') {
        return (
            <div className="card animate-fade-in text-center" style={{
                borderTop: '4px solid var(--warning)',
                padding: '2rem'
            }}>
                <div className="icon-large">⚠️</div>
                <h2 style={{ color: 'var(--warning)', marginBottom: '0.5rem' }}>Sin Conexión</h2>
                <p style={{ marginBottom: '1.5rem' }}>
                    Tu viaje fue guardado localmente y se subirá cuando recuperes internet.
                </p>
                <div className="badge badge-warning">
                    <span>📱</span> Guardado en modo offline
                </div>
                <Link to="/" className="btn btn-secondary mt-4">
                    Volver al Inicio
                </Link>
            </div>
        );
    }

    // 7. ERROR
    return (
        <div className="card animate-fade-in text-center" style={{
            borderTop: '4px solid var(--error)',
            padding: '2rem'
        }}>
            <div className="icon-large">❌</div>
            <h2 style={{ color: 'var(--error)', marginBottom: '0.5rem' }}>Error</h2>
            <p style={{ marginBottom: '1.5rem' }}>{errorMsg || 'Ocurrió un error al registrar el viaje'}</p>

            <button onClick={() => window.location.reload()} className="btn btn-primary">
                Intentar de Nuevo
            </button>
            <Link to="/" className="btn btn-ghost mt-2">
                Cancelar
            </Link>
        </div>
    );
};

export default ScanPage;
