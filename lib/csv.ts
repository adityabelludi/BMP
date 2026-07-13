import type { Order } from "@/types";
import { shortId } from "@/lib/utils";

function escapeCsv(value: string | number): string {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function ordersToCsv(orders: Order[]): string {
  const headers = [
    "Order ID",
    "Date",
    "Customer",
    "Phone",
    "Email",
    "Address",
    "City",
    "State",
    "Pincode",
    "Country",
    "Items",
    "Subtotal",
    "Delivery",
    "Total",
    "Status",
    "Notes",
  ];

  const rows = orders.map((o) => {
    const items = o.items
      .map(
        (i) =>
          `${i.name} (${i.size}, ${i.spice_level}) x${i.quantity} = ${i.line_total}`
      )
      .join(" | ");

    return [
      shortId(o.id),
      new Date(o.created_at).toLocaleString("en-IN"),
      o.customer_name,
      o.phone,
      o.email ?? "",
      o.address_line,
      o.city,
      o.state,
      o.pincode,
      o.country ?? "India",
      items,
      o.subtotal,
      o.delivery_charge,
      o.total_amount,
      o.status,
      o.notes ?? "",
    ]
      .map(escapeCsv)
      .join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
