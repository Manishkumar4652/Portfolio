import React from "react";
import { Container } from "./Container";
import { Badge } from "./Badge";
import { cn } from "@/lib/utils";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  eyebrow?: string;
  title?: string;
  titleAs?: "h1" | "h2" | "h3";
  description?: string;
  children: React.ReactNode;
  containerSize?: "default" | "sm" | "lg" | "full";
  className?: string;
}

export function Section({
  id,
  eyebrow,
  title,
  titleAs = "h2",
  description,
  children,
  containerSize = "default",
  className,
  ...props
}: SectionProps) {
  const HeadingTag = titleAs;

  return (
    <section
      id={id}
      className={cn("py-12 sm:py-16 md:py-20 relative", className)}
      {...props}
    >
      <Container size={containerSize}>
        {(eyebrow || title || description) && (
          <div className="mb-8 md:mb-12">
            {eyebrow && (
              <div className="mb-3">
                <Badge variant="crimson">{eyebrow}</Badge>
              </div>
            )}
            {title && (
              <HeadingTag className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
                {title}
              </HeadingTag>
            )}
            {description && (
              <p className="mt-3 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
