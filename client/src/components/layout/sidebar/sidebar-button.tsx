"use client";

import * as React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "./tooltip";

interface SidebarButtonProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  isAddButton?: boolean;
}

export function SidebarButton({
  icon: Icon,
  label,
  href,
  active = false,
  onClick,
  isAddButton = false,
}: SidebarButtonProps) {
  const content = (
    <div
      className={cn(
        "relative flex h-12 w-12 items-center justify-center transition-all duration-200 cursor-pointer select-none",
        isAddButton
          ? "rounded-2xl bg-primary text-white shadow-glow hover:scale-105 active:scale-95"
          : active
          ? "rounded-2xl bg-primary text-white shadow-glow scale-105 border border-white/20"
          : "rounded-xl text-zinc-400 hover:bg-white/10 hover:text-zinc-100 hover:scale-105 active:scale-95 hover:border hover:border-white/10"
      )}
    >
      <Icon className={cn("h-5 w-5 transition-colors", active && "text-white")} />
      {active && !isAddButton && (
        <span className="absolute -left-1 h-2 w-1 rounded-r-full bg-white shadow-glow" />
      )}
    </div>
  );

  const buttonElement = href ? (
    <Link href={href} className="focus:outline-none">
      {content}
    </Link>
  ) : (
    <button onClick={onClick} type="button" className="focus:outline-none">
      {content}
    </button>
  );

  return <Tooltip content={label}>{buttonElement}</Tooltip>;
}
