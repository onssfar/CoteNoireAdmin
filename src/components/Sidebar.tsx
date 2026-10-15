import { NavLink } from "react-router-dom";
import { BarChart3, ClipboardList, LayoutDashboard, LogOut, Package, Users } from "lucide-react";
import logo from "../assets/cotenoireLogo.png";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/orders", label: "Commandes", icon: ClipboardList },
  { to: "/products", label: "Produits", icon: Package },
  { to: "/customers", label: "Clients", icon: Users },
  { to: "/statistics", label: "Statistiques", icon: BarChart3 }
];

export default function Sidebar({ open, onClose, onLogout }: { open: boolean; onClose: () => void; onLogout?: () => void }) {
  return <>
    {open && <div className="sidebar-overlay" onClick={onClose} />}
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand">
        <img src={logo} className="sidebar-logo" alt="Côte Noire" />
      </div>
      <nav>{links.map(({ to, label, icon: Icon }) =>
        <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={onClose}>
          <Icon size={18} /><span>{label}</span>
        </NavLink>
      )}</nav>
      <div className="sidebar-footer">
        <button className="logout-button" onClick={onLogout}><LogOut size={16}/> Déconnexion</button>
      </div>
    </aside>
  </>;
}
