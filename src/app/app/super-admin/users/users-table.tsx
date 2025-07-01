
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { format } from "date-fns";
import { MoreHorizontal, UserX, CheckCircle, Loader2 } from "lucide-react";
import type { UserWithDetails, Plan } from "@/app/actions/super-admin";
import { updateUserPlan, updateUserStatus } from "@/app/actions/super-admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


type User = UserWithDetails;

function PlanManagementDialog({ user, plans, open, onOpenChange }: { user: User, plans: Plan[], open: boolean, onOpenChange: (open: boolean) => void }) {
    const [state, formAction] = useActionState(updateUserPlan, null);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.success) {
            toast({ title: "Success", description: state.success });
            onOpenChange(false);
        }
        if (state?.error) {
            toast({ variant: "destructive", title: "Error", description: state.error });
        }
    }, [state, toast, onOpenChange]);
    
    function SubmitButton() {
        const { pending } = useFormStatus();
        return (
            <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form action={formAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <DialogHeader>
                        <DialogTitle>Change Plan for {user.full_name || user.email}</DialogTitle>
                        <DialogDescription>
                           Select a new subscription plan for this user. This will immediately apply.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                         <Select name="plan" defaultValue={user.subscription_plan || 'Free'}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                            <SelectContent>
                                {plans.map(plan => (
                                    <SelectItem key={plan.id} value={plan.name}>{plan.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
    )
}


function StatusManagementDialog({ user, open, onOpenChange, desiredStatus }: { user: User, open: boolean, onOpenChange: (open: boolean) => void, desiredStatus: 'active' | 'banned' }) {
    const [state, formAction] = useActionState(updateUserStatus, null);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.success) {
            toast({ title: "Success", description: state.success });
            onOpenChange(false);
        }
        if (state?.error) {
            toast({ variant: "destructive", title: "Error", description: state.error });
        }
    }, [state, toast, onOpenChange]);

    function SubmitButton() {
        const { pending } = useFormStatus();
        return (
            <Button type="submit" disabled={pending} variant={desiredStatus === 'banned' ? 'destructive' : 'default'}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
            </Button>
        )
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <form action={formAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="status" value={desiredStatus} />
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to {desiredStatus === 'banned' ? 'ban' : 'unban'} this user?</AlertDialogTitle>
                        <AlertDialogDescription>
                           {desiredStatus === 'banned' 
                            ? 'Banning the user will prevent them from accessing the application.' 
                            : 'Unbanning will restore their access immediately.'
                           }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                     {desiredStatus === 'banned' && (
                        <div className="py-2 space-y-2">
                            <Label htmlFor="banReason">Reason for ban (optional)</Label>
                            <Textarea id="banReason" name="banReason" placeholder="e.g., Violation of terms of service." />
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <SubmitButton />
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}



export function UsersTable({ users, plans }: { users: User[], plans: Plan[] }) {
    const [dialog, setDialog] = useState<{ type: 'plan' | 'ban' | 'unban'; user: User | null }>({ type: 'plan', user: null });
    
    const handleCloseDialog = () => setDialog({ ...dialog, user: null });

    return (
        <>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">Message Count</TableHead>
                            <TableHead className="hidden lg:table-cell">Last Seen</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                    <div className="font-bold">{user.full_name || 'N/A'}</div>
                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.subscription_plan === 'Pro' ? 'default' : 'secondary'}>
                                        {user.subscription_plan || 'Free'}
                                    </Badge>
                                </TableCell>
                                 <TableCell>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Badge variant={user.status === 'banned' ? 'destructive' : 'default'}>
                                                    {user.status === 'banned' ? <UserX className="h-3 w-3 mr-1"/> : <CheckCircle className="h-3 w-3 mr-1"/>}
                                                    {user.status || 'active'}
                                                </Badge>
                                            </TooltipTrigger>
                                            {user.status === 'banned' && user.ban_reason && (
                                                <TooltipContent>
                                                    <p>Reason: {user.ban_reason}</p>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{user.message_count}</TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'Pp') : 'Never'}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onSelect={() => setDialog({ type: 'plan', user })}>
                                                Change Plan
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {user.status !== 'banned' ? (
                                                <DropdownMenuItem onSelect={() => setDialog({ type: 'ban', user })} className="text-destructive focus:text-destructive">
                                                   Ban User
                                                </DropdownMenuItem>
                                            ) : (
                                                 <DropdownMenuItem onSelect={() => setDialog({ type: 'unban', user })}>
                                                   Unban User
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {dialog.user && dialog.type === 'plan' && <PlanManagementDialog user={dialog.user} plans={plans} open={!!dialog.user} onOpenChange={handleCloseDialog} />}
            {dialog.user && dialog.type === 'ban' && <StatusManagementDialog user={dialog.user} open={!!dialog.user} onOpenChange={handleCloseDialog} desiredStatus="banned" />}
            {dialog.user && dialog.type === 'unban' && <StatusManagementDialog user={dialog.user} open={!!dialog.user} onOpenChange={handleCloseDialog} desiredStatus="active" />}
        </>
    );
}
