"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Tags,
  PieChart,
  Settings,
  Plus,
} from "lucide-react";
import { SidebarButton } from "./sidebar-button";
import { Divider } from "./divider";
import { Tooltip } from "./tooltip";
import { useModal } from "@/components/shared/modal-context";
import { useAuth } from "@/lib/auth/auth-context";

export function Sidebar() {
  const pathname = usePathname();
  const { openQuickAdd } = useModal();
  const { user } = useAuth();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Transactions", href: "/transactions", icon: Receipt },
    { label: "Categories", href: "/categories", icon: Tags },
    { label: "Analytics", href: "/analytics", icon: PieChart },
  ];

  const isProfileActive = pathname === "/profile";
  const isSettingsActive = pathname === "/settings";
  
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile, flex on md screens) */}
      <aside className="hidden md:flex relative z-50 h-full w-20 shrink-0 flex-col items-center py-5 rounded-[24px] border border-border bg-surface-100 shadow-card transition-colors duration-300 select-none">
        {/* Top: User Avatar (Profile) */}
        <Tooltip content="Profile">
          <Link href="/profile" className="focus:outline-none">
            <div
              className={`relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-sm font-bold text-white shadow-glow transition-transform hover:scale-105 active:scale-95 overflow-hidden ${
                isProfileActive ? "ring-2 ring-primary ring-offset-2 ring-offset-zinc-950" : ""
              }`}
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                userInitial
              )}
            </div>
          </Link>
        </Tooltip>

        {/* Divider */}
        <Divider className="my-2" />

        {/* Navigation Stack */}
        <div className="flex flex-col items-center gap-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <SidebarButton
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={isActive}
              />
            );
          })}
        </div>

        {/* Divider */}
        <Divider className="my-2" />

        {/* Action Button: Add Expense */}
        <SidebarButton
          icon={Plus}
          label="Add Expense"
          onClick={openQuickAdd}
          isAddButton
        />

        {/* Flex-1 Spacer */}
        <div className="flex-1" />

        {/* Bottom Pinned: Settings */}
        <SidebarButton
          icon={Settings}
          label="Settings"
          href="/settings"
          active={isSettingsActive}
        />
      </aside>

      {/* Mobile Bottom Dock Navigation Bar (visible on < md screens) */}
      <nav className="md:hidden fixed bottom-3 inset-x-3 z-50 h-16 rounded-2xl bg-surface-100/90 backdrop-blur-xl border border-white/10 flex items-center justify-between px-4 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
                isActive ? "text-primary scale-110 font-bold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}

        {/* Quick Add Button */}
        <button
          onClick={openQuickAdd}
          className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center shadow-glow active:scale-95 transition-transform"
        >
          <Plus className="h-5 w-5 stroke-[3px]" />
        </button>

        {/* Settings Link */}
        <Link
          href="/settings"
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            isSettingsActive ? "text-primary scale-110 font-bold" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Settings className="h-5 w-5" />
        </Link>

        {/* Profile Link with Avatar */}
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            isProfileActive ? "text-primary scale-110" : "text-zinc-400"
          }`}
        >
          <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden border border-white/20">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              userInitial
            )}
          </div>
        </Link>
      </nav>
    </>
  );
}
