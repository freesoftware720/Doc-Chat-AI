
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllTicketsForAdmin } from "@/app/actions/support";
import { SupportTicketsTable } from "./support-tickets-table";

export const dynamic = 'force-dynamic';

export default async function SuperAdminSupportPage() {
    const tickets = await getAllTicketsForAdmin();

    return (
         <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>
                    Manage and respond to user support requests.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <SupportTicketsTable tickets={tickets} />
            </CardContent>
        </Card>
    );
}
