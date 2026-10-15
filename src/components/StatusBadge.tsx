import type { OrderStatus } from "../types";
const labels:Record<string,string>={PENDING:"Non traitée",CONFIRMED:"Confirmée par le client",PREPARING:"En préparation",SHIPPED:"Expédiée",DELIVERED:"Livrée",CANCELLED:"Annulée"};
export default function StatusBadge({status}:{status:OrderStatus|string}) { const key=String(status).toUpperCase(); return <span className={`status status-${key.toLowerCase()}`}><span className="status-dot"/>{labels[key]||status}</span>; }
