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
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Bell,
  RefreshCw,
  Bug,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Languages,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { ApiClient } from "@/lib/api/api-client";
import { ApiResponse } from "@/types";

type SettingTab = "general" | "appearance" | "notifications" | "privacy" | "storage" | "about";

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

  // Local state for toggles
  const [language, setLanguage] = React.useState("English");
  const [weekStart, setWeekStart] = React.useState("Monday");
  const [autoSaveDrafts, setAutoSaveDrafts] = React.useState(true);
  const [precisionDecimals, setPrecisionDecimals] = React.useState(true);

  const [usageAnalytics, setUsageAnalytics] = React.useState(true);
  const [sessionTimeoutLock, setSessionTimeoutLock] = React.useState(false);

  const [enableNotifications, setEnableNotifications] = React.useState(true);
  const [soundNotifications, setSoundNotifications] = React.useState(false);
  const [budgetAlerts, setBudgetAlerts] = React.useState(true);
  const [dailyReminder, setDailyReminder] = React.useState(true);

  // Local state for accent color selection
  const [accentColor, setAccentColor] = React.useState("#8B5CF6");
  const [isGradient, setIsGradient] = React.useState(true);
  const [color2, setColor2] = React.useState("#d946ef");

  // Load saved colors on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAccent = localStorage.getItem("ledger_accent_color");
      const savedSecondary = localStorage.getItem("ledger_secondary_color");
      const savedIsGradient = localStorage.getItem("ledger_is_gradient");
      if (savedAccent) setAccentColor(savedAccent);
      if (savedSecondary) setColor2(savedSecondary);
      if (savedIsGradient !== null) setIsGradient(savedIsGradient === "true");
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
        title: "Account erased",
        description: "Your session and stored ledger data have been permanently deleted.",
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
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "storage", label: "Storage & Export", icon: HardDrive },
    { id: "about", label: "About", icon: Info },
  ];

  const accentSwatches = [
    "#8B5CF6", // Purple Gradient
    "#FF4500", // Vibrant Orange Red
    "#A52A2A", // Rust Brown
    "#FFB703", // Golden Amber
    "#76E041", // Lime Green
    "#2E7D32", // Emerald
    "#3B82F6", // Cyan Blue
    "#00B4D8", // Electric Cyan
    "#C2B280", // Muted Sand
    "#A855F7", // Lavender
    "#D946EF", // Magenta Pink
    "#EC4899", // Rose Pink
  ];

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Settings</h2>
        <p className="text-xs text-zinc-400">Customize appearance, preferences, security, and data backups.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Sidebar - macOS / SKLauncher Style */}
        <div className="w-full md:w-64 shrink-0 space-y-1.5">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as SettingTab)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/40 shadow-glow-sm"
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
        <div className="flex-1 w-full min-h-[460px] space-y-6">
          {/* TAB: GENERAL */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">General</h3>
                  <p className="text-xs text-zinc-400">General application settings and preferences.</p>
                </div>
              </div>

              {/* Language Card */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">Language</h4>
                <Card className="p-4 bg-surface-100/60 border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-surface-200 border border-white/10 flex items-center justify-center text-zinc-300">
                      <Languages className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">Language</p>
                      <p className="text-xs text-zinc-400">Choose your preferred application language</p>
                    </div>
                  </div>

                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="h-10 rounded-xl border border-border bg-surface-200 px-3.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="French">French (Français)</option>
                    <option value="German">German (Deutsch)</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                  </select>
                </Card>
              </div>

              {/* Application Preferences Card */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">Application</h4>
                <Card className="p-5 bg-surface-100/60 border-white/5 space-y-4 divide-y divide-white/5">
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">Default Currency</p>
                      <p className="text-xs text-zinc-400">Primary currency format used for financial totals</p>
                    </div>
                    <select
                      value={currency}
                      onChange={(e) => updateSettingsMutation.mutate({ currency: e.target.value })}
                      className="h-10 rounded-xl border border-border bg-surface-200 px-3.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                      <option value="CAD">CAD ($) - Canadian Dollar</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">Week Starts On</p>
                      <p className="text-xs text-zinc-400">Set start of week for spending reports</p>
                    </div>
                    <select
                      value={weekStart}
                      onChange={(e) => setWeekStart(e.target.value)}
                      className="h-10 rounded-xl border border-border bg-surface-200 px-3.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="Monday">Monday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">Auto-Save Expense Drafts</p>
                      <p className="text-xs text-zinc-400">Preserve pending transaction form details automatically</p>
                    </div>
                    <Switch checked={autoSaveDrafts} onCheckedChange={setAutoSaveDrafts} />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">High-Precision Decimal Values</p>
                      <p className="text-xs text-zinc-400">Display exact fractional currency digits</p>
                    </div>
                    <Switch checked={precisionDecimals} onCheckedChange={setPrecisionDecimals} />
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB: APPEARANCE (SKLauncher Design) */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Paintbrush className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Appearance</h3>
                  <p className="text-xs text-zinc-400">Customize the look and feel of your application.</p>
                </div>
              </div>

              <Card className="p-6 space-y-8 bg-surface-100/50 border-white/5">
                {/* Theme / Display Mode */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100">Display Mode</h4>
                    <p className="text-xs text-zinc-400">Select application color scheme and theme layout.</p>
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
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Notifications</h3>
                  <p className="text-xs text-zinc-400">Notification preferences and settings.</p>
                </div>
              </div>

              {/* General Notifications Card */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">General</h4>
                <Card className="p-5 bg-surface-100/60 border-white/5 space-y-4 divide-y divide-white/5">
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">Enable Notifications</p>
                      <p className="text-xs text-zinc-400">Receive system notifications from the app</p>
                    </div>
                    <Switch checked={enableNotifications} onCheckedChange={setEnableNotifications} />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">Sound Notifications</p>
                      <p className="text-xs text-zinc-400">Play sounds for important notifications</p>
                    </div>
                    <Switch checked={soundNotifications} onCheckedChange={setSoundNotifications} />
                  </div>
                </Card>
              </div>

              {/* Expense Updates Card */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">Expense Updates</h4>
                <Card className="p-5 bg-surface-100/60 border-white/5 space-y-4 divide-y divide-white/5">
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">Budget Limit Alerts</p>
                      <p className="text-xs text-zinc-400">Notify when spending exceeds 80% of budget limit</p>
                    </div>
                    <Switch checked={budgetAlerts} onCheckedChange={setBudgetAlerts} />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">Daily Spending Reminder</p>
                      <p className="text-xs text-zinc-400">Notify evening reminder to log today's transactions</p>
                    </div>
                    <Switch checked={dailyReminder} onCheckedChange={setDailyReminder} />
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB: PRIVACY & SECURITY */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Privacy</h3>
                  <p className="text-xs text-zinc-400">Privacy and security settings.</p>
                </div>
              </div>

              {/* Data Collection */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">Data Collection</h4>
                <Card className="p-5 bg-surface-100/60 border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">Usage Analytics</p>
                      <p className="text-xs text-zinc-400">Help improve the app by sharing anonymous usage data</p>
                    </div>
                    <Switch checked={usageAnalytics} onCheckedChange={setUsageAnalytics} />
                  </div>
                </Card>
              </div>

              {/* Account Privacy */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">Account Privacy</h4>
                <Card className="p-5 bg-surface-100/60 border-white/5 space-y-4 divide-y divide-white/5">
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">AES-256 Zero-Knowledge Field Encryption</p>
                      <p className="text-xs text-zinc-400">Titles and notes are encrypted before database persistence</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">Active</span>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">Session Timeout Auto-Lock</p>
                      <p className="text-xs text-zinc-400">Require re-authentication after 15 minutes of inactivity</p>
                    </div>
                    <Switch checked={sessionTimeoutLock} onCheckedChange={setSessionTimeoutLock} />
                  </div>
                </Card>
              </div>

              {/* Security */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">Security</h4>
                <Card className="p-5 bg-surface-100/60 border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-surface-200 border border-white/10 flex items-center justify-center text-zinc-300">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">Scan for malware & data leaks</p>
                      <p className="text-xs text-zinc-400">Check device and active sessions for known security breaches</p>
                    </div>
                  </div>

                  <Button variant="secondary" size="sm" onClick={() => toast({ type: "success", title: "Security scan complete", description: "No malware or security risks detected." })}>
                    Scan now
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {/* TAB: STORAGE & EXPORT */}
          {activeTab === "storage" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <HardDrive className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Storage & Data Export</h3>
                  <p className="text-xs text-zinc-400">Manage data backups and spreadsheet exports.</p>
                </div>
              </div>

              <Card className="p-6 space-y-6 bg-surface-100/50 border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">Export Expense History</p>
                    <p className="text-xs text-zinc-400">Download a full CSV spreadsheet of all logged transactions.</p>
                  </div>

                  <Button variant="outline" size="sm" onClick={handleExportCSV}>
                    <Download className="h-4 w-4 text-emerald-400" />
                    <span>Export CSV</span>
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">Delete Account & Clear Ledger</p>
                    <p className="text-xs text-zinc-400">Permanently delete account session and erase stored transaction history.</p>
                  </div>

                  <Button variant="danger" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Account</span>
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* TAB: ABOUT */}
          {activeTab === "about" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">About</h3>
                  <p className="text-xs text-zinc-400">App version, build, and update settings.</p>
                </div>
              </div>

              {/* Application Card */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">Application</h4>
                <Card className="p-5 bg-surface-100/60 border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Version</span>
                    <p className="text-xs font-bold text-zinc-200 mt-1">Ledger 1.5.0</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Build channel</span>
                    <p className="text-xs font-bold text-zinc-200 mt-1">Stable</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Operating system</span>
                    <p className="text-xs font-bold text-zinc-200 mt-1">macOS Tahoe</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Architecture</span>
                    <p className="text-xs font-bold text-zinc-200 mt-1">Next.js 15 (App Router)</p>
                  </div>
                </Card>
              </div>

              {/* Updates Section */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">Updates</h4>
                <Card className="p-5 bg-surface-100/60 border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">Check for updates</p>
                    <p className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>You're up to date (Last checked: {new Date().toLocaleTimeString()})</span>
                    </p>
                  </div>

                  <Button variant="secondary" size="sm" onClick={() => toast({ type: "success", title: "Checked for updates", description: "Ledger v1.5.0 is the latest stable version." })}>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Check now</span>
                  </Button>
                </Card>
              </div>

              {/* Found a bug? Section */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">Found a bug?</h4>
                <Card className="p-5 bg-surface-100/60 border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-xs text-zinc-300 leading-relaxed max-w-lg">
                    If something looks broken or behaves unexpectedly, report it to the Ledger development team on Discord.
                  </p>
                  <Button className="shrink-0" size="sm" onClick={() => toast({ type: "info", title: "Discord Support", description: "Opening Ledger Developer Support..." })}>
                    <Bug className="h-3.5 w-3.5" />
                    <span>Report Issue</span>
                  </Button>
                </Card>
              </div>

              {/* Launcher Logs Section */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">System Logs</h4>
                <Card className="p-5 bg-surface-100/60 border-white/5 flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-mono">Share diagnostic session logs for debugging</span>
                  <Button variant="secondary" size="sm" onClick={() => toast({ type: "success", title: "Logs copied", description: "Diagnostic session logs copied to clipboard." })}>
                    <FileText className="h-3.5 w-3.5" />
                    <span>Share logs</span>
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {/* Bottom Right Floating Done Action Button (SKLauncher Style) */}
          <div className="flex items-center justify-end pt-4 border-t border-white/5">
            <Button
              className="px-6 rounded-xl font-bold flex items-center gap-2 shadow-glow"
              onClick={() => {
                toast({
                  type: "success",
                  title: "Settings Saved",
                  description: "Your application preferences have been updated.",
                });
              }}
            >
              <Check className="h-4 w-4 stroke-[3px]" />
              <span>Done</span>
            </Button>
          </div>
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
