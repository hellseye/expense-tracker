"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  Coins,
  Smartphone,
  Building,
  Sparkles,
  Receipt,
  Calendar,
  FileText,
  Check,
  Plus,
  Tags,
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
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ApiClient } from "@/lib/api/api-client";
import { createExpenseSchema, CreateExpenseInput } from "@/validations/expense.validation";
import { Category, Expense, PaymentMethod, ApiResponse } from "@/types";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

const PAYMENT_METHODS: { label: string; value: PaymentMethod; icon: any }[] = [
  { label: "UPI (GPay/PhonePe)", value: "UPI", icon: Smartphone },
  { label: "Credit Card", value: "CREDIT_CARD", icon: CreditCard },
  { label: "Debit Card", value: "DEBIT_CARD", icon: CreditCard },
  { label: "Cash", value: "CASH", icon: Coins },
  { label: "Bank Transfer", value: "BANK_TRANSFER", icon: Building },
  { label: "Other", value: "OTHER", icon: Sparkles },
];

const PRESET_COLORS = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#F43F5E", "#06B6D4"];

function getCategoryIcon(name?: string) {
  switch (name) {
    case "shopping": return ShoppingBag;
    case "food": return Utensils;
    case "transport": return Car;
    case "bills": return Zap;
    case "entertainment": return Film;
    case "health": return HeartPulse;
    case "education": return GraduationCap;
    case "tech": return Laptop;
    case "gift": return Gift;
    case "savings": return PiggyBank;
    case "work": return Briefcase;
    default: return Tags;
  }
}

