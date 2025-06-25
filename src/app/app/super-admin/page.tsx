
import { getSuperAdminDashboardStats } from "@/app/actions/super-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, MessageSquare, Briefcase } from "lucide-react";

export default async function SuperAdminOverviewPage() {
    const stats = await getSuperAdminDashboardStats();
    
    const statCards = [
        { title: "Total Users", value: stats.users, icon: <Users className="h-6 w-6 text-primary" /> },
        { title: "Total Documents", value: stats.documents, icon: <FileText className="h-6 w-6 text-primary" /> },
        { title: "Total Messages", value: stats.messages, icon: <MessageSquare className="h-6 w-6 text-primary" /> },
        { title: "Total Workspaces", value: stats.workspaces, icon: <Briefcase className="h-6 w-6 text-primary" /> },
    ];

    return (
        <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
                <p className="text-muted-foreground text-sm">A high-level summary of application-wide usage.</p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map(card => (
                        <Card key={card.title}>
                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                {card.icon}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
