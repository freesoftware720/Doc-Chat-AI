
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { format, formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Loader2, Check, X, Clock, HelpCircle, Eye, CheckCircle, Paperclip } from "lucide-react";
import { approveSubscriptionRequest, rejectSubscriptionRequest, type SubscriptionRequestWithDetails } from "@/app/actions/super-admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Request = SubscriptionRequestWithDetails;

const statusConfig = {
    pending: { label: "Pending", icon: <Clock className="h-3 w-3" />, variant: "secondary" as const, color: "text-amber-500" },
    approved: { label: "Approved", icon: <Check className="h-3 w-3" />, variant: "default" as const, color: "text-green-500" },
    rejected: { label: "Rejected", icon: <X className="h-3 w-3" />, variant: "destructive" as const, color: "text-red-500" },
};

function ActionDialog({
    request,
    type,
    open,
    onOpenChange,
}: {
    request: Request,
    type: 'approve' | 'reject',
    open: boolean,
    onOpenChange: (open: boolean) => void
}) {
    const action = type === 'approve' ? approveSubscriptionRequest : rejectSubscriptionRequest;
    const [state, formAction] = useActionState(action, null);
    const [isSuccess, setIsSuccess] = useState(false);
    const { toast } = useToast();

    function SubmitButton() {
        const { pending } = useFormStatus();
        return (
            <Button type="submit" disabled={pending} variant={type === 'reject' ? 'destructive' : 'default'}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : (type === 'approve' ? 'Approve' : 'Reject')}
            </Button>
        );
    }
    
    useEffect(() => {
        if (state?.success) {
            toast({ title: "Success", description: state.success });
            setIsSuccess(true);
        } else if (state?.error) {
            toast({ variant: "destructive", title: "Error", description: state.error });
        }
    }, [state, toast]);

    const handleOpenChange = (isOpen: boolean) => {
        onOpenChange(isOpen);
        if (!isOpen) {
            setTimeout(() => setIsSuccess(false), 200); // Reset on close
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                {isSuccess ? (
                     <>
                        <DialogHeader>
                            <DialogTitle>Success!</DialogTitle>
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
                    <form action={formAction}>
                        <input type="hidden" name="requestId" value={request.id} />
                        <input type="hidden" name="userId" value={request.user_id} />
                        <input type="hidden" name="planName" value={request.plan_name} />
                        <DialogHeader>
                            <DialogTitle>Are you sure you want to {type} this request?</DialogTitle>
                            <DialogDescription>
                                User: {request.user_name} ({request.user_email})<br/>
                                Plan: {request.plan_name}
                            </DialogDescription>
                        </DialogHeader>
                        {type === 'reject' && (
                            <div className="py-4">
                                <Label htmlFor="reason">Reason for rejection (optional)</Label>
                                <Textarea id="reason" name="reason" placeholder="e.g., Transaction ID not found." />
                            </div>
                        )}
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                            <SubmitButton />
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

export function SubscriptionsTable({ requests }: { requests: Request[] }) {
    const [filter, setFilter] = useState("pending");
    const [dialogState, setDialogState] = useState<{ type: 'approve' | 'reject' | 'view', request: Request | null }>({ type: 'view', request: null });

    const filteredRequests = requests.filter(req => filter === 'all' || req.status === filter);
    
    const handleCloseDialog = () => setDialogState({ ...dialogState, request: null });

    return (
        <>
            <div className="flex items-center py-4 gap-2">
                <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')}>Pending</Button>
                <Button variant={filter === 'approved' ? 'default' : 'outline'} onClick={() => setFilter('approved')}>Approved</Button>
                <Button variant={filter === 'rejected' ? 'default' : 'outline'} onClick={() => setFilter('rejected')}>Rejected</Button>
                <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Receipt</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {filteredRequests.map((request) => {
                            const status = statusConfig[request.status as keyof typeof statusConfig] || { label: 'Unknown', icon: <HelpCircle />, variant: 'secondary' as const };
                            return (
                                <TableRow key={request.id}>
                                    <TableCell>
                                        <div className="font-medium">{request.user_name}</div>
                                        <div className="text-xs text-muted-foreground">{request.user_email}</div>
                                    </TableCell>
                                    <TableCell>{request.plan_name}</TableCell>
                                    <TableCell>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</TableCell>
                                    <TableCell>
                                        {request.receipt_url ? (
                                            <a href={request.receipt_url} target="_blank" rel="noopener noreferrer">
                                                <Paperclip className="h-4 w-4 hover:text-primary"/>
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={status.variant} className="gap-1 capitalize">
                                            {status.icon} {request.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => setDialogState({ type: 'view', request })}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                                                {request.status === 'pending' && (
                                                    <>
                                                        <DropdownMenuItem onSelect={() => setDialogState({ type: 'approve', request })}><Check className="mr-2 h-4 w-4" />Approve</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => setDialogState({ type: 'reject', request })} className="text-destructive focus:text-destructive"><X className="mr-2 h-4 w-4" />Reject</DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                         })}
                          {filteredRequests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No {filter === 'all' ? '' : filter} requests found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {dialogState.type === 'approve' && dialogState.request && <ActionDialog request={dialogState.request} type="approve" open={true} onOpenChange={handleCloseDialog} />}
            {dialogState.type === 'reject' && dialogState.request && <ActionDialog request={dialogState.request} type="reject" open={true} onOpenChange={handleCloseDialog} />}

            {dialogState.type === 'view' && dialogState.request && (
                <Dialog open={true} onOpenChange={handleCloseDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Request Details</DialogTitle>
                            <DialogDescription>
                                This dialog shows the complete details for the selected subscription request.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 text-sm">
                            <div className="space-y-1">
                               <p><strong>User:</strong> {dialogState.request.user_name} ({dialogState.request.user_email})</p>
                                <p><strong>Plan:</strong> {dialogState.request.plan_name}</p>
                                <p><strong>Gateway:</strong> {dialogState.request.gateway_name}</p>
                                <p><strong>Transaction ID:</strong> <span className="font-mono bg-muted px-2 py-1 rounded">{dialogState.request.transaction_id}</span></p>
                                <p><strong>Submitted:</strong> {format(new Date(dialogState.request.created_at), 'Pp')}</p>
                                <p><strong>Status:</strong> <span className="capitalize font-medium">{dialogState.request.status}</span></p>
                                {dialogState.request.reviewed_at && <p><strong>Reviewed:</strong> {format(new Date(dialogState.request.reviewed_at), 'Pp')}</p>}
                                {dialogState.request.status === 'rejected' && <p><strong>Rejection Reason:</strong> {dialogState.request.rejection_reason || 'N/A'}</p>}
                            </div>
                            {dialogState.request.receipt_url && (
                                <div>
                                    <Label>Payment Receipt</Label>
                                    <a href={dialogState.request.receipt_url} target="_blank" rel="noopener noreferrer" className="block mt-1">
                                        <img src={dialogState.request.receipt_url} alt="Payment Receipt" className="max-w-full h-auto rounded-md border" />
                                    </a>
                                </div>
                            )}
                        </div>
                         <DialogFooter>
                             <Button type="button" variant="outline" onClick={handleCloseDialog}>Close</Button>
                         </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
