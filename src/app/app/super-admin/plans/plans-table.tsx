
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { MoreHorizontal, Trash2, Edit, PlusCircle, Loader2 } from "lucide-react";
import { createPlan, updatePlan, deletePlan, type Plan } from "@/app/actions/super-admin";
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

function PlanForm({ plan, onOpenChange }: { plan?: Plan | null, onOpenChange: (open: boolean) => void }) {
    const isEditing = !!plan;
    const formAction = isEditing ? updatePlan : createPlan;
    const [state, action] = useActionState(formAction, null);
    const { toast } = useToast();

    function SubmitButton() {
        const { pending } = useFormStatus();
        return (
            <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing ? 'Save Changes' : 'Create Plan')}
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
        <form action={action} className="space-y-4">
            {isEditing && <input type="hidden" name="id" value={plan.id} />}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="name">Plan Name</Label>
                    <Input id="name" name="name" defaultValue={plan?.name || ""} required />
                </div>
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" name="description" defaultValue={plan?.description || ""} />
                </div>
            </div>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 <div>
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" name="price" type="number" step="0.01" defaultValue={plan?.price || 0} required />
                </div>
                <div>
                    <Label htmlFor="currency">Currency Code</Label>
                    <Input id="currency" name="currency" placeholder="USD" defaultValue={plan?.currency || "USD"} required />
                </div>
                <div>
                    <Label htmlFor="currency_symbol">Currency Symbol</Label>
                    <Input id="currency_symbol" name="currency_symbol" placeholder="$" defaultValue={plan?.currency_symbol || "$"} required />
                </div>
                <div>
                    <Label htmlFor="period">Period</Label>
                    <Input id="period" name="period" placeholder="/ month" defaultValue={plan?.period || "/ month"} />
                </div>
            </div>
            <div>
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea id="features" name="features" defaultValue={plan?.features.join('\n') || ""} required rows={5} />
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Switch id="is_active" name="is_active" defaultChecked={plan ? plan.is_active : true} />
                    <Label htmlFor="is_active">Active</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Switch id="is_popular" name="is_popular" defaultChecked={plan?.is_popular || false} />
                    <Label htmlFor="is_popular">Popular</Label>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <SubmitButton />
            </DialogFooter>
        </form>
    )
}

function DeletePlanDialog({ plan, open, onOpenChange }: { plan: Plan, open: boolean, onOpenChange: (open: boolean) => void }) {
    const [state, formAction] = useActionState(deletePlan, null);
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
                    <input type="hidden" name="id" value={plan.id} />
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the "{plan.name}" plan. This action cannot be undone.</AlertDialogDescription>
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

export function PlansTable({ plans }: { plans: Plan[] }) {
    const [dialogState, setDialogState] = useState<{ type: 'edit' | 'delete' | null, plan: Plan | null }>({ type: null, plan: null });
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    const handleCloseDialog = () => setDialogState({ type: null, plan: null });

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button onClick={() => setIsCreateOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Add New Plan</Button>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plans.map((plan) => (
                            <TableRow key={plan.id}>
                                <TableCell className="font-medium">
                                    {plan.name}
                                    {plan.is_popular && <Badge variant="outline" className="ml-2 border-primary text-primary">Popular</Badge>}
                                </TableCell>
                                <TableCell>
                                    {plan.currency_symbol}{plan.price} {plan.currency} {plan.period}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={plan.is_active ? "default" : "secondary"}>{plan.is_active ? "Active" : "Inactive"}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => setDialogState({ type: 'edit', plan })}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setDialogState({ type: 'delete', plan })} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {plans.length === 0 && (
                            <TableRow><TableCell colSpan={4} className="h-24 text-center">No plans configured.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add New Plan</DialogTitle>
                        <DialogDescription>Configure a new subscription plan for users.</DialogDescription>
                    </DialogHeader>
                    <PlanForm onOpenChange={setIsCreateOpen} />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={dialogState.type === 'edit'} onOpenChange={handleCloseDialog}>
                 <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit: {dialogState.plan?.name}</DialogTitle>
                        <DialogDescription>Update the details for this plan.</DialogDescription>
                    </DialogHeader>
                    {dialogState.plan && <PlanForm plan={dialogState.plan} onOpenChange={handleCloseDialog} />}
                </DialogContent>
            </Dialog>
            
            {/* Delete Dialog */}
            {dialogState.type === 'delete' && dialogState.plan && <DeletePlanDialog plan={dialogState.plan} open={true} onOpenChange={handleCloseDialog} />}
        </>
    );
}
