import { Users, FileText, Send, Settings, LayoutDashboard } from "lucide-react";

const Sidebar = ({ onViewChange, activeView }) => {
    const menuItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { id: 'contactos', icon: <Users size={20} />, label: 'Contactos' },
        { id: 'plantillas', icon: <FileText size={20} />, label: 'Plantillas' },
        { id: 'automatizacion', icon: <Send size={20}  />, label: 'Automatizacion' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h1>WA-BOT</h1>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <div key={item.id} className={`sidebar-item ${activeView === item.id ? 'active' : ''}`} onClick={() =>onViewChange(item.id)}>
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;