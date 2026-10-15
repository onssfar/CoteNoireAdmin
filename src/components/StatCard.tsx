import type { LucideIcon } from "lucide-react";
export default function StatCard({label,value,icon:Icon,note}:{label:string;value:string;icon:LucideIcon;note?:string}) {
 return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={19}/></div></div><strong>{value}</strong>{note&&<small>{note}</small>}</div>;
}