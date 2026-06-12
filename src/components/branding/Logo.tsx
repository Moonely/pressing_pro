import logoUrl from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 40 }: LogoProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20",
        className
      )}
      style={{ width: size, height: size }}
    >
      <img
        src={logoUrl}
        alt="PressingPro logo"
        width={size}
        height={size}
        loading="lazy"
        className="h-[78%] w-[78%] object-contain"
      />
    </div>
  );
}
