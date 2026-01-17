import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-purple-500/20 backdrop-blur-xl text-white border border-purple-400/30 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-purple-500/30 hover:border-purple-400/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.25),inset_0_1px_0_rgba(255,255,255,0.15)] active:scale-[0.98] transition-all duration-200",
        destructive:
          "bg-red-500/20 backdrop-blur-xl text-white border border-red-400/30 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-red-500/30 hover:border-red-400/50 active:scale-[0.98]",
        outline:
          "bg-white/5 backdrop-blur-xl text-white border border-white/20 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-white/10 hover:border-white/30 active:scale-[0.98]",
        secondary:
          "bg-cyan-500/20 backdrop-blur-xl text-white border border-cyan-400/30 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-cyan-500/30 hover:border-cyan-400/50 active:scale-[0.98]",
        ghost: 
          "bg-transparent backdrop-blur-sm text-white/80 border border-transparent rounded-2xl hover:bg-white/10 hover:border-white/20 active:scale-[0.98]",
        link: "text-purple-400 underline-offset-4 hover:underline hover:text-purple-300",
        glass:
          "bg-purple-500/20 backdrop-blur-xl text-white border border-purple-400/30 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-purple-500/30 hover:border-purple-400/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.25),inset_0_1px_0_rgba(255,255,255,0.15)] active:scale-[0.98] transition-all duration-200",
      },
      size: {
        default: "min-h-11 px-6 py-3",
        sm: "min-h-9 rounded-xl px-4 py-2 text-xs",
        lg: "min-h-14 rounded-2xl px-10 py-4 text-base",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
