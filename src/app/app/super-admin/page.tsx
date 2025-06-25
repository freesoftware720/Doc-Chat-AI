
import { getSuperAdminDashboardStats, getAnalyticsData, getAllUsersWithDetails, type UserWithDetails } from "@/app/actions/super-admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileText, MessageSquare, Gift, LineChart, PieChart } from "lucide-react";
import { DailyMessagesChart, PlanDistributionChart } from "./analytics-charts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function SuperAdminOverviewPage() {
    const stats = await getSuperAdminDashboardStats();
    const { planChartData, messageChartData } = await getAnalyticsData();
    const allUsers = await getAllUsersWithDetails();
    const topUsers = allUsers.sort((a,b) => b.message_count - a.message_count).slice(0, 5);

    const statCards = [
        { title: "Total Users", value: stats.users, icon: <Users className="h-6 w-6 text-primary" /> },
        { title: "Total Documents", value: stats.documents, icon: <FileText className="h-6 w-6 text-primary" /> },
        { title: "Total Messages", value: stats.messages, icon: <MessageSquare className="h-6 w-6 text-primary" /> },
        { title: "Successful Referrals", value: stats.referrals, icon: <Gift className="h-6 w-6 text-primary" /> },
    ];

    return (
        <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(card => (
                    <Card key={card.title} className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
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

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <DailyMessagesChart data={messageChartData} />
                </div>
                <div className="lg:col-span-1">
                    <PlanDistributionChart data={planChartData} />
                </div>
            </div>

            {/* Top Users List */}
            <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
                <CardHeader>
                    <CardTitle>Most Active Users</CardTitle>
                    <CardDescription>Users with the highest message count.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {topUsers.map(user => (
                            <li key={user.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarFallback>{user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{user.full_name || 'N/A'}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                                <p className="font-bold text-lg">{user.message_count} <span className="text-sm font-normal text-muted-foreground">messages</span></p>
                            </li>
                        ))}
                         {topUsers.length === 0 && (
                            <p className="text-muted-foreground text-center py-4">No user activity yet.</p>
                        )}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
