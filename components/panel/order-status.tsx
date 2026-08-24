"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus as Status } from "@/lib/data";
const statuses: Status[] = ["Yeni Sipariş", "Hazırlanıyor", "Kargoda", "Teslim Edildi", "İptal Edildi"];
export function OrderStatus({ id, status }: { id: number; status: Status }) { const router = useRouter(); const [value, setValue] = useState(status); async function change(next: Status) { setValue(next); const response = await fetch("/api/panel/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: next }) }); if (!response.ok) setValue(status); else router.refresh(); } return <select value={value} onChange={(event) => change(event.target.value as Status)} className="mt-2 rounded-lg border border-line p-2 text-sm">{statuses.map((item) => <option key={item}>{item}</option>)}</select>; }
