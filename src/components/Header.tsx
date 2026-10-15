import { Bell, LogOut, Menu, Search } from "lucide-react";
export default function Header({onMenu,title,subtitle,onLogout}:{onMenu:()=>void;title:string;subtitle?:string;onLogout?:()=>void}) {
  return <header className="topbar">
    <button className="mobile-menu" onClick={onMenu}><Menu size={21}/></button>
    <div><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>
    <div className="topbar-actions">
      <button className="icon-button"><Search size={18}/></button>
      <button className="icon-button notification"><Bell size={18}/><span/></button>
      <button className="top-profile" onClick={onLogout} title="Déconnexion"><span className="top-avatar">A</span><span className="top-profile-name">Admin</span><LogOut size={14}/></button>
    </div>
  </header>;
}
