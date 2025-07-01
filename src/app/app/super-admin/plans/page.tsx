
import { getAllPlans } from "@/app/actions/super-admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlansTable } from "./plans-table";

export const dynamic = 'force-dynamic';

export default async function SuperAdminPlansPage() {
    const plans = await getAllPlans();

    return (
        <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader>
                <CardTitle>Billing Plan Management</CardTitle>
                <CardDescription>
                    Create, edit, and manage the subscription plans available to users.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <PlansTable plans={plans} />
            </CardContent>
        </Card>
    );
}