export function QuickAddModal({ isOpen, onClose, expenseToEdit }: QuickAddModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const amountInputRef = React.useRef<HTMLInputElement | null>(null);

  // On-the-spot category state
  const [isAddingCategory, setIsAddingCategory] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState("");
  const [newCatColor, setNewCatColor] = React.useState(PRESET_COLORS[0]);

  // Fetch categories for select dropdown via ApiClient
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await ApiClient.get<ApiResponse<Category[]>>("/categories");
      return res.data || [];
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async () => {
      const res = await ApiClient.post<ApiResponse<Category>>("/categories", {
        name: newCatName,
        color: newCatColor,
        icon: "tag",
      });
      if (!res.success || !res.data) throw new Error(res.error || "Failed to create category");
      return res.data;
    },
    onSuccess: (newCat) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setValue("categoryId", newCat.id);
      toast({
        type: "success",
        title: "Category Created",
        description: `Added "${newCat.name}" category on the spot.`,
      });
      setIsAddingCategory(false);
      setNewCatName("");
    },
    onError: (err: any) => {
      toast({
        type: "error",
        title: "Category action failed",
        description: err.message,
      });
    },
  });

  const isEditing = Boolean(expenseToEdit);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      title: "",
      amount: 0,
      categoryId: "",
      expenseDate: new Date().toISOString().split("T")[0],
      notes: "",
      paymentMethod: "UPI",
    },
  });

  const selectedCategoryId = watch("categoryId");
  const selectedPaymentMethod = watch("paymentMethod");
  const currentAmount = watch("amount") || 0;

  // Auto-focus amount field on open
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (amountInputRef.current) {
          amountInputRef.current.focus();
          amountInputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen]);

  // Reset or pre-fill form when modal is opened or target expense changes
  React.useEffect(() => {
    if (!isOpen) return;

    if (expenseToEdit) {
      reset({
        title: expenseToEdit.title,
        amount: expenseToEdit.amount,
        categoryId: expenseToEdit.categoryId,
        expenseDate: expenseToEdit.expenseDate.split("T")[0],
        notes: expenseToEdit.notes || "",
        paymentMethod: expenseToEdit.paymentMethod,
      });
    } else {
      reset({
        title: "",
        amount: 0,
        categoryId: categories[0]?.id || "",
        expenseDate: new Date().toISOString().split("T")[0],
        notes: "",
        paymentMethod: "UPI",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, expenseToEdit, categories]);

  // Create / Update Mutation via ApiClient
  const saveMutation = useMutation({
    mutationFn: async (data: CreateExpenseInput) => {
      const endpoint = isEditing ? `/expenses/${expenseToEdit?.id}` : "/expenses";
      const res = isEditing
        ? await ApiClient.patch<ApiResponse<Expense>>(endpoint, data)
        : await ApiClient.post<ApiResponse<Expense>>(endpoint, data);

      if (!res.success) throw new Error(res.error || "Failed to save expense");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast({
        type: "success",
        title: isEditing ? "Expense updated" : "Expense recorded",
        description: isEditing ? "Transaction successfully updated." : "New expense added to your ledger.",
      });
      onClose();
    },
    onError: (err: any) => {
      toast({
        type: "error",
        title: "Error saving expense",
        description: err.message,
      });
    },
  });

  const onSubmit = (data: CreateExpenseInput) => {
    saveMutation.mutate(data);
  };

  // Preset handlers
  const handleAddPreset = (value: number) => {
    setValue("amount", Number(currentAmount) + value);
  };

  const handleClearAmount = () => {
    setValue("amount", 0);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Expense Details" : "Record New Expense"}
      description="Enter transaction details below to update your ledger."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Centered Premium Calculator-style Amount Display */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-surface-200/50 border border-white/5 space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Amount (₹)</label>
          <div className="relative w-full max-w-[200px] flex items-center justify-center">
            <span className="absolute left-0 text-3xl font-extrabold text-primary">₹</span>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount", { valueAsNumber: true })}
              ref={(e) => {
                register("amount").ref(e);
                amountInputRef.current = e;
              }}
              className="w-full pl-7 text-center text-4xl font-extrabold bg-transparent text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-0 border-0"
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-accent-rose font-medium">{errors.amount.message?.toString()}</p>
          )}

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 pt-1">
            {["+100", "+500", "+1000"].map((label) => {
              const val = parseInt(label.replace("+", ""));
              return (
                <button
                  type="button"
                  key={label}
                  onClick={() => handleAddPreset(val)}
                  className="px-3 py-1.5 rounded-lg border border-white/5 bg-surface-300 text-xs font-bold text-zinc-300 hover:bg-surface-400 hover:text-white transition-all"
                >
                  {label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={handleClearAmount}
              className="px-3 py-1.5 rounded-lg border border-accent-rose/20 bg-accent-rose/10 text-xs font-bold text-accent-rose hover:bg-accent-rose/20 transition-all"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1.5">
            <Receipt className="h-3.5 w-3.5 text-zinc-400" />
            <span>Title / Description</span>
          </label>
          <Input
            placeholder="e.g. Swiggy Lunch, Grocery Shopping"
            {...register("title")}
            error={errors.title?.message?.toString()}
          />
        </div>

        {/* Interactive Category Selector Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-zinc-400">Select Category</label>
            <button
              type="button"
              onClick={() => setIsAddingCategory(!isAddingCategory)}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 transition-all"
            >
              <Plus className="h-3 w-3" />
              <span>{isAddingCategory ? "Cancel" : "New Category"}</span>
            </button>
          </div>

          {/* Inline On-The-Spot Category Creator Form */}
          {isAddingCategory && (
            <div className="mb-3 p-3 rounded-xl bg-surface-200/80 border border-primary/20 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Category Name (e.g. Travel, Gym)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-border bg-surface-100 px-3 text-xs text-foreground placeholder:text-zinc-500 focus:border-primary focus:outline-none"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={!newCatName.trim()}
                  isLoading={createCategoryMutation.isPending}
                  onClick={() => createCategoryMutation.mutate()}
                  className="shrink-0 text-xs px-3"
                >
                  Save
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-400 font-semibold">Color:</span>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCatColor(c)}
                      className="h-5 w-5 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                      style={{ backgroundColor: c }}
                    >
                      {newCatColor === c && <Check className="h-3 w-3 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {categories.length === 0 ? (
            <p className="text-xs text-zinc-500">No categories loaded.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                const CatIcon = getCategoryIcon(cat.icon);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setValue("categoryId", cat.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-transparent text-white font-semibold shadow-glow-sm"
                        : "border-white/5 bg-surface-200/40 text-zinc-400 hover:text-zinc-200 hover:border-white/10"
                    }`}
                    style={{
                      backgroundColor: isSelected ? cat.color : undefined,
                    }}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 pr-1">
                      <CatIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-xs truncate">{cat.name}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-white shrink-0 stroke-[3px]" />}
                  </button>
                );
              })}
            </div>
          )}
          {errors.categoryId && (
            <p className="mt-1 text-xs text-accent-rose">{errors.categoryId.message?.toString()}</p>
          )}
        </div>

        {/* Interactive Payment Method Card Grid */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-2">Payment Method</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((pm) => {
              const Icon = pm.icon;
              const isSelected = selectedPaymentMethod === pm.value;
              return (
                <button
                  type="button"
                  key={pm.value}
                  onClick={() => setValue("paymentMethod", pm.value)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary shadow-glow-sm"
                      : "border-white/5 bg-surface-200/40 text-zinc-400 hover:text-zinc-200 hover:border-white/10"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 mb-1" />
                  <span className="text-[10px] font-bold tracking-tight">{pm.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date & Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              <span>Date</span>
            </label>
            <Input type="date" {...register("expenseDate")} error={errors.expenseDate?.message?.toString()} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-zinc-400" />
              <span>Notes (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Invoice details, shared splits"
              {...register("notes")}
              className="flex h-11 w-full rounded-xl border border-border bg-surface-200/80 px-3.5 text-sm text-foreground placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saveMutation.isPending} className="shadow-glow">
            {isEditing ? "Save Changes" : "Record Expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
