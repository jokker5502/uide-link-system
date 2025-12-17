import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { registerScan } from '../services/scanService';
import { MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const ScanPage = () => {
    const [searchParams] = useSearchParams();
    const qrId = searchParams.get('id');

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
        </div>
    );
};

export default ScanPage;
