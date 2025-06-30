import { getPaymentGateways } from "@/app/actions/super-admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentGatewaysTable } from "./payment-gateways-table";

export const dynamic = 'force-dynamic';

export default async function SuperAdminPaymentsPage() {
    const gateways = await getPaymentGateways();

    return (
        <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader>
                <CardTitle>Payment Gateways</CardTitle>
                <CardDescription>
                    Manage custom payment methods available to users for upgrades.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <PaymentGatewaysTable gateways={gateways} />
            </CardContent>
        </Card>
    );
}
