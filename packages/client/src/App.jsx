import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ContactsView from './views/ContactsView';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'contactos':
        return <ContactsView />;
      case 'dashboard':
      default:
        return (
          <div className='card'>
            <h3>Estado del Sistema</h3>
            <p>Conectado a WhatsApp</p>
          </div>
        );
     }
    };

  return (
    <div className="app-container">
      {}
      <Sidebar onViewChange={setActiveView} activeView={activeView} />
      
      <main className="main-content">
        <header className="content-header">
          <h2>{activeView === 'contactos' ? 'Gestion de Contactos' : 'Dashboard'}</h2>
        </header>
        <section className="content-body">
          {renderView()}
        </section>
      </main>
    </div>
  );
}

export default App;
