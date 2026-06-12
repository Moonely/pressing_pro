import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  trend?: { value: string; positive?: boolean };
  accent?: "primary" | "success" | "warning" | "info";
}

const ACCENT: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

export function StatCard({ label, value, hint, icon: Icon, trend, accent = "primary" }: StatCardProps) {
  return (
    <Card className="border-border shadow-elevation-sm transition-shadow hover:shadow-elevation-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          </div>
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", ACCENT[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend && (
          <p className={cn("mt-3 text-xs font-medium", trend.positive ? "text-success" : "text-destructive")}>
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
