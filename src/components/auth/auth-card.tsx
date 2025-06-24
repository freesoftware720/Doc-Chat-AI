"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md bg-card/60 backdrop-blur-lg border border-border/20 shadow-2xl shadow-primary/10 rounded-2xl overflow-hidden"
    >
      {children}
    </motion.div>
  )
}

export function AuthCardHeader({ children }: { children: React.ReactNode }) {
    return (
        <div className="p-8 text-center border-b border-border/20">
            {children}
        </div>
    )
}

export function AuthCardTitle({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <h1 className={cn("text-2xl font-bold font-headline", className)}>
            {children}
        </h1>
    )
}

export function AuthCardDescription({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <p className={cn("text-muted-foreground mt-2", className)}>
            {children}
        </p>
    )
}

export function AuthCardContent({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("p-8", className)}>
            {children}
        </div>
    )
}

export function AuthCardFooter({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("p-6 text-center bg-muted/30 border-t border-border/20", className)}>
            {children}
        </div>
    )
}
