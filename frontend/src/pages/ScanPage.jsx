import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
<<<<<<< HEAD
import { registerScan } from '../services/scanService';
import { MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';
=======
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../api/axios';

const STOPS = [
    "Campus UIDE", "Lumbisí", "Scala Shopping", "Paseo San Francisco",
    "Tumbaco Centro", "Puembo", "San Rafael", "Triángulo",
    "San Luis", "Recreo", "Villaflora", "Ejido", "Norte", "Carcelén"
];
>>>>>>> 5f1505b (feat: Estructura unificada y limpia del sistema UIDE-Link)

const ScanPage = () => {
    const [searchParams] = useSearchParams();
    const qrId = searchParams.get('id');

<<<<<<< HEAD
    const [status, setStatus] = useState('idle'); // idle, locating, submitting, success, error
    const [message, setMessage] = useState('');
    const [scanData, setScanData] = useState(null);
    const hasScanned = React.useRef(false);

    useEffect(() => {
        if (!qrId) {
            setStatus('error');
            setMessage('Código QR no válido (falta ID).');
            return;
        }

        if (hasScanned.current) return;
        hasScanned.current = true;

        handleScan();
    }, [qrId]);

    const handleScan = async () => {
        setStatus('locating');
        setMessage('Obteniendo ubicación...');

        if (!navigator.geolocation) {
            submitScan(null, null); // Proceed without location if not supported
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                submitScan(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.warn("Location denied or error:", error);
                setMessage('Ubicación no disponible. Registrando igual...');
                // Wait small delay to let user see message
                setTimeout(() => submitScan(null, null), 1000);
            },
            { timeout: 5000 }
        );
    };

    const submitScan = async (lat, long) => {
        setStatus('submitting');
        setMessage('Registrando su viaje...');
        setScanData(null); // Clear previous data to avoid confusion

        try {
            const data = await registerScan(qrId, lat, long);

            if (data.is_valid) {
                setStatus('success');
                setMessage('¡Viaje registrado correctamente!');
            } else {
                setStatus('error'); // Or warning
                setMessage(data.validation_notes || 'Escaneo no válido.');
            }
            setScanData(data);
        } catch (error) {
            console.error("Scan Error Details:", error);

            if (error.message === 'OFFLINE_SAVED' || error.message.includes('OFFLINE')) {
                setStatus('warning');
                setMessage('Sin conexión. Viaje guardado offline.');
                // Try to trigger a global event or just log
                console.log("Triggering offline UI update...");
                return;
            }

            setStatus('error');
            const detail = error.response?.data?.detail || error.message;
            setMessage(`Error: ${detail}`);
        }
    };

    return (
        <div className="card">
            <h2>Registro de Bus UIDE</h2>

            {status === 'locating' && (
                <>
                    <MapPin className="animate-bounce" size={48} />
                    <p>{message}</p>
                </>
            )}

            {status === 'submitting' && (
                <>
                    <Loader2 className="animate-spin" size={48} />
                    <p>{message}</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <CheckCircle color="#66bb6a" size={64} />
                    <h3>{message}</h3>
                    <p><small>ID: {scanData?.id}</small></p>
                </>
            )}

            {status === 'error' && (
                <>
                    <XCircle color="#ef5350" size={64} />
                    <h3>Ups!</h3>
                    <p className="error">{message}</p>
                    {/* Retry button? */}
                    <button onClick={handleScan}>Intentar de nuevo</button>
                </>
            )}
=======
    const [status, setStatus] = useState('idle'); // idle, scanning, loading, success, error, offline, selecting_dropoff
    const [data, setData] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [dropoffLocation, setDropoffLocation] = useState('');
    const [scannedId, setScannedId] = useState(null);
    const [location, setLocation] = useState({ lat: 0, long: 0 });

    const [geoError, setGeoError] = useState(null);

    useEffect(() => {
        if (!window.isSecureContext && window.location.hostname !== 'localhost') {
            setGeoError('Insecure Context (HTTP). Geolocation requires HTTPS.');
            return;
        }

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        long: position.coords.longitude
                    });
                    setGeoError(null);
                },
                (error) => {
                    console.warn("Geolocation denied or error:", error);
                    let msg = "Unknown Error";
                    switch (error.code) {
                        case error.PERMISSION_DENIED: msg = "Permiso denegado."; break;
                        case error.POSITION_UNAVAILABLE: msg = "Posición no disponible."; break;
                        case error.TIMEOUT: msg = "Tiempo de espera agotado."; break;
                    }
                    setGeoError(msg);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setGeoError('Geolocalización no soportada en este navegador.');
        }
    }, []);

    useEffect(() => {
        if (qrId) {
            setScannedId(qrId);
        } else {
            setStatus('scanning');
        }
    }, [qrId]);

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
                /* verbose= */ false
            );

            scanner.render(
                (decodedText) => {
                    // Handle decoded text
                    // Expected format: http://IP:PORT/scan?id=QR-ID... or just QR-ID...
                    let id = decodedText;
                    if (decodedText.includes('id=')) {
                        id = decodedText.split('id=')[1];
                    }
                    scanner.clear();
                    setScannedId(id);
                },
                (error) => {
                    // console.warn(error);
                }
            );

            return () => {
                scanner.clear().catch(e => console.error("Failed to clear scanner", e));
            };
        }
    }, [status]);

    const registerScan = async (id, selectedDropoff = null) => {
        setStatus('loading');
        try {
            // Simulate anonymous user ID
            let userId = localStorage.getItem('uide_user_id');
            if (!userId) {
                userId = 'user_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('uide_user_id', userId);
            }

            const payload = {
                qr_code_id: id,
                anonymous_user_id: userId,
                lat: location.lat,
                long: location.long,
                client_timestamp: new Date().toISOString(),
                dropoff_location: selectedDropoff
            };

            const response = await api.post('/scan', payload);
            setData(response.data);
            setStatus('success');

        } catch (error) {
            console.error(error);
            if (!error.response) {
                // Network error -> Offline
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
            alert("Por favor selecciona una parada.");
            return;
        }
        registerScan(scannedId, dropoffLocation);
    };

    const renderDebugInfo = () => (
        <div style={{ marginTop: '2rem', fontSize: '0.7rem', color: '#555', textAlign: 'left', borderTop: '1px solid #333', paddingTop: '1rem' }}>
            <p><strong>Debug Info (v2.1 - ALWAYS VISIBLE):</strong></p>
            <p>Status: {status}</p>
            <p>Secure: {window.isSecureContext ? 'Yes' : 'No'}</p>
            <p>Protocol: {window.location.protocol}</p>
            <p>Geo API: {"geolocation" in navigator ? 'Available' : 'Missing'}</p>
            <p>Geo Error: {geoError || 'None'}</p>
            <p>Lat/Long: {location.lat}/{location.long}</p>
        </div>
    );

    if (status === 'scanning') {
        return (
            <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                <h2>📷 Escanear QR</h2>
                <div id="reader" style={{ width: '100%' }}></div>
                <p style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '1rem' }}>
                    Si la cámara no abre, usa la app nativa de tu celular o verifica que estés usando HTTPS (o localhost).
                </p>
                {geoError && (
                    <div style={{ background: '#3E2723', color: '#FFCC80', padding: '0.5rem', borderRadius: '4px', marginTop: '1rem', fontSize: '0.8rem' }}>
                        ⚠️ {geoError}
                    </div>
                )}
                <button onClick={() => window.location.href = '/'} style={{ marginTop: '1rem', background: '#555' }}>Cancelar</button>
                {renderDebugInfo()}
            </div>
        );
    }

    if (status === 'selecting_dropoff') {
        return (
            <div className="card" style={{ maxWidth: '350px', width: '100%' }}>
                <h2>📍 ¿Dónde te bajas?</h2>
                <p>Esta es una ruta de salida. Por favor indica tu destino.</p>

                <select
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        margin: '1rem 0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        background: '#2a2a2a',
                        color: 'white',
                        border: '1px solid #555'
                    }}
                >
                    <option value="">Selecciona una parada...</option>
                    {STOPS.map(stop => (
                        <option key={stop} value={stop}>{stop}</option>
                    ))}
                </select>

                <button onClick={handleDropoffConfirm} style={{ width: '100%', background: '#D32F2F', color: 'white' }}>
                    Confirmar Viaje
                </button>
                {renderDebugInfo()}
            </div>
        );
    }

    if (status === 'loading') {
        return (
            <div className="card" style={{ padding: '3rem', width: '100%', maxWidth: '350px' }}>
                <div className="spinner" style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <p>Registrando viaje...</p>
                {renderDebugInfo()}
            </div>
        );
    }

    if (status === 'success') {
        // Parse route name from ID if possible (Format: QR-ROUTE-TIME)
        const parts = scannedId ? scannedId.split('-') : [];
        const routeName = parts.length > 1 ? parts[1] : 'Ruta UIDE';
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <div className="card" style={{ borderTop: '5px solid #4CAF50', maxWidth: '350px', width: '100%' }}>
                <div style={{ fontSize: '5rem', lineHeight: 1 }}>✅</div>
                <h2 style={{ color: '#4CAF50', margin: '1rem 0 0' }}>¡Viaje Registrado!</h2>
                <p style={{ color: '#aaa' }}>Tu asistencia ha sido guardada.</p>

                <div style={{ background: '#2a2a2a', padding: '1.5rem', borderRadius: '8px', width: '100%', marginTop: '1rem', textAlign: 'left', boxSizing: 'border-box' }}>
                    <div style={{ fontSize: '0.9rem', color: '#888' }}>RUTA</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{routeName}</div>

                    <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#888' }}>HORA</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{time}</div>

                    {data?.validation_notes && data.validation_notes.includes('Dropoff') && (
                        <>
                            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#888' }}>DESTINO</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FFCC80' }}>
                                {data.validation_notes.split('Dropoff: ')[1]}
                            </div>
                        </>
                    )}
                </div>

                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '1.5rem' }}>ID: {data?.id}</p>
                <button onClick={() => window.location.href = '/'} style={{ marginTop: '1.5rem', background: '#333' }}>Volver al Inicio</button>
                {renderDebugInfo()}
            </div>
        );
    }

    if (status === 'offline') {
        return (
            <div className="card" style={{ borderTop: '5px solid #FF9800', maxWidth: '350px', width: '100%' }}>
                <div style={{ fontSize: '5rem', lineHeight: 1 }}>⚠️</div>
                <h2 style={{ color: '#FF9800', margin: '1rem 0 0' }}>Sin Conexión</h2>
                <p>No tienes internet, pero no te preocupes.</p>
                <div style={{ background: '#3E2723', color: '#FFCC80', padding: '1rem', borderRadius: '8px', marginTop: '1rem', width: '100%', boxSizing: 'border-box' }}>
                    <strong>Guardado localmente</strong><br />
                    Se subirá cuando recuperes la conexión.
                </div>
                <button onClick={() => window.location.href = '/'} style={{ marginTop: '1.5rem', background: '#333' }}>Volver al Inicio</button>
                {renderDebugInfo()}
            </div>
        );
    }

    return (
        <div className="card" style={{ borderTop: '5px solid #F44336', maxWidth: '350px', width: '100%' }}>
            <div style={{ fontSize: '5rem', lineHeight: 1 }}>❌</div>
            <h2 style={{ color: '#F44336', margin: '1rem 0 0' }}>Error</h2>
            <p>{errorMsg}</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>Intentar de nuevo</button>
            <button onClick={() => window.location.href = '/'} style={{ marginTop: '0.5rem', background: '#333' }}>Volver al Inicio</button>
<<<<<<< HEAD
>>>>>>> 5f1505b (feat: Estructura unificada y limpia del sistema UIDE-Link)
=======
            {renderDebugInfo()}
>>>>>>> a00b5bc (feat: Configure RDS connection and offline checks)
        </div>
    );
};

export default ScanPage;
