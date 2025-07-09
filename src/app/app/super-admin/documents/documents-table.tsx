
"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { format, formatDistanceToNow } from "date-fns";
import { MoreHorizontal, FileText, Trash2, ArrowRightLeft, Eye, Loader2 } from "lucide-react";
import { deleteDocumentAsAdmin, transferDocumentOwnership, type DocumentWithUserDetails } from "@/app/actions/super-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { formatBytes } from "@/lib/utils";

type Document = DocumentWithUserDetails;

function DeleteDocumentDialog({ document, open, onOpenChange }: { document: Document; open: boolean; onOpenChange: (open: boolean) => void }) {
    const [state, formAction] = useActionState(deleteDocumentAsAdmin, null);
    const { toast } = useToast();

    function SubmitButton() {
        const { pending } = useFormStatus();
        return (
            <AlertDialogAction type="submit" disabled={pending}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
        );
    }

    useEffect(() => {
        if (state?.success) {
            toast({ title: "Success", description: state.success });
            onOpenChange(false);
        } else if (state?.error) {
            toast({ variant: "destructive", title: "Error", description: state.error });
        }
    }, [state, toast, onOpenChange]);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <form action={formAction}>
                    <input type="hidden" name="documentId" value={document.id} />
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "{document.name}" and all its associated chat history. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <SubmitButton />
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function TransferDocumentDialog({ document, open, onOpenChange }: { document: Document; open: boolean; onOpenChange: (open: boolean) => void }) {
    const [state, formAction] = useActionState(transferDocumentOwnership, null);
    const { toast } = useToast();

     function SubmitButton() {
        const { pending } = useFormStatus();
        return (
            <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Transfer"}
            </Button>
        );
    }

    useEffect(() => {
        if (state?.success) {
            toast({ title: "Success", description: state.success });
            onOpenChange(false);
        } else if (state?.error) {
            toast({ variant: "destructive", title: "Error", description: state.error });
        }
    }, [state, toast, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                 <form action={formAction}>
                    <input type="hidden" name="documentId" value={document.id} />
                    <DialogHeader>
                        <DialogTitle>Transfer Document</DialogTitle>
                        <DialogDescription>
                            Transfer "{document.name}" to a new owner. The current owner is <strong>{document.user_email}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="newOwnerEmail">New Owner's Email</Label>
                        <Input id="newOwnerEmail" name="newOwnerEmail" type="email" placeholder="new.owner@example.com" required />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


export function DocumentsTable({ documents }: { documents: Document[] }) {
    const [filter, setFilter] = useState("");
    const [dialogState, setDialogState] = useState<{ type: 'delete' | 'transfer' | null; doc: Document | null }>({ type: null, doc: null });
    const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

    const filteredDocuments = useMemo(() => {
        if (!filter) return documents;
        return documents.filter(
            (doc) =>
                doc.name.toLowerCase().includes(filter.toLowerCase()) ||
                doc.user_email.toLowerCase().includes(filter.toLowerCase()) ||
                (doc.user_full_name && doc.user_full_name.toLowerCase().includes(filter.toLowerCase()))
        );
    }, [documents, filter]);

    const handleCloseDialog = () => setDialogState({ type: null, doc: null });

    return (
        <>
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter by document name or user..."
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    className="max-w-sm"
                />
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Document</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Uploaded</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredDocuments.map((doc) => (
                            <TableRow key={doc.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        <span className="truncate" title={doc.name}>{doc.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium truncate" title={doc.user_full_name || doc.user_email}>
                                        {doc.user_full_name}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">{doc.user_email}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm" title={format(new Date(doc.created_at), "PPPpp")}>
                                        {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                                    </div>
                                </TableCell>
                                <TableCell>{formatBytes(doc.file_size || 0)}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onSelect={() => setPreviewDoc(doc)}>
                                                <Eye className="mr-2 h-4 w-4" />Preview Text
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setDialogState({ type: 'transfer', doc })}>
                                                <ArrowRightLeft className="mr-2 h-4 w-4" />Transfer
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onSelect={() => setDialogState({ type: 'delete', doc })} className="text-destructive focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                         {filteredDocuments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No documents found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            <Sheet open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Preview: {previewDoc?.name}</SheetTitle>
                        <SheetDescription>Showing the first 500 characters of extracted text.</SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 text-sm bg-muted p-4 rounded-lg max-h-[80vh] overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-mono text-xs">
                            <code>{previewDoc?.content ? previewDoc.content.substring(0, 500) + '...' : 'No text content available.'}</code>
                        </pre>
                    </div>
                </SheetContent>
            </Sheet>

            {dialogState.type === 'delete' && dialogState.doc && <DeleteDocumentDialog document={dialogState.doc} open={true} onOpenChange={handleCloseDialog} />}
            {dialogState.type === 'transfer' && dialogState.doc && <TransferDocumentDialog document={dialogState.doc} open={true} onOpenChange={handleCloseDialog} />}
        </>
    );
}
