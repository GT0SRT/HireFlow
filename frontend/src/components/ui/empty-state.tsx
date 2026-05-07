import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
}

export function EmptyState({ title, description, className, children }: EmptyStateProps) {
  return (
    <div className={cn("glass rounded-2xl p-10 text-center", className)}>
      <h3 className="font-display font-semibold text-lg">{title}</h3>
      <p className="text-muted-foreground mt-1">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
