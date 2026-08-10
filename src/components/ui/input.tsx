import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 px-4 py-2 text-sm font-semibold text-[#1a1a1a] dark:text-white placeholder:text-gray-450 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--store-secondary-color)] focus-visible:bg-white dark:focus-visible:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 transition-all outline-none",
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
