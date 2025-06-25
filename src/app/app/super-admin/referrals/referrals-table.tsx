
"use client";

import { format } from "date-fns";
import type { ReferralWithDetails } from "@/app/actions/super-admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Referral = ReferralWithDetails;

export function ReferralsTable({ referrals }: { referrals: Referral[] }) {
    
    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Referrer</TableHead>
                        <TableHead>Referred User</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {referrals.map((ref, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <div className="font-medium">{ref.referrer_name || 'N/A'}</div>
                                <div className="text-xs text-muted-foreground">{ref.referrer_email}</div>
                            </TableCell>
                             <TableCell>
                                <div className="font-medium">{ref.referred_name || 'N/A'}</div>
                                <div className="text-xs text-muted-foreground">{ref.referred_email}</div>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground text-sm">
                                {format(new Date(ref.created_at), 'Pp')}
                            </TableCell>
                        </TableRow>
                    ))}
                    {referrals.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                No referrals have been recorded yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
