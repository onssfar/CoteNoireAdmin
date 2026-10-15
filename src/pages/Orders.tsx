import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, X } from "lucide-react";
import { getOrders } from "../lib/api";
import type { Order } from "../types";
import OrderTable from "../components/OrderTable";

const filters = [["ALL","Toutes"],["PENDING","Non traitées"],["CONFIRMED","Confirmées"],["PREPARING","Préparation"],["SHIPPED","Expédiées"],["DELIVERED","Livrées"],["CANCELLED","Annulées"]];

const customerText = (o: Order) => {
  const c = o.customer || {};
  return [c.name, c.firstName, c.lastName, c.email, c.phone, c.address, c.city, c.postalCode].filter(Boolean).join(" ").toLowerCase();
};

export default function Orders() {
  const [orders,setOrders] = useState<Order[]>([]);
  const [filter,setFilter] = useState("ALL");
  const [search,setSearch] = useState("");
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { setOrders(await getOrders()); }
    catch (e) { setError(e instanceof Error ? e.message : "Impossible de charger les commandes."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => orders.filter(o => {
    const q = search.toLowerCase().trim();
    const status = String(o.status).toUpperCase();
    return (filter === "ALL" || status === filter) && (!q || `${o.orderNumber} ${customerText(o)}`.includes(q));
  }), [orders,filter,search]);

  return <div className="page">
    <section className="panel">
      <div className="orders-toolbar">
        <div className="search-box search-box-large"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par nom ou prénom du client…"/><button className="clear-search" onClick={()=>setSearch("")} aria-label="Effacer" hidden={!search}><X size={15}/></button></div>
        <button className="outline-button" onClick={load}><RefreshCw size={15}/> Actualiser</button>
      </div>
      <div className="filters">{filters.map(([k,l])=><button key={k} className={`filter ${filter===k?"active":""}`} onClick={()=>setFilter(k)}>{l}{k==="ALL"&&<span>{orders.length}</span>}</button>)}</div>
      {error ? <div className="error-box"><strong>Impossible de charger les commandes</strong><span>{error}</span></div> : loading ? <div className="loading">Chargement des commandes…</div> : <OrderTable orders={filtered}/>} 
    </section>
  </div>;
}
