"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (options: Omit<ToastMessage, "id">) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback(({ type, title, description }: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const safeDescription =
      typeof description === "object"
        ? (description as any)?.message || String(description)
        : description;

    setToasts((prev) => [...prev, { id, type, title, description: safeDescription }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-xl text-zinc-100",
                t.type === "success" && "border-accent-emerald/30 bg-surface-100/90 text-emerald-400",
                t.type === "error" && "border-accent-rose/30 bg-surface-100/90 text-rose-400",
                t.type === "info" && "border-primary/30 bg-surface-100/90 text-purple-400"
              )}
            >
              {t.type === "success" && <CheckCircle2 className="h-5 w-5 shrink-0 text-accent-emerald mt-0.5" />}
              {t.type === "error" && <AlertCircle className="h-5 w-5 shrink-0 text-accent-rose mt-0.5" />}
              {t.type === "info" && <Info className="h-5 w-5 shrink-0 text-primary mt-0.5" />}

              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-100">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs text-zinc-400">{t.description}</p>}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-zinc-500 hover:text-zinc-300 p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
