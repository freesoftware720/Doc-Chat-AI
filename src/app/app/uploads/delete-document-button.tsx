
"use client";

import { useActionState, useEffect } from "react";
import { deleteDocument } from "@/app/actions/documents";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const [state, formAction, isPending] = useActionState(deleteDocument, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success", description: state.success });
    }
    if (state?.error) {
      toast({ variant: "destructive", title: "Error", description: state.error });
    }
  }, [state, toast]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isPending}>
          {isPending ? (
            <Loader className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction}>
          <input type="hidden" name="documentId" value={documentId} />
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              document and all associated chat history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={isPending}>
               {isPending ? <Loader className="h-4 w-4 animate-spin" /> : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
