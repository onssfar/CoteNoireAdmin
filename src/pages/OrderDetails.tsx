import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Download, FileText, Mail, MapPin, Phone, ShoppingBag, Truck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrder, updateOrderStatus } from "../lib/api";
import type { Order, OrderStatus } from "../types";
import StatusBadge from "../components/StatusBadge";
import logo from "../assets/cotenoireLogo.png";


const steps: { key: OrderStatus; label: string; desc: string }[] = [
  { key: "PENDING", label: "Non traitée", desc: "Nouvelle commande" },
  { key: "CONFIRMED", label: "Confirmée", desc: "Confirmée par le client" },
  { key: "PROCESSING", label: "Préparation", desc: "Commande préparée" },
  { key: "SHIPPED", label: "Expédiée", desc: "En cours de livraison" },
  { key: "DELIVERED", label: "Livrée", desc: "Commande reçue" }
];
const nextStatus: Record<string, OrderStatus | null> = {
  PENDING: "CONFIRMED",
   CONFIRMED: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
  DELIVERED: null,
  CANCELLED: null
};
const money = (v = 0) => new Intl.NumberFormat("fr-TN", { style: "currency", currency: "TND" }).format(Number(v) || 0);
const customerName = (c: any) =>
  (
    c?.name ||
    `${c?.firstName || ""} ${c?.lastName || ""}`.trim() ||
    "Client non renseigné"
  ).toLowerCase();
export default function OrderDetails() {
  const { id } = useParams(), nav = useNavigate();
  const [order, setOrder] = useState<Order | null>(null), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [error, setError] = useState("");
  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const orderId = Number(id);
    if (!Number.isFinite(orderId) || orderId <= 0) {
      setError("Identifiant de commande invalide.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    getOrder(orderId)
      .then(setOrder)
      .catch(e => setError(e instanceof Error ? e.message : "Commande introuvable."))
      .finally(() => setLoading(false));
  }, [id]);
  const idx = useMemo(() => steps.findIndex(s => s.key === String(order?.status).toUpperCase()), [order]);
  const change = async (status: OrderStatus) => {
    if (!order) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateOrderStatus(order.id, status);
      setOrder(prev => prev ? {
        ...prev,
        ...updated,
        customer: updated.customer ?? prev.customer,
        items: updated.items?.length ? updated.items : prev.items
      } : updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de modifier le statut.");
    } finally {
      setSaving(false);
    }
  };
  const printInvoice = () => window.print();
  if (loading) return <div className="loading">Chargement de la commande…</div>;
  if (error && !order) return <div className="error-box"><strong>Impossible de charger la commande</strong><span>{error}</span><button className="outline-button" onClick={() => nav("/orders")}>Retour aux commandes</button></div>;
  if (!order) return null;
  const c = order.customer || {}; const name = customerName(c); const items = order.items || [];
  return <div className="page order-detail-page">
    <div className="detail-actions no-print"><button className="back-button" onClick={() => nav("/orders")}><ArrowLeft size={17} /> Retour aux commandes</button><button className="dark-button" onClick={printInvoice}><Download size={16} /> Imprimer la facture</button></div>
    <div className="order-heading"><div><span className="eyebrow">COMMANDE</span><h2>#{order.orderNumber || order.id}</h2><p>{order.createdAt ? new Date(order.createdAt).toLocaleString("fr-FR") : ""}</p></div><StatusBadge status={order.status} /></div>
    {error && <div className="error-box no-print"><span>{error}</span></div>}

    <section className="panel delivery-panel no-print"><div className="panel-head"><div><h2>Processus de livraison</h2></div><Truck size={23} /></div><div className="steps">{steps.map((s, i) => { const done = idx >= 0 && i < idx; const current = i === idx; const future = idx >= 0 && i > idx; return <div key={s.key} className={`step ${done ? "done" : ""} ${current ? "current" : ""} ${future ? "future" : ""}`}><span>{done ? <CheckCircle2 size={18}/> : i + 1}</span><strong>{s.label}</strong><small>{s.desc}</small></div>; })}</div><div className="delivery-controls">{nextStatus[String(order.status).toUpperCase()] && <button className="status-next-button" disabled={saving} onClick={()=>change(nextStatus[String(order.status).toUpperCase()]!)}>{saving ? "Enregistrement…" : `Passer à l’étape suivante : ${steps.find(s=>s.key===nextStatus[String(order.status).toUpperCase()])?.label || "Suivante"}`}</button>}{order.status !== "DELIVERED" && order.status !== "CANCELLED" && <button className="status-cancel-button" disabled={saving} onClick={()=>change("CANCELLED")}>Annuler la commande</button>}</div><div className="delivery-hint"><strong>Processus irréversible.</strong> Une étape validée ne peut pas être annulée ni revenir à l'étape précédente. La livraison et l'annulation sont des états finaux.</div></section>

    <div className="invoice-sheet">
      <div className="invoice-header"><div>    <img
        src={logo}
        className="invoice-logo"
        alt="Côte Noire"
      />   </div><div className="invoice-meta"><span>FACTURE</span><strong>#{order.orderNumber || order.id}</strong><small>{order.createdAt ? new Date(order.createdAt).toLocaleDateString("fr-FR") : ""}</small></div></div>
      <div className="invoice-grid">
        <section className="client-sheet"><div className="sheet-title"><h3>{name}</h3></div><div className="client-detail-grid">
          <div><Phone size={16} /><span><small>Téléphone</small><strong>{c.phone || "Non renseigné"}</strong></span></div>
          <div><Mail size={16} /><span><small>Email</small><strong>{c.email || "Non renseigné"}</strong></span></div>
          <div><MapPin size={16} /><span><small>Adresse</small><strong>{c.address || "Non renseignée"}</strong></span></div>
          <div><MapPin size={16} /><span><small>Ville / Code postal</small><strong>{[c.city, c.postalCode].filter(Boolean).join(" — ") || "Non renseigné"}</strong></span></div>
        </div></section>
      </div>
      <section className="invoice-items"><div className="sheet-title"><h3>Détail de la commande</h3></div>{items.length ? items.map((it, i) => <div className="invoice-item" key={it.id || i}><div className="invoice-product-image">{it.image ? <img src={it.image} alt="" /> : <ShoppingBag size={22} />}</div><div className="invoice-item-main"><strong>{it.productName || it.name || `Produit #${it.productId || i + 1}`}</strong><span>Quantité : {it.quantity}</span></div><strong>{money(it.total ?? ((it.unitPrice ?? it.price ?? 0) * it.quantity))}</strong></div>) : <div className="invoice-empty">Les articles ne sont pas fournis par l’API de commande.</div>}</section>
      <div className="invoice-total"><p><span>Sous-total</span><strong>{money(order.subtotal ?? order.total)}</strong></p><p><span>Livraison</span><strong>{money(order.deliveryFee ?? 0)}</strong></p><p className="grand-total"><span>Total à payer</span><strong>{money(order.total)}</strong></p></div>
      <div className="invoice-footer"><div><FileText size={18} /><span>Merci pour votre confiance.</span></div></div>
    </div>
  </div>;
}
