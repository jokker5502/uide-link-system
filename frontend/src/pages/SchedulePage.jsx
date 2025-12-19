import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const SCHEDULES = {
    ingreso: [
        { route: "Mitad del Mundo", time: "05:30", destination: "Campus UIDE" },
        { route: "Carcelén", time: "05:45", destination: "Campus UIDE" },
        { route: "Carapungo", time: "05:45", destination: "Campus UIDE" },
        { route: "Valles - Cumbayá", time: "06:00", destination: "Campus UIDE" },
        { route: "Valles - Tumbaco", time: "05:55", destination: "Campus UIDE" },
    ],
    salida: [
        { route: "Mitad del Mundo", time: "13:30", destination: "Varios destinos" },
        { route: "Cumbayá - Tumbaco", time: "13:30", destination: "Varios destinos" },
        { route: "Los Chillos", time: "16:20", destination: "Varios destinos" },
        { route: "Norte - Carcelén", time: "18:20", destination: "Varios destinos" },
    ]
};

const SchedulePage = () => {
    const [activeTab, setActiveTab] = useState('ingreso'); // ingreso | salida

    return (
        <div className="animate-fade-in w-full" style={{ paddingBottom: '2rem' }}>
            {/* Header */}
            <div className="flex-row" style={{ marginBottom: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="flex-row" style={{ gap: '0.75rem' }}>
                    <Link to="/" className="btn-ghost" style={{ padding: '0.5rem', fontSize: '1.5rem' }}>
                        ⬅
                    </Link>
                    <div>
                        <h2 style={{ margin: 0 }}>Horarios</h2>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Rutas UIDE
                        </p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                background: 'rgba(255,255,255,0.05)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-lg)'
            }}>
                <button
                    onClick={() => setActiveTab('ingreso')}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        background: activeTab === 'ingreso' ? 'var(--success)' : 'transparent',
                        color: activeTab === 'ingreso' ? 'white' : 'var(--text-secondary)',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span>☀️</span> Ingresos
                </button>

                <button
                    onClick={() => setActiveTab('salida')}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        background: activeTab === 'salida' ? 'var(--warning)' : 'transparent',
                        color: activeTab === 'salida' ? 'white' : 'var(--text-secondary)',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span>🌙</span> Salidas
                </button>
            </div>

            {/* Schedules Content */}
            <div className="flex-col">
                {/* INGRESOS */}
                {activeTab === 'ingreso' && (
                    <div className="animate-slide-down">
                        <div style={{
                            marginBottom: '1rem',
                            padding: '1rem',
                            background: 'var(--success-bg)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(76, 175, 80, 0.2)'
                        }}>
                            <h3 style={{
                                color: 'var(--success)',
                                fontSize: '1rem',
                                margin: '0 0 0.25rem 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span>ℹ️</span> Horarios de Ingreso
                            </h3>
                            <p style={{ fontSize: '0.85rem', margin: 0 }}>
                                Llegada estimada al Campus: <strong>07:00 AM</strong>
                            </p>
                        </div>

                        <div className="flex-col">
                            {SCHEDULES.ingreso.map((schedule, index) => (
                                <div
                                    key={index}
                                    className="card card-interactive"
                                    style={{
                                        padding: '1.25rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 0,
                                        borderLeft: '4px solid var(--success)'
                                    }}
                                >
                                    <div>
                                        <h3 style={{
                                            margin: '0 0 0.25rem 0',
                                            fontSize: '1.1rem',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {schedule.route}
                                        </h3>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '0.85rem',
                                            color: 'var(--text-secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.35rem'
                                        }}>
                                            <span>📍</span> {schedule.destination}
                                        </p>
                                    </div>

                                    <div className="badge badge-success" style={{
                                        fontSize: '1.2rem',
                                        fontWeight: 700,
                                        padding: '0.75rem 1rem'
                                    }}>
                                        {schedule.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SALIDAS */}
                {activeTab === 'salida' && (
                    <div className="animate-slide-down">
                        <div style={{
                            marginBottom: '1rem',
                            padding: '1rem',
                            background: 'var(--warning-bg)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(255, 152, 0, 0.2)'
                        }}>
                            <h3 style={{
                                color: 'var(--warning)',
                                fontSize: '1rem',
                                margin: '0 0 0.25rem 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span>ℹ️</span> Horarios de Salida
                            </h3>
                            <p style={{ fontSize: '0.85rem', margin: 0 }}>
                                Desde Campus UIDE. <strong>Selecciona tu parada al escanear</strong>
                            </p>
                        </div>

                        <div className="flex-col">
                            {SCHEDULES.salida.map((schedule, index) => (
                                <div
                                    key={index}
                                    className="card card-interactive"
                                    style={{
                                        padding: '1.25rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 0,
                                        borderLeft: '4px solid var(--warning)'
                                    }}
                                >
                                    <div>
                                        <h3 style={{
                                            margin: '0 0 0.25rem 0',
                                            fontSize: '1.1rem',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {schedule.route}
                                        </h3>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '0.85rem',
                                            color: 'var(--text-secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.35rem'
                                        }}>
                                            <span>🚏</span> {schedule.destination}
                                        </p>
                                    </div>

                                    <div className="badge badge-warning" style={{
                                        fontSize: '1.2rem',
                                        fontWeight: 700,
                                        padding: '0.75rem 1rem'
                                    }}>
                                        {schedule.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Scan CTA */}
            <div className="card" style={{
                marginTop: '2rem',
                background: 'linear-gradient(135deg, var(--uide-red) 0%, var(--uide-red-hover) 100%)',
                textAlign: 'center',
                padding: '1.5rem'
            }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>
                    ¿Listo para viajar?
                </h3>
                <p style={{ margin: '0 0 1rem 0', color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                    Escanea el QR del bus para registrar tu viaje
                </p>
                <Link to="/scan" className="btn btn-secondary" style={{
                    background: 'white',
                    color: 'var(--uide-red)',
                    fontWeight: 700
                }}>
                    📷 Escanear Ahora
                </Link>
            </div>
        </div>
    );
};

export default SchedulePage;
