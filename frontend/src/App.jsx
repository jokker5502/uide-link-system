import { Routes, Route } from 'react-router-dom';
import ScanPage from './pages/ScanPage';
import AdminPage from './pages/AdminPage';
import { syncOfflineScans, getOfflineQueueSize } from './services/scanService';
import { useEffect, useState } from 'react';

function App() {
  const [pendingCount, setPendingCount] = useState(0);

  // Auto-sync logic
  useEffect(() => {
    const updateCount = () => setPendingCount(getOfflineQueueSize());
    updateCount();

    // Poll for queue size updates every 2s
    const sizeInterval = setInterval(updateCount, 2000);

    const attemptSync = async () => {
      updateCount();
      if (navigator.onLine) {
        try {
          const count = await syncOfflineScans();
          if (count > 0) console.log(`[AutoSync] Uploaded ${count} scans.`);
          updateCount(); // Update UI after sync
        } catch (e) {
          console.error("[AutoSync] Failed", e);
        }
      }
    };

    // ... same as before ...
    attemptSync();
    // 2. Listen for network recovery
    window.addEventListener('online', attemptSync);

    // 3. Listen for tab focus/visibility (e.g. user unlocks phone)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') attemptSync();
    });
    window.addEventListener('focus', attemptSync);

    // 4. Periodic check (every 30s) just in case
    const interval = setInterval(attemptSync, 30000);

    return () => {
      window.removeEventListener('online', attemptSync);
      document.removeEventListener('visibilitychange', attemptSync);
      window.removeEventListener('focus', attemptSync);
      clearInterval(interval);
      clearInterval(sizeInterval);
    };
  }, []);

  const handleSync = async () => {
    try {
      const count = await syncOfflineScans();
      setPendingCount(getOfflineQueueSize());
      if (count > 0) alert(`¡Se subieron ${count} viajes guardados!`);
      else alert(`No se subió nada. Pendientes en cola: ${getOfflineQueueSize()}. Internet: ${navigator.onLine ? 'SI' : 'NO'}`);
    } catch (e) {
      alert('Error al sincronizar: ' + e.message);
    }
  };

  return (
    <div className="app-container">
      <div style={{ marginBottom: '10px', textAlign: 'right' }}>
        <button onClick={handleSync} style={{ fontSize: '0.8rem', backgroundColor: pendingCount > 0 ? '#ff9800' : '' }}>
          🔄 Sincronizar ({pendingCount})
        </button>
      </div>
      <Routes>
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/" element={<div>
          <h1>Transporte UIDE</h1>
          <p>Bienvenido al sistema.</p>
          <nav style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <a href="/admin">👮 Ver Códigos QR (Admin)</a>
            <a href="/scan?id=QR-TUMBACO-1000">🚌 Simular Viaje (Tumbaco)</a>
          </nav>
        </div>} />
      </Routes>
    </div>
  );
}

export default App;
