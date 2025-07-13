
"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Upload } from "lucide-react";
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [state, formAction] = useActionState(createSubscriptionRequest, null);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success", description: state.success });
      setIsSuccess(true);
    }
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.error,
      });
    }
  }, [state, toast]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    // Reset form state if dialog is closed
    if (!isOpen) {
        setTimeout(() => {
            setIsSuccess(false);
            formRef.current?.reset();
            setFileName(null);
        }, 200); // delay to allow for fade-out animation
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {isSuccess ? (
          <>
            <DialogHeader>
                <DialogTitle>Request Submitted!</DialogTitle>
                <DialogDescription>
                    Your upgrade request has been sent for review. You will be notified upon approval.
                </DialogDescription>
            </DialogHeader>
            <div className="text-center py-8 flex flex-col items-center gap-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <p className="text-lg font-medium">{state?.success}</p>
            </div>
            <DialogFooter>
                <Button onClick={() => handleOpenChange(false)} className="w-full">Done</Button>
            </DialogFooter>
          </>
        ) : (
          <form ref={formRef} action={formAction}>
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
               <div>
                  <Label htmlFor="receipt">Upload Receipt (Optional)</Label>
                  <Input
                      id="receipt"
                      name="receipt"
                      type="file"
                      accept="image/png, image/jpeg, image/gif"
                      className="hidden"
                      onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
                  />
                  <Button type="button" variant="outline" className="w-full mt-1" onClick={() => document.getElementById('receipt')?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        {fileName ? <span className="truncate">{fileName}</span> : 'Choose Image'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">Upload a screenshot of your payment confirmation.</p>
              </div>
            </div>
            <DialogFooter className="sm:justify-between sm:gap-4">
              <p className="text-sm text-muted-foreground text-center sm:text-left mt-2 sm:mt-0">
                  Total: <strong>{plan.currency_symbol}{plan.price}</strong>
              </p>
              <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                  <SubmitButton />
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
