"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="absolute left-full ml-3.5 z-[100] pointer-events-none whitespace-nowrap"
          >
            <div className="relative rounded-xl border border-white/10 bg-zinc-950/95 px-3.5 py-1.5 text-xs font-semibold text-zinc-100 shadow-2xl backdrop-blur-md tracking-wide">
              {/* Diamond Arrow pointing back to the icon */}
              <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 h-2.5 w-2.5 rotate-45 border-b border-l border-white/10 bg-zinc-950/95" />
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
