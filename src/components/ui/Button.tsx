import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  external = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600 focus-visible:ring-offset-[#040405] disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-[#e50914] text-white hover:bg-[#b80710] active:scale-[0.98] shadow-[0_0_20px_-3px_rgba(229,9,20,0.4)] hover:shadow-[0_0_25px_-1px_rgba(229,9,20,0.6)]",
    secondary:
      "bg-[#16191f] text-slate-200 border border-white/10 hover:border-white/20 hover:bg-[#1f242d] hover:text-white active:scale-[0.98]",
    outline:
      "bg-transparent text-slate-200 border border-red-600/40 hover:border-red-600 hover:text-white hover:bg-red-600/10 active:scale-[0.98]",
    ghost:
      "bg-transparent text-slate-300 hover:text-white hover:bg-white/5 active:scale-[0.98]",
  };

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-6 py-3 gap-2.5 font-semibold",
  };

  const combinedClasses = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={combinedClasses}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={combinedClasses}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
