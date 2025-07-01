
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Plan, PaymentGateway } from "@/app/actions/super-admin";
import { createSubscriptionRequest } from "@/app/actions/subscriptions";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit for Review"}
    </Button>
  );
}

export function PaymentSubmissionDialog({
  plan,
  gateway,
  children,
}: {
  plan: Plan;
  gateway: PaymentGateway;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createSubscriptionRequest, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success", description: state.success });
      setOpen(false);
    }
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form action={formAction}>
          <input type="hidden" name="planId" value={plan.id} />
          <input type="hidden" name="gatewayId" value={gateway.id} />
          <DialogHeader>
            <DialogTitle>Pay with {gateway.name}</DialogTitle>
            <DialogDescription>
              Follow the instructions below to upgrade to the {plan.name} plan.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 space-y-4">
            <div>
                <Label>Instructions</Label>
                <div className="prose dark:prose-invert prose-sm max-w-none text-muted-foreground p-3 rounded-md border bg-muted/50 mt-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{gateway.instructions}</ReactMarkdown>
                </div>
            </div>
            <div>
                <Label htmlFor="transactionId">Transaction ID / Reference</Label>
                <Input
                    id="transactionId"
                    name="transactionId"
                    placeholder="Enter your payment reference here"
                    required
                />
                 <p className="text-xs text-muted-foreground mt-1">This is required to verify your payment.</p>
            </div>
          </div>
          <DialogFooter className="sm:justify-between sm:gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left mt-2 sm:mt-0">
                Total: <strong>{plan.currency_symbol}{plan.price}</strong>
            </p>
            <div className="flex gap-2 justify-end">
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <SubmitButton />
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
