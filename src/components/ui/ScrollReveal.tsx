"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in milliseconds
  threshold?: number;
  direction?: "up" | "none";
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  threshold = 0.05,
  direction = "up",
  style,
  ...props
}: ScrollRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentElement = elementRef.current;
    if (!currentElement) return;

    if (!("IntersectionObserver" in window)) {
      currentElement.classList.add("reveal-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: "0px 0px 50px 0px",
      }
    );

    observer.observe(currentElement);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return (
    <div
      ref={elementRef}
      className={cn(
        direction === "up" && "reveal-init",
        isRevealed && "reveal-visible",
        className
      )}
      style={{
        ...style,
        ...(delay > 0 ? { transitionDelay: `${delay}ms` } : {}),
      }}
      {...props}
    >
      {children}
    </div>
  );
}
