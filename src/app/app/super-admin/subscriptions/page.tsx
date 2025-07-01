
import { getSubscriptionRequests } from "@/app/actions/super-admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionsTable } from "./subscriptions-table";

export const dynamic = 'force-dynamic';

export default async function SuperAdminSubscriptionsPage() {
    const requests = await getSubscriptionRequests();

    return (
        <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader>
                <CardTitle>Subscription Requests</CardTitle>
                <CardDescription>
                    Review and approve or reject user subscription requests.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <SubscriptionsTable requests={requests} />
            </CardContent>
        </Card>
    );
}
