import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, ArrowRight } from "lucide-react";
import logo from "../assets/cotenoireLogo.png";

const AUTH_KEY = "cote-noire-admin-auth";
const ADMIN_EMAIL = "mootez23sfar@gmail.com";
const ADMIN_PASSWORD = "admin123";

export default function Login({onSuccess}:{onSuccess:()=>void}){
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [show,setShow]=useState(false); const [remember,setRemember]=useState(true); const [error,setError]=useState("");
 const submit=(e:FormEvent)=>{
  e.preventDefault(); setError("");
  if(email.trim().toLowerCase()===ADMIN_EMAIL && password===ADMIN_PASSWORD){
    if(remember) {
      localStorage.setItem(AUTH_KEY,"1");
      sessionStorage.removeItem(AUTH_KEY);
    } else {
      sessionStorage.setItem(AUTH_KEY,"1");
      localStorage.removeItem(AUTH_KEY);
    }
    onSuccess();
    return;
  }
  setError("Adresse e-mail ou mot de passe incorrect.");
 };
 return <div className="login-page">
   <div className="login-card-wrap">
     <form className="login-card" onSubmit={submit}>
       <span className="eyebrow">ESPACE ADMINISTRATION</span>
       <h1>Bienvenue</h1>
       <p className="login-intro">Connectez-vous à votre espace administrateur Côte Noire.</p>
       <label className="login-field"><span>Adresse e-mail</span><div><Mail size={17}/><input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@cotenoire.tn" required/></div></label>
       <label className="login-field"><span>Mot de passe</span><div><LockKeyhole size={17}/><input type={show?"text":"password"} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/><button type="button" onClick={()=>setShow(v=>!v)} aria-label="Afficher le mot de passe">{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
       <div className="login-options"><label><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/> <span>Se souvenir de moi</span></label><span>Accès administrateur</span></div>
       {error&&<div className="login-error">{error}</div>}
       <button className="login-submit" type="submit">Se connecter <ArrowRight size={17}/></button>
       <div className="login-security"><span/> <small>Connexion sécurisée · Côte Noire Administration</small> <span/></div>
     </form>
   </div>
 </div>;
}
