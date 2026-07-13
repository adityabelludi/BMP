"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Truck, Save } from "lucide-react";
import type { DeliverySettings } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDeliverySettings } from "@/app/actions/settings";

export function SettingsManager({ settings }: { settings: DeliverySettings }) {
  const router = useRouter();
  const [within, setWithin] = useState(String(settings.delivery_within_india));
  const [outside, setOutside] = useState(
    String(settings.delivery_outside_india)
  );
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const res = await updateDeliverySettings(Number(within), Number(outside));
      if (!res.ok) toast.error(res.error);
      else {
        toast.success("Delivery charges updated");
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h3 className="flex items-center gap-2 font-heading text-lg font-semibold text-maroon-800">
          <Truck className="h-5 w-5 text-saffron-500" /> Delivery Charges
        </h3>
        <p className="mt-1 text-sm text-maroon-500">
          These are applied at checkout based on the customer&apos;s country.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="within">Within India (₹)</Label>
            <Input
              id="within"
              inputMode="numeric"
              value={within}
              onChange={(e) => setWithin(e.target.value.replace(/[^0-9]/g, ""))}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="outside">Outside India (₹)</Label>
            <Input
              id="outside"
              inputMode="numeric"
              value={outside}
              onChange={(e) => setOutside(e.target.value.replace(/[^0-9]/g, ""))}
              className="mt-1.5"
            />
          </div>
        </div>

        <Button onClick={save} disabled={pending} className="mt-6">
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Charges
        </Button>
      </div>
    </div>
  );
}
