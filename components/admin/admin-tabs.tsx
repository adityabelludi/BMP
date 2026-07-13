"use client";

import { ShoppingCart, Boxes, Tag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminDashboard } from "@/components/admin/dashboard";
import { ProductsManager } from "@/components/admin/products-manager";
import { CategoriesManager } from "@/components/admin/categories-manager";
import type { Category, Order, Product } from "@/types";

export function AdminTabs({
  orders,
  products,
  categories,
}: {
  orders: Order[];
  products: Product[];
  categories: Category[];
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
        <TabsTrigger value="categories">
          <Tag className="mr-2 h-4 w-4" /> Categories
          <span className="ml-2 rounded-full bg-cream-200 px-1.5 text-xs">
            {categories.length}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="orders">
        <AdminDashboard orders={orders} />
      </TabsContent>
      <TabsContent value="products">
        <ProductsManager products={products} categories={categories} />
      </TabsContent>
      <TabsContent value="categories">
        <CategoriesManager categories={categories} />
      </TabsContent>
    </Tabs>
  );
}
