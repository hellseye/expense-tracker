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
    <aside className="relative z-50 h-full w-20 shrink-0 flex flex-col items-center py-5 rounded-[24px] border border-border bg-surface-100 shadow-card transition-colors duration-300 select-none">
      {/* Top: User Avatar (Profile) */}
      <Tooltip content="Profile">
        <Link href="/profile" className="focus:outline-none">
          <div
            className={`relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-sm font-bold text-white shadow-glow transition-transform hover:scale-105 active:scale-95 ${
              isProfileActive ? "ring-2 ring-primary ring-offset-2 ring-offset-zinc-950" : ""
            }`}
          >
            {userInitial}
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
  );
}
