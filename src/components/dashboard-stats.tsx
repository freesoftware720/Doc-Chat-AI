
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/app/actions/profile";
import { FileText, MessageSquare, Star } from "lucide-react";

export async function DashboardStats() {
  const { documents, chats, plan } = await getDashboardStats();

  const stats = [
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "Total PDFs",
      value: documents,
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      title: "Conversations",
      value: chats,
    },
    {
      icon: <Star className="h-6 w-6 text-primary" />,
      title: "Subscription",
      value: plan,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
