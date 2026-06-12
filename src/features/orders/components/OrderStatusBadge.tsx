import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from "@/constants";

const VARIANT_CLASSES: Record<string, string> = {
  info: "bg-info/10 text-info border-info/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  success: "bg-success/10 text-success border-success/20",
  muted: "bg-muted text-muted-foreground border-border",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const variant = ORDER_STATUS_VARIANT[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", {
        "bg-info": variant === "info",
        "bg-warning": variant === "warning",
        "bg-success": variant === "success",
        "bg-muted-foreground": variant === "muted",
        "bg-destructive": variant === "destructive",
      })} />
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
