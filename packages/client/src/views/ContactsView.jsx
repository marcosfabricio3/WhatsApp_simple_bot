import { useState, useEffect } from 'react';
import { UserPlus, Search, Trash2, Upload, RefreshCw } from 'lucide-react';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';


const ContactsView = () => {
    const [contacts, setContacts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const [formData, setFormData] = useState({ name: '', jid: '' });

    const { token } = useAuth();

    const fetchContacts = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/contacts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('No autorizado');
        const data = await res.json();
        setContacts(data);
      } catch (err) {
        console.error("Error cargando contactos:", err);
      }
  };

 
  useEffect(() => { fetchContacts(); }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/contacts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ name: '', jid: '' });
        fetchContacts();
      }
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://localhost:3001/api/contacts/bulk', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (response.ok) {
        alert("¡Contactos importados con éxito!");
        fetchContacts();
      } else {
        alert("Error al importar el archivo.");
      }
    } catch (err) {
      console.error("Error en la importación:", err);
    }
  };

  const handleWhatsAppImport = async () => {
    if (!confirm("¿Deseas importar todos los contactos desde tu WhatsApp conectado?")) return;
    
    setIsImporting(true);
    try {
      const response = await fetch('http://localhost:3001/api/contacts/import-whatsapp', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (response.ok) {
        alert(`¡Éxito! Se importaron ${data.summary.imported} contactos.`);
        fetchContacts();
      } else {
        alert(data.error || "Error al importar desde WhatsApp.");
      }
    } catch (err) {
      console.error("Error en la importación de WhatsApp:", err);
      alert("Error de conexión con el servidor.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder="Buscar contacto..." />
        </div>
        <div className='view-actions'>
          <button 
            className="btn-secondary" 
            onClick={handleWhatsAppImport}
            disabled={isImporting}
          >
            <RefreshCw size={18} className={isImporting ? 'animate-spin' : ''} />
            {isImporting ? 'Importando...' : 'Desde WhatsApp'}
          </button>
          <label className="btn-secondary">
            <Upload size={18} />
            CSV
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleImport} 
              style={{ display: 'none' }} 
            />
          </label>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <UserPlus size={18} />
            Nuevo
          </button>
        </div>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map(contact => (
            <tr key={contact.id}>
              <td>{contact.name}</td>
              <td>{contact.jid}</td>
              <td>
                <button className="btn-icon"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal 
        isOpen={isModalOpen}
        onClose={()=>setIsModalOpen(false)}
        title="Añadir contacto"
      >
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label>Nombre Completo</label>
            <input type="text" required value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className='form-group'>
            <label>Numero de Telefono (Con codigo del pais)</label>
            <input type="text" required value={formData.jid} onChange={(e)=> setFormData({...formData, jid: e.target.value})}
            />
          </div>
          <button type='submit' className='btn-primary' style={{width:'100%', marginTop: '20px'}}>Guardar</button>
        </form>
      </Modal> 
    </div>
  );
};

export default ContactsView;