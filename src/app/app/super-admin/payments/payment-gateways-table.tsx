
"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { MoreHorizontal, Trash2, Edit, PlusCircle, Loader2, Upload } from "lucide-react";
import { createPaymentGateway, updatePaymentGateway, deletePaymentGateway, type PaymentGateway } from "@/app/actions/super-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

type Gateway = PaymentGateway;

function GatewayForm({ gateway, onOpenChange }: { gateway?: Gateway | null, onOpenChange: (open: boolean) => void }) {
    const isEditing = !!gateway;
    const formAction = isEditing ? updatePaymentGateway : createPaymentGateway;
    const [state, action] = useActionState(formAction, null);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    function SubmitButton() {
        const { pending } = useFormStatus();
        return (
            <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing ? 'Save Changes' : 'Create Gateway')}
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
    
    useEffect(() => {
        if (!gateway) {
            formRef.current?.reset();
            setFileName(null);
        }
    }, [gateway]);

    return (
        <form ref={formRef} action={action} className="space-y-4">
            {isEditing && <input type="hidden" name="id" value={gateway.id} />}
            {isEditing && <input type="hidden" name="current_icon_url" value={gateway.icon_url || ''} />}
            <div>
                <Label htmlFor="name">Gateway Name</Label>
                <Input id="name" name="name" defaultValue={gateway?.name || ""} required />
            </div>
             <div>
                <Label htmlFor="icon">Gateway Icon</Label>
                <Input 
                  id="icon" 
                  name="icon" 
                  type="file" 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/gif, image/svg+xml"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
                />
                 <Button type="button" variant="outline" className="w-full mt-1" onClick={() => document.getElementById('icon')?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    {fileName || (gateway?.icon_url ? "Change Icon" : "Upload Icon")}
                </Button>
            </div>
            <div>
                <Label htmlFor="instructions">Payment Instructions</Label>
                <Textarea id="instructions" name="instructions" defaultValue={gateway?.instructions || ""} required rows={5} />
                 <p className="text-xs text-muted-foreground mt-1">Provide clear instructions for the user (e.g., account number, reference info). Markdown is supported.</p>
            </div>
            <div className="flex items-center space-x-2">
                <Switch id="is_active" name="is_active" defaultChecked={gateway ? gateway.is_active : true} />
                <Label htmlFor="is_active">Active</Label>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <SubmitButton />
            </DialogFooter>
        </form>
    )
}

function DeleteGatewayDialog({ gateway, open, onOpenChange }: { gateway: Gateway, open: boolean, onOpenChange: (open: boolean) => void }) {
    const [state, formAction] = useActionState(deletePaymentGateway, null);
    const { toast } = useToast();

    function SubmitButton() {
        const { pending } = useFormStatus();
        return <AlertDialogAction type="submit" disabled={pending}>{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}</AlertDialogAction>
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
                    <input type="hidden" name="id" value={gateway.id} />
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the "{gateway.name}" payment gateway. This action cannot be undone.</AlertDialogDescription>
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

export function PaymentGatewaysTable({ gateways }: { gateways: Gateway[] }) {
    const [dialogState, setDialogState] = useState<{ type: 'edit' | 'delete' | null, gateway: Gateway | null }>({ type: null, gateway: null });
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    const handleCloseDialog = () => setDialogState({ type: null, gateway: null });

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button onClick={() => setIsCreateOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Add New Gateway</Button>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Gateway</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {gateways.map((gateway) => (
                            <TableRow key={gateway.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        {gateway.icon_url ? <img src={gateway.icon_url} alt={gateway.name} className="h-6 w-6 rounded-full object-contain" /> : <div className="h-6 w-6 rounded-full bg-muted" />}
                                        <span>{gateway.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={gateway.is_active ? "default" : "secondary"}>{gateway.is_active ? "Active" : "Inactive"}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => setDialogState({ type: 'edit', gateway })}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setDialogState({ type: 'delete', gateway })} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {gateways.length === 0 && (
                            <TableRow><TableCell colSpan={3} className="h-24 text-center">No payment gateways configured.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Payment Gateway</DialogTitle>
                        <DialogDescription>Configure a new custom payment method for users.</DialogDescription>
                    </DialogHeader>
                    <GatewayForm onOpenChange={setIsCreateOpen} />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={dialogState.type === 'edit'} onOpenChange={handleCloseDialog}>
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit: {dialogState.gateway?.name}</DialogTitle>
                        <DialogDescription>Update the details for this payment method.</DialogDescription>
                    </DialogHeader>
                    {dialogState.gateway && <GatewayForm gateway={dialogState.gateway} onOpenChange={handleCloseDialog} />}
                </DialogContent>
            </Dialog>
            
            {/* Delete Dialog */}
            {dialogState.type === 'delete' && dialogState.gateway && <DeleteGatewayDialog gateway={dialogState.gateway} open={true} onOpenChange={handleCloseDialog} />}
        </>
    );
}
