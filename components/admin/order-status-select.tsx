"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { OrderStatus } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUSES, STATUS_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { updateOrderStatus } from "@/app/actions/admin";

export function OrderStatusSelect({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(current);
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    const nextStatus = next as OrderStatus;
    const prev = status;
    setStatus(nextStatus); // optimistic
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, nextStatus);
      if (!res.ok) {
        setStatus(prev);
        toast.error(res.error || "Could not update status");
      } else {
        toast.success(`Marked as ${nextStatus}`);
      }
    });
  }

  return (
    <Select value={status} onValueChange={onChange} disabled={pending}>
      <SelectTrigger
        className={cn(
          "h-9 w-[140px] border text-xs font-semibold",
          STATUS_STYLES[status]
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
