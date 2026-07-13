"use client";

import { ShoppingCart, Boxes } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminDashboard } from "@/components/admin/dashboard";
import { ProductsManager } from "@/components/admin/products-manager";
import type { Order, Product } from "@/types";

export function AdminTabs({
  orders,
  products,
}: {
  orders: Order[];
  products: Product[];
}) {
  return (
    <Tabs defaultValue="orders">
      <TabsList className="mb-6">
        <TabsTrigger value="orders">
          <ShoppingCart className="mr-2 h-4 w-4" /> Orders
          <span className="ml-2 rounded-full bg-cream-200 px-1.5 text-xs">
            {orders.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="products">
          <Boxes className="mr-2 h-4 w-4" /> Products
          <span className="ml-2 rounded-full bg-cream-200 px-1.5 text-xs">
            {products.length}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="orders">
        <AdminDashboard orders={orders} />
      </TabsContent>
      <TabsContent value="products">
        <ProductsManager products={products} />
      </TabsContent>
    </Tabs>
  );
}
