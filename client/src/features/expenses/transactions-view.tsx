"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  ArrowUpDown,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Dropdown } from "@/components/ui/dropdown";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/shared/empty-state";
import { useDebounce } from "@/hooks/use-debounce";
import { ApiClient } from "@/lib/api/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Category, Expense, ApiResponse } from "@/types";

interface TransactionsViewProps {
  onOpenQuickAdd: () => void;
  onEditExpense: (expense: Expense) => void;
}

export function TransactionsView({ onOpenQuickAdd, onEditExpense }: TransactionsViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");
  const [selectedPayment, setSelectedPayment] = React.useState("ALL");
  const [sortBy, setSortBy] = React.useState<"date" | "amount" | "title">("date");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);

  // Confirmation modal state
  const [expenseToDelete, setExpenseToDelete] = React.useState<string | null>(null);

  // Fetch Categories via ApiClient
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await ApiClient.get<ApiResponse<Category[]>>("/categories");
      return res.data || [];
    },
  });

  // Fetch Expenses with filters via ApiClient
  const { data, isLoading } = useQuery<ApiResponse<Expense[]>>({
    queryKey: [
      "expenses",
      debouncedSearch,
      selectedCategory,
      selectedPayment,
      sortBy,
      sortOrder,
      page,
    ],
    queryFn: () =>
      ApiClient.get<ApiResponse<Expense[]>>("/expenses", {
        search: debouncedSearch,
        categoryId: selectedCategory,
        paymentMethod: selectedPayment,
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: "10",
      }),
  });

  const expenses: Expense[] = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Delete Mutation via ApiClient
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await ApiClient.delete<ApiResponse<null>>(`/expenses/${id}`);
      if (!res.success) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast({
        type: "success",
        title: "Expense deleted",
        description: "The transaction record has been removed.",
      });
      setExpenseToDelete(null);
    },
    onError: (err: any) => {
      toast({
        type: "error",
        title: "Delete failed",
        description: err.message,
      });
    },
  });

  // CSV Export
  const handleExportCSV = () => {
    try {
      window.open(ApiClient.getExportUrl(), "_blank");
      toast({
        type: "success",
        title: "Exporting CSV",
        description: "Your expense data export has started downloading.",
      });
    } catch (error) {
      toast({
        type: "error",
        title: "Export failed",
        description: "Could not generate CSV export.",
      });
    }
  };

  const toggleSort = (field: "date" | "amount" | "title") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Transactions</h2>
          <p className="text-xs text-zinc-400">View, search, filter, and export your expense history.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Export CSV</span>
          </Button>
          <Button size="sm" onClick={onOpenQuickAdd}>
            <Plus className="h-4 w-4" />
            <span>New Expense</span>
          </Button>
        </div>
      </div>

      {/* Toolbar Filters */}
      <Card className="p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by title, notes..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="h-4 w-4 text-zinc-400" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="h-11 rounded-xl border border-border bg-surface-200/80 px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-surface-100 text-foreground">
                {c.name}
              </option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={selectedPayment}
            onChange={(e) => {
              setSelectedPayment(e.target.value);
              setPage(1);
            }}
            className="h-11 rounded-xl border border-border bg-surface-200/80 px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="CREDIT_CARD" className="bg-surface-100 text-zinc-100">Credit Card</option>
            <option value="DEBIT_CARD" className="bg-surface-100 text-zinc-100">Debit Card</option>
            <option value="CASH" className="bg-surface-100 text-zinc-100">Cash</option>
            <option value="BANK_TRANSFER" className="bg-surface-100 text-zinc-100">Bank Transfer</option>
            <option value="UPI" className="bg-surface-100 text-zinc-100">UPI</option>
            <option value="OTHER" className="bg-surface-100 text-zinc-100">Other</option>
          </select>
        </div>
      </Card>

      {/* Table Data Container */}
      {isLoading ? (
        <Card className="p-8 text-center text-zinc-400">Loading transactions...</Card>
      ) : expenses.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="Try adjusting your search query or filter settings, or record a new expense."
          actionLabel="Record Expense"
          onAction={onOpenQuickAdd}
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => toggleSort("title")} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    <span>Title & Notes</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead onClick={() => toggleSort("date")} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead onClick={() => toggleSort("amount")} className="text-right cursor-pointer">
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-zinc-100">{e.title}</p>
                      {e.notes && <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{e.notes}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge color={e.category?.color}>{e.category?.name || "General"}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400">{formatDate(e.expenseDate)}</TableCell>
                  <TableCell>
                    <span className="rounded-lg bg-surface-200 border border-white/5 px-2.5 py-1 text-xs font-mono text-zinc-300">
                      {e.paymentMethod.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-zinc-100">
                    -{formatCurrency(e.amount)}
                  </TableCell>
                  <TableCell>
                    <Dropdown
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100">
                          <span className="sr-only">Actions</span>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      }
                      items={[
                        { label: "Edit", value: "edit", icon: <Edit2 className="h-3.5 w-3.5" /> },
                        { label: "Delete", value: "delete", icon: <Trash2 className="h-3.5 w-3.5" />, danger: true },
                      ]}
                      onSelect={(val) => {
                        if (val === "edit") onEditExpense(e);
                        if (val === "delete") setExpenseToDelete(e.id);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-2 pt-2">
            <span className="text-xs text-zinc-400">
              Showing page {meta.page} of {meta.totalPages} ({meta.total} total transactions)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={Boolean(expenseToDelete)}
        onClose={() => setExpenseToDelete(null)}
        title="Delete Expense"
        description="Are you sure you want to delete this expense transaction? This action cannot be undone."
      >
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
          <Button variant="ghost" onClick={() => setExpenseToDelete(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={deleteMutation.isPending}
            onClick={() => expenseToDelete && deleteMutation.mutate(expenseToDelete)}
          >
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
