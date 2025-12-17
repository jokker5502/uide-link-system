import React from 'react';
import { Link } from 'react-router-dom';

const SCHEDULES = {
    ingreso: [
        { route: "Mitad del Mundo", time: "05:30", type: "Ingreso" },
        { route: "Carcelén", time: "05:45", type: "Ingreso" },
        { route: "Carapungo", time: "05:45", type: "Ingreso" },
        { route: "Valles Cumbayá", time: "06:00", type: "Ingreso" },
        { route: "Valles Tumbaco", time: "05:55", type: "Ingreso" },
    ],
    salida: [
        { route: "Mitad del Mundo", time: "13:30", type: "Salida" },
        { route: "Cumbayá", time: "13:30", type: "Salida" },
        { route: "Los Chillos", time: "16:20", type: "Salida" },
        { route: "Norte", time: "18:20", type: "Salida" },
    ]
};

const SchedulePage = () => {
    return (
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <Link to="/" style={{ textDecoration: 'none', fontSize: '1.5rem', marginRight: '1rem' }}>⬅️</Link>
                <h2 style={{ margin: 0 }}>Horarios de Rutas</h2>
            </div>

            <h3 style={{ color: '#4CAF50', borderBottom: '2px solid #4CAF50', paddingBottom: '0.5rem', marginTop: '0' }}>☀️ Ingresos (Llegada 07:00)</h3>
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                {SCHEDULES.ingreso.map((s, i) => (
                    <div key={i} className="card" style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '1rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{s.route}</div>
                            <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Hacia Campus UIDE</div>
                        </div>
                        <div style={{ background: '#2a2a2a', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', color: '#4CAF50' }}>
                            {s.time}
                        </div>
                    </div>
                ))}
            </div>

            <h3 style={{ color: '#FF9800', borderBottom: '2px solid #FF9800', paddingBottom: '0.5rem' }}>🌙 Salidas</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {SCHEDULES.salida.map((s, i) => (
                    <div key={i} className="card" style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '1rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{s.route}</div>
                            <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Desde Campus UIDE</div>
                        </div>
                        <div style={{ background: '#2a2a2a', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', color: '#FF9800' }}>
                            {s.time}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SchedulePage;
