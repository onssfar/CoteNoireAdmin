import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import type { Order } from "../types";
import StatusBadge from "./StatusBadge";

function money(v=0,currency="TND"){return new Intl.NumberFormat("fr-TN",{style:"currency",currency}).format(Number(v)||0);}
function clientName(o: Order){const c=o.customer||{}; return c.name || `${c.firstName||""} ${c.lastName||""}`.trim() || "Client non renseigné";}

export default function OrderTable({orders}:{orders:Order[]}) {
 if(!orders.length)return <div className="empty">Aucune commande trouvée.</div>;
 return <div className="table-wrap"><table className="orders-table"><thead><tr><th>Commande</th><th>Client</th><th>Date</th><th>Total</th><th>Statut</th><th/></tr></thead>
 <tbody>{orders.map(o=><tr key={o.id}>
  <td><strong>#{o.orderNumber||o.id}</strong></td>
  <td><div className="client-cell"><span className="client-avatar">{clientName(o).charAt(0).toUpperCase()}</span><strong>{clientName(o)}</strong></div></td>
  <td>{o.createdAt?new Date(o.createdAt).toLocaleDateString("fr-FR"):"—"}</td>
  <td><strong>{money(o.total,o.currency)}</strong></td>
  <td><StatusBadge status={o.status}/></td>
  <td><Link className="table-action" to={`/orders/${o.id}`} title="Voir le détail"><Eye size={17}/></Link></td>
 </tr>)}</tbody></table></div>;
}
