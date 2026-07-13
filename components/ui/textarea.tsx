import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[90px] w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-maroon-900 shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-saffron-400 focus-visible:ring-2 focus-visible:ring-saffron-200 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
