import { useState, useEffect } from 'react';
import { Send, Users, CheckSquare, Square, Calendar, Clock } from 'lucide-react';

const BulkMessagesView = () => {
  const [contacts, setContacts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedJids, setSelectedJids] = useState(new Set());
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [scheduleType, setScheduleType] = useState('once'); 
  const [scheduleDate, setScheduleDate] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [resC, resT] = await Promise.all([
        fetch('http://localhost:3001/api/contacts'),
        fetch('http://localhost:3001/api/templates')
      ]);
      setContacts(await resC.json());
      setTemplates(await resT.json());
    };
    loadData();
  }, []);

  const toggleContact = (jid) => {
    const next = new Set(selectedJids);
    next.has(jid) ? next.delete(jid) : next.add(jid);
    setSelectedJids(next);
  };

  const toggleAll = () => {
    if (selectedJids.size === contacts.length) {
      setSelectedJids(new Set());
    } else {
      setSelectedJids(new Set(contacts.map(c => c.jid)));
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignName || selectedJids.size === 0 || !selectedTemplateId) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    const template = templates.find(t => t.id === parseInt(selectedTemplateId));
    
    const finalDate = isScheduling ? scheduleDate : new Date().toISOString();

    const payload = {
      name: campaignName,
      messageContent: template.content,
      recipients: Array.from(selectedJids),
      scheduleType: scheduleType,
      scheduleValue: finalDate,
      userId: 1
    };

    try {
      const response = await fetch('http://localhost:3001/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(isScheduling ? "Campaña programada con éxito" : "Envío iniciado");
        setCampaignName('');
        setSelectedJids(new Set());
        setSelectedTemplateId('');
      }
    } catch (err) {
      console.error("Error al crear campaña:", err);
    }
  };

  return (
    <div className="view-container">
      <div style={{display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px'}}>
        
        {/* LADO IZQUIERDO: SELECCIÓN DE CONTACTOS */}
        <div className="card">
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
            <h3 style={{margin: 0}}>Paso 1: Seleccionar Contactos ({selectedJids.size})</h3>
            <button className="btn-secondary" onClick={toggleAll}>
              {selectedJids.size === contacts.length ? 'Desmarcar todos' : 'Marcar todos'}
            </button>
          </div>
          <div style={{maxHeight: '600px', overflowY: 'auto'}}>
            <table className="contacts-table">
              <thead>
                <tr>
                  <th style={{width: '40px'}}></th>
                  <th>Nombre</th>
                  <th>JID</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(contact => (
                  <tr key={contact.jid} onClick={() => toggleContact(contact.jid)} style={{cursor: 'pointer'}}>
                    <td>
                      {selectedJids.has(contact.jid) ? 
                        <CheckSquare size={18} color="var(--primary)" /> : 
                        <Square size={18} color="var(--text-secondary)" />
                      }
                    </td>
                    <td>{contact.name || 'Sin nombre'}</td>
                    <td style={{fontSize: '0.8rem', opacity: 0.7}}>{contact.jid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* LADO DERECHO: CONFIGURACIÓN DE CAMPAÑA */}
        <div className="card" style={{height: 'fit-content', position: 'sticky', top: '20px'}}>
          <h3>Paso 2: Configurar Envío</h3>
          
          <div className="form-group">
            <label>Nombre de la Campaña</label>
            <input 
              type="text" 
              placeholder="Ej: Promo Verano 2024"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Plantilla de Mensaje</label>
            <select 
              value={selectedTemplateId} 
              onChange={(e) => setSelectedTemplateId(e.target.value)}
            >
              <option value="">-- Selecciona un mensaje --</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div className="form-group" style={{marginTop: '20px'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>
              <input 
                type="checkbox" 
                checked={isScheduling} 
                onChange={(e) => setIsScheduling(e.target.checked)} 
              />
              Programar para después
            </label>
          </div>

          {isScheduling && (
            <div className="form-group" style={{background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px'}}>
              <label>Fecha y Hora de envío</label>
              <input 
                type="datetime-local" 
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                style={{marginBottom: '10px'}}
              />
              <label>Frecuencia</label>
              <select value={scheduleType} onChange={(e) => setScheduleType(e.target.value)}>
                <option value="once">Una sola vez</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
              </select>
            </div>
          )}

          <button 
            className="btn-primary" 
            style={{width: '100%', marginTop: '20px', height: '55px', fontSize: '1rem'}}
            onClick={handleCreateCampaign}
            disabled={selectedJids.size === 0 || !selectedTemplateId || !campaignName}
          >
            {isScheduling ? <Calendar size={20} /> : <Send size={20} />}
            {isScheduling ? 'Programar Campaña' : 'Iniciar Envío Ahora'}
          </button>

          <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '15px', textAlign: 'center'}}>
            * Los envíos se realizan con un intervalo de seguridad para proteger tu cuenta.
          </p>
        </div>

      </div>
    </div>
  );
};

export default BulkMessagesView;
