import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared className helpers so both panels have identical nav styling. */
export const navLinkClass =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

export const navLinkActiveClass = "bg-primary/12 text-primary";

export function NavButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button type="button" onClick={onClick} className={cn(navLinkClass, "w-full", className)}>
      {children}
    </button>
  );
}
