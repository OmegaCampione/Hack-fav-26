import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <Leaf className="size-5" />
      </span>
      {!compact && (
        <span className="font-display text-xl font-bold tracking-tight text-foreground">
          Peak<span className="text-primary">Cycle</span>
        </span>
      )}
    </span>
  );
}
