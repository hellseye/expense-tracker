import * as React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "../ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "No items found",
  description = "Get started by adding your first expense or category.",
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-white/10 bg-surface-100/40 backdrop-blur-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-200 text-zinc-400 border border-white/10 mb-4 shadow-inner">
        {icon || <FolderOpen className="h-6 w-6 text-primary" />}
      </div>
      <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
      <p className="mt-1 text-xs text-zinc-400 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction} size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
