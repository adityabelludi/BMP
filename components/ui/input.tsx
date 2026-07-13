import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-cream-300 bg-white px-4 py-2 text-sm text-maroon-900 shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-saffron-400 focus-visible:ring-2 focus-visible:ring-saffron-200 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
