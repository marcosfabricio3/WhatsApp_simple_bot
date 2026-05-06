import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Smartphone, RefreshCw, LogOut, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const WhatsAppView = () => {
    const { token } = useAuth();
    const [status, setStatus] = useState({ status: 'loading', qr: null });
    const [loading, setLoading] = useState(false);

    const fetchStatus = async () => {
        if (!token) return;
        try {
            const res = await fetch('http://localhost:3001/api/connection/status', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const errData = await res.json();
                console.error("Error en API:", errData);
                setStatus({ status: 'error', message: errData.error });
                return;
            }
            const data = await res.json();
            setStatus(data);
        } catch (err) {
            console.error("Error al obtener status:", err);
            setStatus({ status: 'error', message: 'No se pudo conectar con el servidor' });
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (status.status === 'loading') {
                setStatus({ status: 'error', message: 'El servidor tardó demasiado en responder' });
            }
        }, 10000);

        fetchStatus();
        const interval = setInterval(() => {
            if (status.status === 'qr_ready' || status.status === 'connecting' || status.status === 'loading') {
                fetchStatus();
            }
        }, 5000);
        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [token, status.status]);

    const handleInit = async () => {
        setLoading(true);
        try {
            await fetch('http://localhost:3001/api/connection/init', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await fetchStatus();
        } catch (err) {
            alert("Error al iniciar conexión");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        if (!window.confirm("¿Estás seguro de que quieres desconectar WhatsApp?")) return;
        setLoading(true);
        try {
            await fetch('http://localhost:3001/api/connection/logout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await fetchStatus();
        } catch (err) {
            alert("Error al cerrar sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="view-container">
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '40px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <Smartphone size={64} color={status.status === 'connected' ? '#00b894' : '#636e72'} />
                </div>

                <h2>Conexión de WhatsApp</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                    Cada usuario debe conectar su propia cuenta para poder realizar envíos.
                </p>

                <div style={{ 
                    padding: '20px', 
                    borderRadius: '12px', 
                    background: 'rgba(255,255,255,0.05)', 
                    marginBottom: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                }}>
                    <strong>Estado actual:</strong> 
                    <span style={{ 
                        color: status?.status === 'connected' ? '#00b894' : '#ff7675',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}>
                        {status?.status === 'connected' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
                        {(status?.status || 'desconocido').replace('_', ' ')}
                    </span>
                </div>

                {status.status === 'qr_ready' && status.qr && (
                    <div style={{ marginBottom: '30px' }}>
                        <p style={{ marginBottom: '15px' }}>Escanea este código con tu WhatsApp:</p>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', display: 'inline-block' }}>
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(status.qr)}`} 
                                alt="QR Code" 
                                style={{ display: 'block' }}
                            />
                        </div>
                        <p style={{ fontSize: '0.8rem', marginTop: '10px', color: '#ff7675' }}>
                            El código se actualiza automáticamente.
                        </p>
                    </div>
                )}

                {status.status === 'connecting' && (
                    <div style={{ marginBottom: '30px' }}>
                        <Loader2 className="animate-spin" size={48} style={{ margin: '0 auto' }} />
                        <p>Iniciando motor de WhatsApp...</p>
                    </div>
                )}

                {status.status === 'error' && (
                    <div style={{ color: '#ff7675', marginBottom: '20px' }}>
                        <p>{status.message || 'Error desconocido'}</p>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    {(status.status === 'disconnected' || status.status === 'error') && (
                        <button className="btn-primary" onClick={handleInit} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" size={20}/> : <RefreshCw size={20}/>}
                            Vincular nuevo dispositivo
                        </button>
                    )}

                    {(status.status === 'connected' || status.status === 'qr_ready' || status.status === 'connecting' || status.status === 'error') && (
                        <button className="btn-secondary" onClick={handleLogout} disabled={loading} style={{ borderColor: '#ff7675', color: '#ff7675' }}>
                            <LogOut size={20}/>
                            {status.status === 'connected' ? 'Desconectar cuenta' : 'Reiniciar sesión'}
                        </button>
                    )}

                    {(status.status === 'qr_ready' || status.status === 'connecting') && (
                        <button className="btn-secondary" onClick={() => fetchStatus()} disabled={loading}>
                            <RefreshCw size={20}/>
                            Actualizar estado
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WhatsAppView;
