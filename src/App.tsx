import {useEffect,useMemo,useState} from "react";
import {Routes,Route,useLocation,useNavigate} from "react-router-dom";
import {Sidebar} from "./components";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Statistics from "./pages/Statistics";
import Login from "./pages/Login";

const AUTH_KEY = "cote-noire-admin-auth";

function ProtectedLayout(){
 const [open,setOpen]=useState(false); const location=useLocation(); const nav=useNavigate();
 const header=useMemo(()=>{
  if(location.pathname==="/")return["Dashboard"];
  if(location.pathname==="/orders")return["Commandes"];
  if(location.pathname.startsWith("/orders/"))return["Détail de la commande"];
  if(location.pathname==="/products")return["Produits","Gérez votre catalogue et vos stocks"];
  if(location.pathname==="/customers")return["Clients"];
  if(location.pathname==="/statistics")return["Statistiques"];
  return["Administration","Côte Noire"];
 },[location.pathname]);
 useEffect(()=>{setOpen(false)},[location.pathname]);
 const logout=()=>{localStorage.removeItem(AUTH_KEY);sessionStorage.removeItem(AUTH_KEY);nav("/login",{replace:true});};
 return <div className="app-shell"><Sidebar open={open} onClose={()=>setOpen(false)} onLogout={logout}/><div className="main-area"><Header title={header[0]} subtitle={header[1]} onMenu={()=>setOpen(true)} onLogout={logout}/><main className="content"><Routes>
  <Route path="/" element={<Dashboard/>}/><Route path="/orders" element={<Orders/>}/><Route path="/orders/:id" element={<OrderDetails/>}/>
  <Route path="/products" element={<Products/>}/><Route path="/customers" element={<Customers/>}/><Route path="/statistics" element={<Statistics/>}/>
 </Routes></main></div></div>;
}

export default function App(){
 const [authenticated,setAuthenticated]=useState(()=>localStorage.getItem(AUTH_KEY)==="1" || sessionStorage.getItem(AUTH_KEY)==="1");
 const location=useLocation();
 const nav=useNavigate();
 useEffect(()=>{
  const sync=()=>setAuthenticated(localStorage.getItem(AUTH_KEY)==="1");
  window.addEventListener("storage",sync);
  return()=>window.removeEventListener("storage",sync);
 },[]);
 const handleLoginSuccess=()=>{
  setAuthenticated(true);
  nav("/",{replace:true});
 };
 if(location.pathname==="/login") return <Login onSuccess={handleLoginSuccess}/>;
 if(!authenticated) return <Login onSuccess={handleLoginSuccess}/>;
 return <ProtectedLayout/>;
}
