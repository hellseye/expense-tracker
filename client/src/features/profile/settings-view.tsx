"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  Globe,
  Shield,
  Trash2,
  Settings,
  Paintbrush,
  HardDrive,
  Info,
  Check,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { ApiClient } from "@/lib/api/api-client";
import { ApiResponse } from "@/types";

type SettingTab = "general" | "appearance" | "storage" | "privacy" | "about";

export function SettingsView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<SettingTab>("appearance");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  // Fetch settings from user profile
  const { data: profileRes, isLoading } = useQuery<ApiResponse<any>>({
    queryKey: ["userProfile"],
    queryFn: () => ApiClient.get<ApiResponse<any>>("/user/profile"),
  });

  const profile = profileRes?.data;
  const currency = profile?.currency || "INR";
  const theme = profile?.theme || "dark";

  // Local state for accent color selection
  const [accentColor, setAccentColor] = React.useState("#8B5CF6");
  const [isGradient, setIsGradient] = React.useState(true);
  const [color2, setColor2] = React.useState("#d946ef");

  // Load saved colors on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAccent = localStorage.getItem("ledger_accent_color");
      if (savedAccent) setAccentColor(savedAccent);
    }
  }, []);

  const handleAccentChange = (newColor: string) => {
    setAccentColor(newColor);
    localStorage.setItem("ledger_accent_color", newColor);
    const root = document.documentElement;
    root.style.setProperty("--primary", newColor);
    root.style.setProperty("--primary-glow", `${newColor}40`);
    if (isGradient && color2) {
      root.style.setProperty("--primary-gradient", `linear-gradient(135deg, ${newColor}, ${color2})`);
    } else {
      root.style.setProperty("--primary-gradient", newColor);
    }
    window.dispatchEvent(new Event("storage"));
  };

  const handleSecondaryChange = (newColor: string) => {
    setColor2(newColor);
    localStorage.setItem("ledger_secondary_color", newColor);
    const root = document.documentElement;
    root.style.setProperty("--secondary", newColor);
    if (isGradient && accentColor) {
      root.style.setProperty("--primary-gradient", `linear-gradient(135deg, ${accentColor}, ${newColor})`);
    }
    window.dispatchEvent(new Event("storage"));
  };

  const handleGradientToggle = (gradientState: boolean) => {
    setIsGradient(gradientState);
    localStorage.setItem("ledger_is_gradient", String(gradientState));
    const root = document.documentElement;
    if (gradientState && accentColor && color2) {
      root.style.setProperty("--primary-gradient", `linear-gradient(135deg, ${accentColor}, ${color2})`);
    } else if (accentColor) {
      root.style.setProperty("--primary-gradient", accentColor);
    }
    window.dispatchEvent(new Event("storage"));
  };

  // Mutation for updating user settings in DB
  const updateSettingsMutation = useMutation({
    mutationFn: (data: { currency?: string; theme?: string }) =>
      ApiClient.patch<ApiResponse<any>>("/user/profile", data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      if (variables.currency) {
        toast({
          type: "success",
          title: "Currency updated",
          description: `Default currency set to ${variables.currency}`,
        });
      }
      if (variables.theme) {
        localStorage.setItem("ledger_theme", variables.theme);
        const root = document.documentElement;
        root.classList.remove("light", "dark", "oled");
        if (variables.theme === "system") {
          const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          root.classList.add(isSystemDark ? "dark" : "light");
        } else {
          root.classList.add(variables.theme);
        }
        window.dispatchEvent(new Event("storage"));
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
        title: "Settings update failed",
        description: err.message || "Failed to update preferences.",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => ApiClient.delete<ApiResponse<any>>("/user/profile"),
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      toast({
        type: "success",
        title: "Account deleted",
        description: "Your ledger account and data have been erased.",
      });
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
        description: "Your expense history is downloading.",
      });
    } catch {
      toast({
        type: "error",
        title: "Export failed",
        description: "Could not generate CSV spreadsheet.",
      });
    }
  };

  if (isLoading) {
    return <div className="text-zinc-400 text-sm">Loading application settings...</div>;
  }

  const sidebarItems = [
    { id: "general", label: "General", icon: Settings },
    { id: "appearance", label: "Appearance", icon: Paintbrush },
    { id: "storage", label: "Backup & Export", icon: HardDrive },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "about", label: "About", icon: Info },
  ];

  const accentSwatches = [
    "#8B5CF6", // Purple
    "#EF4444", // Red
    "#F97316", // Orange
    "#F59E0B", // Amber
    "#10B981", // Emerald
    "#06B6D4", // Cyan
    "#3B82F6", // Blue
    "#6366F1", // Indigo
    "#EC4899", // Pink
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Settings</h2>
        <p className="text-xs text-zinc-400">Customize appearance, defaults, and data backups.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Sidebar - macOS Style */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as SettingTab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-glow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Active Panel */}
        <div className="flex-1 w-full min-h-[420px]">
          {/* TAB: GENERAL */}
          {activeTab === "general" && (
            <Card className="p-6 space-y-6 bg-surface-100/50 border-white/5">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Globe className="h-4.5 w-4.5 text-primary" />
                  <span>General Preferences</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Configure default currencies and localization options.</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">Default Currency</p>
                  <p className="text-xs text-zinc-400">Choose currency formatting used across your dashboard.</p>
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
            </Card>
          )}

          {/* TAB: APPEARANCE (Reference Design implementation) */}
          {activeTab === "appearance" && (
            <Card className="p-6 space-y-8 bg-surface-100/50 border-white/5">
              {/* Theme / Display Mode */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-zinc-100">Display Mode</h4>
                  <p className="text-xs text-zinc-400">Customize the look and feel of your application.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      id: "system",
                      label: "System",
                      icon: Monitor,
                      boxClass: "bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-100 border border-white/10",
                      innerBg: "bg-zinc-800/80",
                      lineClass: "bg-zinc-400/40",
                    },
                    {
                      id: "light",
                      label: "Light",
                      icon: Sun,
                      boxClass: "bg-zinc-100 border border-zinc-300",
                      innerBg: "bg-white border border-zinc-200",
                      lineClass: "bg-zinc-400",
                    },
                    {
                      id: "dark",
                      label: "Dark",
                      icon: Moon,
                      boxClass: "bg-zinc-900 border border-white/10",
                      innerBg: "bg-zinc-950 border border-white/5",
                      lineClass: "bg-zinc-600",
                    },
                    {
                      id: "oled",
                      label: "OLED",
                      icon: Moon,
                      boxClass: "bg-black border border-white/15",
                      innerBg: "bg-black border border-white/10",
                      lineClass: "bg-zinc-700",
                    },
                  ].map((mode) => {
                    const isSelected = theme === mode.id;
                    const ModeIcon = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => updateSettingsMutation.mutate({ theme: mode.id })}
                        className={`group relative p-3 rounded-2xl border bg-surface-200/40 text-left transition-all ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/40 shadow-glow-sm bg-primary/5"
                            : "border-white/5 hover:border-white/10"
                        }`}
                      >
                        {/* SKLauncher Style Wireframe Preview Card */}
                        <div
                          className={`h-20 w-full rounded-xl mb-3 ${mode.boxClass} p-2 flex flex-col justify-between overflow-hidden shadow-inner relative`}
                        >
                          <div className="flex items-center gap-1.5 opacity-60">
                            <div className="h-1.5 w-1.5 rounded-full bg-current" />
                            <div className="h-1 w-8 rounded-full bg-current opacity-40" />
                          </div>
                          <div className={`p-1.5 rounded-lg ${mode.innerBg} space-y-1`}>
                            <div className={`h-1 w-full rounded-full ${mode.lineClass}`} />
                            <div className={`h-1 w-2/3 rounded-full ${mode.lineClass}`} />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <ModeIcon className="h-3.5 w-3.5 text-zinc-400 group-hover:text-primary transition-colors" />
                          <span className="text-xs font-bold text-zinc-300 group-hover:text-zinc-100 transition-colors">
                            {mode.label}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center shadow-glow">
                            <Check className="h-2.5 w-2.5 text-white stroke-[3.5px]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Section */}
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div>
                  <h4 className="text-sm font-bold text-zinc-100">Accent Color</h4>
                  <p className="text-xs text-zinc-400">Select color highlights for buttons, active state panels, and visual graphs.</p>
                </div>

                {/* Swatches Grid */}
                <div className="grid grid-cols-6 sm:grid-cols-6 gap-2.5">
                  {accentSwatches.map((color) => {
                    const isSelected = accentColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => handleAccentChange(color)}
                        className="h-10 w-full rounded-xl relative flex items-center justify-center transition-transform hover:scale-105 border border-white/10 shadow-sm"
                        style={{ backgroundColor: color }}
                      >
                        {isSelected && (
                          <div className="h-4.5 w-4.5 rounded-full bg-white flex items-center justify-center shadow-md">
                            <Check className="h-3 w-3 text-zinc-900 stroke-[4px]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Selector Card */}
                <div className="p-4 rounded-2xl bg-surface-200/40 border border-white/5 space-y-4">
                  <p className="text-xs text-zinc-400">Pick your own accent colors. Use two colors for a gradient or a single flat color.</p>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Flat/Gradient Toggle Buttons */}
                    <div className="flex rounded-lg border border-white/10 overflow-hidden bg-surface-300">
                      <button
                        onClick={() => handleGradientToggle(true)}
                        className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1 transition-all ${
                          isGradient ? "bg-primary text-white" : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Gradient</span>
                      </button>
                      <button
                        onClick={() => handleGradientToggle(false)}
                        className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1 transition-all ${
                          !isGradient ? "bg-primary text-white" : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <span>Flat</span>
                      </button>
                    </div>

                    {/* Inputs */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-zinc-400">Color 1</label>
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => handleAccentChange(e.target.value)}
                          className="h-7 w-7 rounded cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono text-zinc-400">{accentColor}</span>
                      </div>

                      {isGradient && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-zinc-400">Color 2</label>
                          <input
                            type="color"
                            value={color2}
                            onChange={(e) => handleSecondaryChange(e.target.value)}
                            className="h-7 w-7 rounded cursor-pointer bg-transparent border-0"
                          />
                          <span className="text-xs font-mono text-zinc-400">{color2}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview Banner */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Preview</span>
                    <div
                      className="h-10 w-full rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-inner"
                      style={{
                        background: isGradient
                          ? `linear-gradient(135deg, ${accentColor}, ${color2})`
                          : accentColor,
                      }}
                    >
                      Ledger Accent
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB: BACKUP & EXPORT */}
          {activeTab === "storage" && (
            <Card className="p-6 space-y-6 bg-surface-100/50 border-white/5">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Download className="h-4.5 w-4.5 text-emerald-400" />
                  <span>Backup & Data Export</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Safely export your logged transaction history to CSV format.</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
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
          )}

          {/* TAB: PRIVACY */}
          {activeTab === "privacy" && (
            <Card className="p-6 space-y-6 bg-surface-100/50 border-white/5">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Shield className="h-4.5 w-4.5 text-primary" />
                  <span>Data Privacy & Security</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Information on how your personal data and ledger records are protected.</p>
              </div>

              {/* Privacy Notice Banner */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <Shield className="h-4 w-4" />
                  <span>AES-256-GCM Zero-Knowledge Field Encryption Active</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Your expense titles and notes are cryptographically encrypted at the application level before being saved to the database. Even database administrators cannot read your transaction names or notes.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-zinc-400">
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-emerald-400">✓ End-to-End Field Encrypted</span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-blue-400">✓ Strict Row Isolation</span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-purple-400">✓ Bcrypt Password Hashing</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
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
          )}

          {/* TAB: ABOUT */}
          {activeTab === "about" && (
            <Card className="p-6 space-y-6 bg-surface-100/50 border-white/5">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Info className="h-4.5 w-4.5 text-blue-400" />
                  <span>About Application & Architecture</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Ledger is a high-performance personal finance dashboard crafted with linear aesthetics and zero-knowledge field-level privacy.
                </p>
              </div>

              {/* Engineering Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-surface-200/50 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Framework</span>
                  <p className="text-xs font-bold text-zinc-200">Next.js 15 App Router</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-200/50 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Database</span>
                  <p className="text-xs font-bold text-zinc-200">Neon PostgreSQL</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-200/50 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Encryption</span>
                  <p className="text-xs font-bold text-emerald-400">AES-256-GCM</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-200/50 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Performance</span>
                  <p className="text-xs font-bold text-primary">&lt; 50ms Edge</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Product Name</span>
                  <span className="text-zinc-100 font-semibold">Ledger Personal Finance</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Build Version</span>
                  <span className="text-zinc-100 font-mono">v1.5.0 (Tahoe Release)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Crafted By</span>
                  <span className="text-zinc-100 font-semibold">Mayank & Ledger Dev Team</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

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
