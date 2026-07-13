"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check, X, Loader2, Tag } from "lucide-react";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createCategory,
  renameCategory,
  deleteCategory,
} from "@/app/actions/categories";

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [pending, start] = useTransition();

  function add() {
    if (!newName.trim()) return;
    start(async () => {
      const res = await createCategory(newName);
      if (!res.ok) toast.error(res.error);
      else {
        toast.success("Category added");
        setNewName("");
        router.refresh();
      }
    });
  }

  function saveEdit(cat: Category) {
    start(async () => {
      const res = await renameCategory(cat.id, editName, cat.name);
      if (!res.ok) toast.error(res.error);
      else {
        toast.success("Category updated");
        setEditingId(null);
        router.refresh();
      }
    });
  }

  function remove(cat: Category) {
    start(async () => {
      const res = await deleteCategory(cat.id);
      if (!res.ok) toast.error(res.error);
      else {
        toast.success("Category deleted");
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold text-maroon-800">
          <Tag className="h-5 w-5 text-saffron-500" /> Add Category
        </h3>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Pickles"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <Button onClick={add} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-sm">
        {categories.length === 0 ? (
          <p className="p-8 text-center text-maroon-500">
            No categories yet. Add your first one above.
          </p>
        ) : (
          <ul className="divide-y divide-cream-200">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center gap-3 px-5 py-3">
                {editingId === cat.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-9 flex-1"
                      autoFocus
                    />
                    <Button size="sm" onClick={() => saveEdit(cat)} disabled={pending}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-maroon-800">
                      {cat.name}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditName(cat.name);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600 hover:bg-rose-50"
                      onClick={() => remove(cat)}
                      disabled={pending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-center text-xs text-maroon-400">
        Renaming a category updates it on all products that use it.
      </p>
    </div>
  );
}
