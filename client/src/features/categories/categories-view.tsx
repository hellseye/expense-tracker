"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Tags,
  Trash2,
  Edit2,
  Check,
  ShoppingBag,
  Utensils,
  Car,
  Zap,
  Film,
  HeartPulse,
  GraduationCap,
  Laptop,
  Gift,
  PiggyBank,
  Briefcase,
} from "lucide-react";
import { getCategoryIcon } from "@/utils/category-icon";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { ApiClient } from "@/lib/api/api-client";
import { Category, ApiResponse } from "@/types";

const COLOR_PALETTE = [
  "#8B5CF6", // Purple
  "#A855F7", // Purple Accent
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#F43F5E", // Rose
  "#06B6D4", // Cyan
  "#EC4899", // Pink
];

const ICON_OPTIONS = [
  { name: "tag", icon: Tags },
  { name: "shopping", icon: ShoppingBag },
  { name: "food", icon: Utensils },
  { name: "transport", icon: Car },
  { name: "bills", icon: Zap },
  { name: "entertainment", icon: Film },
  { name: "health", icon: HeartPulse },
  { name: "education", icon: GraduationCap },
  { name: "tech", icon: Laptop },
  { name: "gift", icon: Gift },
  { name: "savings", icon: PiggyBank },
  { name: "work", icon: Briefcase },
];

export function CategoriesView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);

  // Form State
  const [name, setName] = React.useState("");
  const [selectedColor, setSelectedColor] = React.useState(COLOR_PALETTE[0]);
  const [selectedIcon, setSelectedIcon] = React.useState(ICON_OPTIONS[0].name);

  // Delete modal state
  const [catToDelete, setCatToDelete] = React.useState<string | null>(null);

  // Fetch Categories via ApiClient
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await ApiClient.get<ApiResponse<Category[]>>("/categories");
      return res.data || [];
    },
  });

  React.useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setSelectedColor(editingCategory.color);
      setSelectedIcon(editingCategory.icon || "tag");
    } else {
      setName("");
      setSelectedColor(COLOR_PALETTE[0]);
      setSelectedIcon(ICON_OPTIONS[0].name);
    }
  }, [editingCategory]);

  // Create / Edit Mutation via ApiClient
  const saveMutation = useMutation({
    mutationFn: async () => {
      const endpoint = editingCategory ? `/categories/${editingCategory.id}` : "/categories";
      const res = editingCategory
        ? await ApiClient.patch<ApiResponse<Category>>(endpoint, { name, color: selectedColor, icon: selectedIcon })
        : await ApiClient.post<ApiResponse<Category>>(endpoint, { name, color: selectedColor, icon: selectedIcon });

      if (!res.success) throw new Error(res.error || "Failed to save category");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        type: "success",
        title: editingCategory ? "Category updated" : "Category created",
        description: `Successfully saved ${name}`,
      });
      setIsModalOpen(false);
      setEditingCategory(null);
    },
    onError: (err: any) => {
      toast({
        type: "error",
        title: "Category action failed",
        description: err.message,
      });
    },
  });

  // Delete Mutation via ApiClient
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await ApiClient.delete<ApiResponse<null>>(`/categories/${id}`);
      if (!res.success) throw new Error("Failed to delete category");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        type: "success",
        title: "Category removed",
        description: "The category has been deleted.",
      });
      setCatToDelete(null);
    },
    onError: (err: any) => {
      toast({
        type: "error",
        title: "Deletion failed",
        description: err.message,
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Categories</h2>
          <p className="text-xs text-zinc-400">Organize and tag your spending into custom groups.</p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          <span>New Category</span>
        </Button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <Card className="p-8 text-center text-zinc-400">Loading categories...</Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const CatIcon = getCategoryIcon(cat.icon || cat.name);
            return (
              <Card key={cat.id} hoverable className="relative group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10"
                      style={{
                        backgroundColor: `${cat.color}18`,
                        borderColor: `${cat.color}30`,
                      }}
                    >
                      <CatIcon className="h-5 w-5" style={{ color: cat.color }} />
                    </div>

                  <div>
                    <h3 className="text-base font-bold text-zinc-100 group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {cat._count?.expenses || 0} associated transactions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCatToDelete(cat.id)}
                    className="p-1.5 text-zinc-400 hover:text-accent-rose rounded-lg hover:bg-accent-rose/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs border-t border-white/5 pt-3">
                <span className="text-zinc-500">Color Badge</span>
                <Badge color={cat.color}>{cat.color}</Badge>
              </div>
            </Card>
          );
        })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Rename Category" : "Create New Category"}
        description="Choose a title and vibrant color tag."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Category Name</label>
            <Input
              placeholder="e.g. Health & Fitness, Investments"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2">Category Color Tag</label>
            <div className="flex flex-wrap items-center gap-3">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className="relative flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: c }}
                >
                  {selectedColor === c && <Check className="h-4 w-4 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2">Category Icon</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[140px] overflow-y-auto pr-1">
              {ICON_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedIcon === opt.name;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setSelectedIcon(opt.name)}
                    className={`flex h-10 w-full items-center justify-center rounded-xl border transition-all ${
                      isSelected
                        ? "border-primary bg-primary/20 text-primary shadow-glow-sm scale-105"
                        : "border-white/5 bg-surface-200/50 text-zinc-400 hover:text-zinc-200 hover:border-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!name.trim()}
              isLoading={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {editingCategory ? "Save Category" : "Create Category"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={Boolean(catToDelete)}
        onClose={() => setCatToDelete(null)}
        title="Delete Category"
        description="Are you sure you want to delete this category?"
      >
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
          <Button variant="ghost" onClick={() => setCatToDelete(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={deleteMutation.isPending}
            onClick={() => catToDelete && deleteMutation.mutate(catToDelete)}
          >
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
