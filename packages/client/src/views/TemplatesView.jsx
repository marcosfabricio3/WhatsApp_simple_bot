import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Layout } from 'lucide-react';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const TemplatesView = () => {
  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', content: '' });

  const { token } = useAuth();

  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/templates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('No autorizado');
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      console.error("Error al cargar plantillas:", err);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/templates', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ name: '', content: '' });
        fetchTemplates();
      }
    } catch (err) {
      console.error("Error al guardar plantilla:", err);
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="search-bar">
          <Layout size={18} />
          <span style={{marginLeft: '10px', color: 'var(--text-secondary)'}}>
            Gestiona tus mensajes predefinidos
          </span>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Nueva Plantilla
        </button>
      </div>

      <div className="templates-grid" style={{
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px',
        marginTop: '20px'
      }}>
        {templates.map(template => (
          <div key={template.id} className="card" style={{position: 'relative'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
              <h4 style={{color: 'var(--primary)', fontFamily: 'var(--font-headings)'}}>
                {template.name}
              </h4>
              <button 
                className="btn-icon" 
                onClick={async () => {
                  if(confirm('¿Borrar esta plantilla?')) {
                    await fetch(`http://localhost:3001/api/templates/${template.id}`, { 
                      method: 'DELETE',
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    fetchTemplates();
                  }
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <p style={{
              fontSize: '0.9rem', 
              color: 'var(--text-secondary)',
              background: 'var(--surface-elevated)',
              padding: '10px',
              borderRadius: '6px',
              whiteSpace: 'pre-wrap'
            }}>
              {template.content}
            </p>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Crear Nueva Plantilla"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre de la Plantilla</label>
            <input 
              type="text" 
              required 
              placeholder="Ej: Bienvenida Clientes"
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div className="form-group" style={{marginTop: '15px'}}>
            <label>Contenido del Mensaje</label>
            <textarea 
              required 
              rows="5"
              placeholder="Escribe aquí tu mensaje..."
              value={formData.content} 
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '20px'}}>
            Guardar Plantilla
          </button>
        </form>
      </Modal>
    </div>
  );
};


export default TemplatesView;
