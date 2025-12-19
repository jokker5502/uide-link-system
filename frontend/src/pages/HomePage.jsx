import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const HomePage = () => {
    return (
        <div className="container">
            {/* Header */}
            <header className="welcome-header">
                <h1 className="welcome-title">Hola, Estudiante UIDE</h1>
                <p className="welcome-subtitle">Sistema de Transporte Inteligente</p>
            </header>

            {/* Hero Icon */}
            <div className="icon-large" style={{ margin: '1rem 0' }}>🚌</div>

            {/* Main Title */}
            <h2 className="title" style={{ marginBottom: '0.5rem' }}>UIDE Link</h2>
            <p className="subtitle" style={{ marginBottom: '2rem' }}>
                Registra tu viaje y consulta horarios
            </p>

            {/* Action Buttons – vertical stack */}
            <div className="flex-col" style={{ width: '100%', maxWidth: '340px' }}>
                <Link to="/scan" className="btn btn-primary">
                    <span className="icon-medium" style={{ marginRight: '0.5rem' }}>📷</span>
                    Registrar Viaje
                </Link>
                <Link to="/schedules" className="btn btn-outline">
                    <span className="icon-medium" style={{ marginRight: '0.5rem' }}>📅</span>
                    Ver Horarios
                </Link>
            </div>

            {/* Admin link – discreet */}
            <div className="mt-4">
                <Link to="/admin" className="btn-ghost">
                    Acceso Administrativo
                </Link>
            </div>
        </div>
    );
};

export default HomePage;
