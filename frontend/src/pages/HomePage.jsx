import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', width: '100%' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem 1rem', borderTop: '5px solid #D32F2F' }}>
                <h1 style={{ color: '#D32F2F', margin: 0, fontSize: '2.5rem', lineHeight: 1.2 }}>Transporte UIDE</h1>
                <h3 style={{ margin: '0.5rem 0 2rem', color: '#888', fontWeight: 'normal' }}>Sistema de Registro de Rutas</h3>

                <div style={{ textAlign: 'left', background: '#2a2a2a', padding: '1.5rem', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}>
                    <p style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}><strong>1.</strong> Busca el QR en el bus.</p>
                    <p style={{ margin: 0, fontSize: '1.1rem' }}><strong>2.</strong> Escanéalo con tu cámara.</p>
                </div>

                <div style={{ display: 'grid', gap: '1rem', width: '100%', marginTop: '2rem' }}>
                    <Link to="/scan" style={{ textDecoration: 'none' }}>
                        <button style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: '#D32F2F', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            📷 Registrar Viaje
                        </button>
                    </Link>

                    <Link to="/schedules" style={{ textDecoration: 'none' }}>
                        <button style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: '#333', color: 'white', border: '1px solid #555', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            📅 Ver Horarios
                        </button>
                    </Link>
                </div>
            </div>

            <Link to="/admin" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem', padding: '1rem' }}>
                ¿Eres conductor? Ingresar al Admin
            </Link>
        </div>
    );
};

export default HomePage;
