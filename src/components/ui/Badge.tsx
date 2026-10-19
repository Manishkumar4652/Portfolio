import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "crimson" | "charcoal" | "outline";
  className?: string;
}

export function Badge({
  children,
  variant = "crimson",
  className,
  ...props
}: BadgeProps) {
  const variantStyles = {
    crimson:
      "bg-red-950/40 text-red-400 border border-red-800/40 shadow-[0_0_12px_-3px_rgba(229,9,20,0.2)]",
    charcoal:
      "bg-[#16191f] text-slate-300 border border-white/10",
    outline:
      "bg-transparent text-slate-400 border border-white/10",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
