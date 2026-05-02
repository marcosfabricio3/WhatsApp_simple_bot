import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ContactsView from './views/ContactsView';
import TemplatesView from './views/TemplatesView';
import TriggersView from './views/TriggersView';
import BulkMessagesView from './views/BulkMessagesView';
import LoginView from './views/LoginView';
import { useAuth } from './context/AuthContext';
import { LogOut, Loader2 } from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const { isAuthenticated, loading, logout, user } = useAuth();

    if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 className="animate-spin" size={48} color="#00b894" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'contactos':
        return <ContactsView />;
      case 'plantillas':
        return <TemplatesView/>;
      case 'respuestas':
        return <TriggersView/>;
      case 'envios':
        return <BulkMessagesView />;
      case 'dashboard':
        return (
          <div className='card'>
            <h3>Bienvenido, {user?.email}</h3>
            <p>Estado del Sistema: <span style={{color: '#00b894'}}>Conectado a WhatsApp</span></p>
          </div>
        );
        default: return null;
     }
    };

  return (
    <div className="app-container">
      <Sidebar onViewChange={setActiveView} activeView={activeView} />
      
      <main className="main-content">
        <header className="content-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2 style={{textTransform: 'capitalize'}}>{activeView.replace('-', ' ')}</h2>
          
          <button onClick={logout} className="btn-logout">
            <LogOut size={18} /> Salir
          </button>
        </header>
        <section className="content-body">
          {renderView()}
        </section>
      </main>
    </div>
  );
}

export default App;
