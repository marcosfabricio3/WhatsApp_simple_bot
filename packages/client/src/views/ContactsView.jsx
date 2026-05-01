import { useState, useEffect } from 'react';
import { UserPlus, Search, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

const ContactsView = () => {
    const [contacts, setContacts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({ name: '', jid: '' });

    const fetchContacts = () => {
    fetch('http://localhost:3001/api/contacts')
      .then(res => res.json())
      .then(data => setContacts(data));
  };

 
  useEffect(() => { fetchContacts(); }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ name: '', phone: '' });
        fetchContacts();
      }
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder="Buscar contacto..." />
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={18} />
          Nuevo Contacto
        </button>
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