"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DividerProps {
  className?: string;
}

export function Divider({ className }: DividerProps) {
  return (
    <div className={cn("w-full px-3.5 my-1", className)}>
      <div className="h-[1px] w-full bg-white/10" />
    </div>
  );
}
