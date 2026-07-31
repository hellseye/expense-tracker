"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { HTMLMotionProps } from "framer-motion";

interface PressableProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export default function Pressable({
  children,
  className,
  ...props
}: PressableProps) {
  return (
    <motion.div
      whileTap={{
        scale: 0.985,
        y: 2,
        boxShadow:
          "0 4px 12px rgba(0,0,0,.25)",
      }}
      initial={{
        boxShadow:
          "0 14px 30px rgba(0,0,0,.35)",
      }}
      transition={{
        type: "spring",
        stiffness: 650,
        damping: 30,
      }}
      className={cn(
        "rounded-3xl",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}