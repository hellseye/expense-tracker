import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: string;
  variant?: "solid" | "outline" | "subtle";
}

export function Badge({
  className,
  color,
  variant = "subtle",
  children,
  ...props
}: BadgeProps) {
  const customStyle: React.CSSProperties = color
    ? {
        backgroundColor: variant === "subtle" ? `${color}18` : variant === "solid" ? color : "transparent",
        color: color,
        borderColor: `${color}40`,
      }
    : {};

  return (
    <div
      style={customStyle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border border-white/10 transition-colors",
        !color && "bg-surface-200 text-zinc-300 border-white/10",
        className
      )}
      {...props}
    >
      {color && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </div>
  );
}
