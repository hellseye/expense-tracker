"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Globe, Shield, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { ApiClient } from "@/lib/api/api-client";
import { ApiResponse } from "@/types";

export function SettingsView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  // Fetch settings from user profile
  const { data: profileRes, isLoading } = useQuery<ApiResponse<any>>({
    queryKey: ["userProfile"],
    queryFn: () => ApiClient.get<ApiResponse<any>>("/user/profile"),
  });

  const profile = profileRes?.data;
  const currency = profile?.currency || "INR";
  const theme = profile?.theme || "dark";

  // Update Settings Settings Mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: { currency?: string; theme?: string }) =>
      ApiClient.patch<ApiResponse<any>>("/user/profile", data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      if (variables.currency) {
        toast({
          type: "success",
          title: "Currency updated",
          description: `Default currency successfully set to ${variables.currency}`,
        });
      }
      if (variables.theme) {
        toast({
          type: "success",
          title: "Theme updated",
          description: `Display theme set to ${variables.theme}`,
        });
      }
    },
    onError: (err: any) => {
      toast({
        type: "error",
        title: "Preferences update failed",
        description: err.message || "Failed to update settings.",
      });
    },
  });

  // Delete Account Mutation
  const deleteAccountMutation = useMutation({
    mutationFn: () => ApiClient.delete<ApiResponse<any>>("/user/profile"),
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      toast({
        type: "success",
        title: "Account deleted",
        description: "Your ledger account and data have been erased.",
      });
      // Clear auth localStorage tokens and redirect
      localStorage.clear();
      window.location.href = "/login";
    },
    onError: (err: any) => {
      toast({
        type: "error",
        title: "Deletion failed",
        description: err.message || "Could not erase account.",
      });
    },
  });

  const handleExportCSV = () => {
    try {
      window.open(ApiClient.getExportUrl(), "_blank");
      toast({
        type: "success",
        title: "Exporting CSV",
        description: "Your expense dataset export has started downloading.",
      });
    } catch (error) {
      toast({
        type: "error",
        title: "Export failed",
        description: "Could not generate CSV export.",
      });
    }
  };

  if (isLoading) {
    return <div className="text-zinc-400 text-sm">Loading application settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Settings</h2>
        <p className="text-xs text-zinc-400">Manage application preferences, default currency, and export options.</p>
      </div>

      {/* Preferences Section */}
      <Card className="p-6 space-y-6">
        <h3 className="text-base font-bold text-zinc-100 tracking-tight flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <span>Regional & Theme Preferences</span>
        </h3>

        <div className="space-y-4 pt-2 border-t border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div>
              <p className="text-sm font-semibold text-zinc-200">Default Currency</p>
              <p className="text-xs text-zinc-400">Choose currency symbol formatting across your financial dashboard.</p>
            </div>

            <select
              value={currency}
              onChange={(e) => updateSettingsMutation.mutate({ currency: e.target.value })}
              className="h-11 rounded-xl border border-white/10 bg-surface-200/80 px-4 text-sm font-semibold text-zinc-100 focus:border-primary focus:outline-none"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-t border-white/5 pt-4">
            <div>
              <p className="text-sm font-semibold text-zinc-200">Display Theme</p>
              <p className="text-xs text-zinc-400">Toggle dark mode visual layout preferences.</p>
            </div>

            <select
              value={theme}
              onChange={(e) => updateSettingsMutation.mutate({ theme: e.target.value })}
              className="h-11 rounded-xl border border-white/10 bg-surface-200/80 px-4 text-sm font-semibold text-zinc-100 focus:border-primary focus:outline-none"
            >
              <option value="dark">Tahoe Dark Launcher</option>
              <option value="light">Mac Light Mode</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Data Export & Backup */}
      <Card className="p-6 space-y-6">
        <h3 className="text-base font-bold text-zinc-100 tracking-tight flex items-center gap-2">
          <Download className="h-4 w-4 text-emerald-400" />
          <span>Data Export & Privacy</span>
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/5">
          <div>
            <p className="text-sm font-semibold text-zinc-200">Export Expense History</p>
            <p className="text-xs text-zinc-400">Download a full CSV spreadsheet of all logged transactions and notes.</p>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Export CSV</span>
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 space-y-6 border-accent-rose/20 bg-accent-rose/[0.02]">
        <h3 className="text-base font-bold text-accent-rose tracking-tight flex items-center gap-2">
          <Shield className="h-4 w-4 text-accent-rose" />
          <span>Danger Zone</span>
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-accent-rose/10">
          <div>
            <p className="text-sm font-semibold text-zinc-200">Delete Account & Clear Ledger</p>
            <p className="text-xs text-zinc-400">Permanently delete your account session and erase stored transaction history.</p>
          </div>

          <Button variant="danger" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
            <Trash2 className="h-4 w-4" />
            <span>Delete Account</span>
          </Button>
        </div>
      </Card>

      {/* Delete Account Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Account & Data"
        description="Are you sure you want to delete your account? This action is permanent and cannot be reversed."
      >
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
          <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={deleteAccountMutation.isPending}
            onClick={() => deleteAccountMutation.mutate()}
          >
            Confirm Account Erasure
          </Button>
        </div>
      </Modal>
    </div>
  );
}
