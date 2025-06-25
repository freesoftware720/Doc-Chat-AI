
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import { UserX } from "lucide-react";
import { motion } from "framer-motion";

export function BannedUserPage({ reason }: { reason: string }) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-0 dark:opacity-20"></div>
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_50%,hsl(var(--destructive)/0.05),transparent_30%),radial-gradient(circle_at_85%_30%,hsl(var(--accent)/0.05),transparent_30%)]"></div>
      </div>
       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
       >
        <Card className="w-full max-w-lg text-center bg-card/60 backdrop-blur-md border-destructive/50 shadow-lg shadow-destructive/10">
            <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <UserX className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold">Account Suspended</CardTitle>
            <CardDescription>
                Your access to this workspace has been suspended by an administrator.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <div>
                <p className="text-sm font-medium text-left text-muted-foreground">Reason provided:</p>
                <div className="text-sm text-foreground text-left bg-muted/50 p-4 rounded-md mt-2 border">
                    <p>{reason}</p>
                </div>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
                If you believe this is a mistake, please contact your workspace administrator or support.
            </p>
            <form action={logout}>
                <Button variant="outline" className="w-full">
                Logout
                </Button>
            </form>
            </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
