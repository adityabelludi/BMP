import type { Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { MapPin, Phone, StickyNote, Mail } from "lucide-react";

export function OrderRowDetails({ order }: { order: Order }) {
  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[1.4fr_1fr]">
      {/* Items */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-maroon-600">
          Items
        </h4>
        <div className="space-y-2">
          {order.items.map((i, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-maroon-800">{i.name}</span>
                <Badge variant="outline">{i.size}</Badge>
                <Badge variant="gold">{i.spice_level}</Badge>
                <span className="text-maroon-500">× {i.quantity}</span>
              </div>
              <span className="font-semibold text-maroon-800">
                {formatINR(i.line_total)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1 border-t border-cream-200 pt-3 text-sm">
          <div className="flex justify-between text-maroon-600">
            <span>Subtotal</span>
            <span>{formatINR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-maroon-600">
            <span>Delivery</span>
            <span>{formatINR(order.delivery_charge)}</span>
          </div>
          <div className="flex justify-between font-bold text-maroon-900">
            <span>Total</span>
            <span>{formatINR(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Delivery info */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-maroon-600">
          Delivery
        </h4>
        <div className="space-y-3 rounded-lg bg-white p-4 text-sm shadow-sm">
          <p className="flex items-start gap-2 text-maroon-700">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-saffron-500" />
            <span>
              {order.address_line}, {order.city}, {order.state} —{" "}
              {order.pincode}
              <br />
              <span className="text-maroon-500">{order.country}</span>
            </span>
          </p>
          <p className="flex items-center gap-2 text-maroon-700">
            <Phone className="h-4 w-4 text-saffron-500" /> {order.phone}
          </p>
          {order.email && (
            <p className="flex items-center gap-2 text-maroon-700">
              <Mail className="h-4 w-4 text-saffron-500" /> {order.email}
            </p>
          )}
          {order.notes && (
            <p className="flex items-start gap-2 text-maroon-600">
              <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-saffron-500" />
              <span className="italic">“{order.notes}”</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
