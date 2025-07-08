
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart as RechartsPieChart, Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, PieSector, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { format } from 'date-fns';

// --- Plan Distribution Chart ---
const planChartConfig = {
    value: { label: "Users" },
    Basic: { label: "Basic", color: "hsl(var(--chart-1))" },
    Pro: { label: "Pro", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export function PlanDistributionChart({ data }: { data: { name: string; value: number; fill: string }[] }) {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
                <CardDescription>A breakdown of users by their subscription plan.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer config={planChartConfig} className="mx-auto aspect-square max-h-[300px]">
                    <RechartsPieChart>
                         <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                         />
                        <RechartsPieChart
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                             ))}
                        </RechartsPieChart>
                         <ChartLegend
                            content={<ChartLegendContent nameKey="name" />}
                            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                        />
                    </RechartsPieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

// --- Daily Messages Chart ---
const dailyMessagesConfig = {
    Messages: { label: "Messages", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

export function DailyMessagesChart({ data }: { data: { date: string; Messages: number }[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Daily Messages</CardTitle>
                <CardDescription>Total messages sent across the platform in the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={dailyMessagesConfig} className="h-[250px] w-full">
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => format(new Date(value), "MMM d")}
                        />
                         <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Line
                            dataKey="Messages"
                            type="monotone"
                            stroke="var(--color-Messages)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
