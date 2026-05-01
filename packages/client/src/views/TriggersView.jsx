import { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, MessageSquare, Play, Pause } from 'lucide-react';
import Modal from '../components/Modal';

const TriggersView = () => {
  const [triggers, setTriggers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    keyword: '',
    matchMode: 'exact',
    responseMessage: ''
  });

  const fetchTriggers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/triggers');
      const data = await response.json();
      setTriggers(data);
    } catch (err) {
      console.error("Error al cargar triggers:", err);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await fetch(`http://localhost:3001/api/triggers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTriggers();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
    }
  };

  useEffect(() => { fetchTriggers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ keyword: '', matchMode: 'exact', responseMessage: '' });
        fetchTriggers();
      }
    } catch (err) {
      console.error("Error al guardar trigger:", err);
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="search-bar">
          <Zap size={18} className="text-primary" />
          <span style={{marginLeft: '10px', color: 'var(--text-secondary)'}}>
            Reglas de respuesta automática
          </span>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Nueva Regla
        </button>
      </div>

      <div className="triggers-list" style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px'}}>
        {triggers.map(trigger => (
          <div key={trigger.id} className="card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
              <div style={{
                background: 'var(--surface-elevated)', 
                padding: '10px 15px', 
                borderRadius: '8px',
                borderLeft: '4px solid var(--primary)'
              }}>
                <small style={{color: 'var(--text-secondary)', display: 'block', fontSize: '0.7rem'}}>CUANDO ESCRIBAN</small>
                <code style={{color: 'var(--primary)', fontWeight: 'bold'}}>{trigger.keyword}</code>
                <span style={{fontSize: '0.7rem', marginLeft: '10px', opacity: 0.6}}>({trigger.matchMode})</span>
              </div>
              
              <div style={{color: 'var(--text-secondary)'}}>➔</div>

              <div style={{display: 'flex', alignItems: 'flex-start', gap: '10px'}}>
                <MessageSquare size={16} style={{marginTop: '4px'}} />
                <div>
                  <small style={{color: 'var(--text-secondary)', display: 'block', fontSize: '0.7rem'}}>RESPONDER</small>
                  <p style={{margin: 0, fontSize: '0.9rem'}}>{trigger.responseMessage}</p>
                </div>
              </div>
            </div>

            <button 
              className="btn-icon" 
              onClick={async () => {
                if(confirm('¿Borrar esta regla?')) {
                  await fetch(`http://localhost:3001/api/triggers/${trigger.id}`, { method: 'DELETE' });
                  fetchTriggers();
                }
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Crear Regla de Respuesta"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Palabra Clave (Trigger)</label>
            <input 
              type="text" 
              required 
              placeholder="Ej: precio, hola, info..."
              value={formData.keyword} 
              onChange={(e) => setFormData({...formData, keyword: e.target.value})} 
            />
          </div>
          
          <div className="form-group" style={{marginTop: '15px'}}>
            <label>Modo de Coincidencia</label>
            <select 
              value={formData.matchMode}
              onChange={(e) => setFormData({...formData, matchMode: e.target.value})}
            >
              <option value="exact">Exacta (Debe ser igual)</option>
              <option value="contains">Contiene (Si la palabra está en el texto)</option>
            </select>
          </div>

          <div className="form-group" style={{marginTop: '15px'}}>
            <label>Mensaje de Respuesta</label>
            <textarea 
              required 
              rows="4"
              placeholder="¿Qué debe decir el bot?"
              value={formData.responseMessage} 
              onChange={(e) => setFormData({...formData, responseMessage: e.target.value})}
              style={{
                width: '100%', padding: '12px', borderRadius: '8px',
                background: 'var(--surface-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontFamily: 'inherit'
              }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '20px'}}>
            Activar Regla
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default TriggersView;
