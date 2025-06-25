
import { getAllReferralDetails } from "@/app/actions/super-admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReferralsTable } from "./referrals-table";

export const dynamic = 'force-dynamic';

export default async function SuperAdminReferralsPage() {
    const referrals = await getAllReferralDetails();

    return (
        <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader>
                <CardTitle>Referral Management</CardTitle>
                <CardDescription>
                    View all successful referrals across the platform.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ReferralsTable referrals={referrals} />
            </CardContent>
        </Card>
    )
}
