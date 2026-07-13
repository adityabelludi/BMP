"use client";

import { Fragment, useMemo, useState } from "react";
import {
  Search,
  Download,
  Package,
  IndianRupee,
  Clock,
  TrendingUp,
} from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { OrderRowDetails } from "@/components/admin/order-row-details";
import { ORDER_STATUSES, STATUS_STYLES } from "@/lib/constants";
import { cn, formatINR, formatDate, shortId } from "@/lib/utils";
import { ordersToCsv, downloadCsv } from "@/lib/csv";

export function AdminDashboard({ orders }: { orders: Order[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        o.customer_name.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.pincode.includes(q) ||
        shortId(o.id).toLowerCase().includes(q);
      const matchesStatus = status === "all" || o.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [orders, query, status]);

  const stats = useMemo(() => {
    const revenue = orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((s, o) => s + o.total_amount, 0);
    const pending = orders.filter((o) => o.status === "Pending").length;
    return {
      total: orders.length,
      revenue,
      pending,
      delivered: orders.filter((o) => o.status === "Delivered").length,
    };
  }, [orders]);

  function handleExport() {
    const csv = ordersToCsv(filtered);
    downloadCsv(
      `bmp-orders-${new Date().toISOString().slice(0, 10)}.csv`,
      csv
    );
  }

  const statCards = [
    { label: "Total Orders", value: stats.total, icon: Package },
    {
      label: "Revenue",
      value: formatINR(stats.revenue),
      icon: IndianRupee,
    },
    { label: "Pending", value: stats.pending, icon: Clock },
    { label: "Delivered", value: stats.delivered, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-2xl border border-cream-300 bg-white p-5 shadow-sm"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-saffron-50 text-saffron-600">
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-maroon-500">{s.label}</p>
              <p className="font-heading text-2xl font-bold text-maroon-800">
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border border-cream-300 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-maroon-400" />
          <Input
            placeholder="Search by name, phone, city, pincode or order #…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as OrderStatus | "all")}
        >
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-cream-100 hover:bg-cream-100">
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Location</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center text-maroon-500">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((o) => (
                <Fragment key={o.id}>
                  <TableRow>
                    <TableCell className="font-mono text-xs font-semibold text-maroon-700">
                      #{shortId(o.id)}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-maroon-800">
                        {o.customer_name}
                      </p>
                      <p className="text-xs text-maroon-500">{o.phone}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-maroon-600">
                      {o.city}, {o.state}
                      <br />
                      <span className="text-xs text-maroon-400">{o.pincode}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-maroon-600">
                      {formatDate(o.created_at)}
                    </TableCell>
                    <TableCell className="font-semibold text-maroon-800">
                      {formatINR(o.total_amount)}
                    </TableCell>
                    <TableCell>
                      <OrderStatusSelect
                        orderId={o.id}
                        current={o.status}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() =>
                          setExpanded(expanded === o.id ? null : o.id)
                        }
                        className="rounded-full px-3 py-1 text-xs font-medium text-saffron-700 hover:bg-saffron-50"
                      >
                        {expanded === o.id ? "Hide" : "View"}
                      </button>
                    </TableCell>
                  </TableRow>
                  {expanded === o.id && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={7} className="bg-cream-100/60 p-0">
                        <OrderRowDetails order={o} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-center text-xs text-maroon-400">
        Showing {filtered.length} of {orders.length} orders · Statuses:{" "}
        {ORDER_STATUSES.map((s) => (
          <span
            key={s}
            className={cn(
              "mx-0.5 inline-block rounded-full border px-2 py-0.5",
              STATUS_STYLES[s]
            )}
          >
            {s}
          </span>
        ))}
      </p>
    </div>
  );
}
