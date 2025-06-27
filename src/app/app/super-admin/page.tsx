
import { getSuperAdminDashboardStats, getAnalyticsData, getAllUsersWithDetails, getConversionFunnelData, type UserWithDetails, type ConversionFunnelData } from "@/app/actions/super-admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileText, MessageSquare, Gift, ArrowRight } from "lucide-react";
import { DailyMessagesChart, PlanDistributionChart } from "./analytics-charts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Helper function to calculate conversion rate safely
const calculateConversion = (current: number, previous: number): string => {
    if (previous === 0) return "N/A";
    const rate = (current / previous) * 100;
    // Don't show 100% for the first step
    if (rate === 100) return "100%";
    return `${rate.toFixed(1)}%`;
};

function FunnelStep({ title, count, conversionRate, isFirst = false, isLast = false }: { title: string, count: number, conversionRate: string, isFirst?: boolean, isLast?: boolean }) {
    return (
        <div className="flex items-center gap-4">
            <Card className="flex-1 bg-card/80">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{count}</p>
                    {!isFirst && <p className="text-sm text-muted-foreground">{conversionRate} conversion</p>}
                </CardContent>
            </Card>
            {!isLast && <ArrowRight className="h-8 w-8 text-muted-foreground shrink-0 hidden 2xl:block" />}
        </div>
    )
}

function ConversionFunnel({ data }: { data: ConversionFunnelData }) {
    const funnelSteps = [
        {
            title: "Signed Up",
            count: data.signedUp,
            conversion: "100%",
            isFirst: true,
        },
        {
            title: "Uploaded First PDF",
            count: data.uploadedFirstDoc,
            conversion: calculateConversion(data.uploadedFirstDoc, data.signedUp),
        },
        {
            title: "Started First Chat",
            count: data.startedFirstChat,
            conversion: calculateConversion(data.startedFirstChat, data.uploadedFirstDoc),
        },
        {
            title: "Subscribed to Pro",
            count: data.subscribedToPro,
            conversion: calculateConversion(data.subscribedToPro, data.startedFirstChat),
        }
    ];

    return (
         <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader>
                <CardTitle>User Conversion Funnel</CardTitle>
                <CardDescription>A breakdown of user progression through key actions.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-6">
                    {funnelSteps.map((step, index) => (
                        <FunnelStep 
                            key={step.title} 
                            title={step.title} 
                            count={step.count}
                            conversionRate={step.conversion}
                            isFirst={step.isFirst}
                            isLast={index === funnelSteps.length - 1}
                        />
                    ))}
                </div>
                 {data.signedUp === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No user data available yet to build the funnel.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}


export default async function SuperAdminOverviewPage() {
    const stats = await getSuperAdminDashboardStats();
    const { planChartData, messageChartData } = await getAnalyticsData();
    const allUsers = await getAllUsersWithDetails();
    const topUsers = allUsers.sort((a,b) => b.message_count - a.message_count).slice(0, 5);
    const funnelData = await getConversionFunnelData();

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

            {/* Conversion Funnel */}
            <ConversionFunnel data={funnelData} />


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
