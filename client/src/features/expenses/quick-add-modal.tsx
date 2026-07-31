"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

const PAYMENT_METHODS: { label: string; value: PaymentMethod }[] = [
  { label: "Credit Card", value: "CREDIT_CARD" },
  { label: "Debit Card", value: "DEBIT_CARD" },
  { label: "Cash", value: "CASH" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "UPI", value: "UPI" },
  { label: "Other", value: "OTHER" },
];

export function QuickAddModal({ isOpen, onClose, expenseToEdit }: QuickAddModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories for select dropdown via ApiClient
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await ApiClient.get<ApiResponse<Category[]>>("/categories");
      return res.data || [];
    },
  });

  const isEditing = Boolean(expenseToEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      title: "",
      amount: 0,
      categoryId: "",
      expenseDate: new Date().toISOString().split("T")[0],
      notes: "",
      paymentMethod: "CREDIT_CARD",
    },
  });

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
        amount: undefined as any,
        categoryId: categories[0]?.id || "",
        expenseDate: new Date().toISOString().split("T")[0],
        notes: "",
        paymentMethod: "CREDIT_CARD",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, expenseToEdit]);

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Expense" : "Record New Expense"}
      description="Enter transaction details below to update your ledger."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">Title</label>
          <Input
            placeholder="e.g. Swiggy Lunch, Grocery Shopping"
            {...register("title")}
            error={errors.title?.message?.toString()}
          />
        </div>

        {/* Amount & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Amount (₹)</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount", { valueAsNumber: true })}
              error={errors.amount?.message?.toString()}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Date</label>
            <Input type="date" {...register("expenseDate")} error={errors.expenseDate?.message?.toString()} />
          </div>
        </div>

        {/* Category & Payment Method Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Category</label>
            <select
              {...register("categoryId")}
              className="flex h-11 w-full rounded-xl border border-white/10 bg-surface-200/80 px-3.5 text-sm text-zinc-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="" disabled>Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-surface-100 text-zinc-100">
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-accent-rose">{errors.categoryId.message?.toString()}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Payment Method</label>
            <select
              {...register("paymentMethod")}
              className="flex h-11 w-full rounded-xl border border-white/10 bg-surface-200/80 px-3.5 text-sm text-zinc-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.value} value={pm.value} className="bg-surface-100 text-zinc-100">
                  {pm.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">Notes (Optional)</label>
          <textarea
            rows={2}
            placeholder="Add extra context or invoice details..."
            {...register("notes")}
            className="flex w-full rounded-xl border border-white/10 bg-surface-200/80 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saveMutation.isPending}>
            {isEditing ? "Save Changes" : "Record Expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
