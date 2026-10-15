import {useEffect,useMemo,useState} from "react";
import {ArrowUpRight,CheckCircle2,Clock3,PackageCheck,ShoppingBag} from "lucide-react";
import {Link} from "react-router-dom";
import {getOrders} from "../lib/api";
import type {Order} from "../types";
import StatCard from "../components/StatCard";
import OrderTable from "../components/OrderTable";

export default function Dashboard(){
 const[orders,setOrders]=useState<Order[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{getOrders().then(setOrders).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 const s=useMemo(()=>({total:orders.length,pending:orders.filter(o=>String(o.status).toUpperCase()==="PENDING").length,shipped:orders.filter(o=>String(o.status).toUpperCase()==="SHIPPED").length,delivered:orders.filter(o=>String(o.status).toUpperCase()==="DELIVERED").length,revenue:orders.reduce((a,o)=>a+Number(o.total||0),0)}),[orders]);
 return <div className="page"><div className="stats-grid">
  <StatCard label="Commandes" value={String(s.total)} icon={ShoppingBag} note="Total reçu"/>
  <StatCard label="En attente" value={String(s.pending)} icon={Clock3} note="À traiter"/>
  <StatCard label="Expédiées" value={String(s.shipped)} icon={PackageCheck} note="En livraison"/>
  <StatCard label="Livrées" value={String(s.delivered)} icon={CheckCircle2} note="Terminées"/>
 </div>
 <section className="panel"><div className="panel-head"><div><h2>Commandes récentes</h2></div><Link className="text-link" to="/orders">Voir toutes <ArrowUpRight size={15}/></Link></div>
 {error?<div className="error-box"><strong>Impossible de charger les commandes</strong><span>{error}</span><small>Vérifiez que Spring Boot tourne sur le port 8086.</small></div>:loading?<div className="loading">Chargement des commandes…</div>:<OrderTable orders={orders.slice(0,8)}/>}
 </section>
</div>
 
}