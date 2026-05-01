import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ContactsView from './views/ContactsView';
import TemplatesView from './views/TemplatesView';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'contactos':
        return <ContactsView />;
      case 'plantillas':
        return <TemplatesView/>;
      case 'automatizacion':
        return <div className='card'>
          <h3>Automatizacion</h3>
          <p>Proximamente...</p>
        </div>;
      case 'dashboard':
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
          <h2 style={{textTransform: 'capitalize'}}>{activeView.replace('-', ' ')}</h2>
        </header>
        <section className="content-body">
          {renderView()}
        </section>
      </main>
    </div>
  );
}

export default App;
