import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "border-primary/50 bg-primary/20 text-primary shadow-glow hover:bg-primary/30 hover:shadow-neon",
        secondary: "border-secondary/50 bg-secondary/20 text-secondary shadow-glow-secondary hover:bg-secondary/30",
        destructive: "border-destructive/50 bg-destructive/20 text-destructive hover:bg-destructive/30",
        outline: "border-foreground/30 text-foreground hover:bg-foreground/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
