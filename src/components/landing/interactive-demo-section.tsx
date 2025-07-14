import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, MessageSquare, Settings, MousePointer2 } from "lucide-react"

// --- Mock Sidebar ---
function MockSidebar() {
    const sidebarItems = [
        { id: "sidebar-btn-dashboard", icon: LayoutDashboard, label: "Dashboard", active: true },
        { id: "sidebar-btn-docs", icon: FileText, label: "My Documents" },
        { id: "sidebar-btn-history", icon: MessageSquare, label: "Chat History" },
        { id: "sidebar-btn-settings", icon: Settings, label: "Settings" },
    ]
    return (
        <div className="w-56 bg-sidebar/50 p-3 rounded-l-xl border-r border-border/10 flex flex-col">
            <div className="mb-6 px-2">
                <h2 className="text-lg font-semibold text-white">Doc-Chat AI</h2>
            </div>
            <div className="space-y-2">
                {sidebarItems.map(item => (
                     <button
                        key={item.id}
                        id={item.id}
                        className={cn(
                            "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all border border-transparent",
                            item.active && "font-medium border-primary/40 bg-primary/20 text-primary dark:text-white [text-shadow:0_0_8px_hsl(var(--primary))] dark:[text-shadow:0_0_8px_white]"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

// --- Mock Dashboard View ---
function DashboardView() {
    return (
        <div id="view-dashboard" className="absolute inset-0 p-6 space-y-6">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <div className="grid grid-cols-3 gap-4">
                <Card><CardHeader><CardTitle className="text-sm font-medium">Total Docs</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">12</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm font-medium">Chats</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">34</p></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-sm font-medium">Plan</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">Pro</p></CardContent></Card>
            </div>
        </div>
    )
}

// --- Mock Documents View ---
function DocumentsView() {
    return (
        <div id="view-docs" className="absolute inset-0 p-6 space-y-6 opacity-0">
            <h1 className="text-2xl font-bold text-white">My Documents</h1>
             <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                <TableBody>
                    <TableRow><TableCell>Q3-Financials.pdf</TableCell><TableCell>2 days ago</TableCell></TableRow>
                    <TableRow><TableCell>Project-Proposal.pdf</TableCell><TableCell>1 week ago</TableCell></TableRow>
                    <TableRow><TableCell>Onboarding-Guide.pdf</TableCell><TableCell>3 weeks ago</TableCell></TableRow>
                </TableBody>
            </Table>
        </div>
    )
}

// --- Mock History View ---
function HistoryView() {
    return (
        <div id="view-history" className="absolute inset-0 p-6 space-y-4 opacity-0">
             <h1 className="text-2xl font-bold text-white">Chat History</h1>
            <div className="space-y-3">
                 <Card><CardContent className="p-3">Chat about Q3-Financials.pdf</CardContent></Card>
                 <Card><CardContent className="p-3">Conversation on Project-Proposal.pdf</CardContent></Card>
            </div>
        </div>
    )
}

// --- Mock Settings View ---
function SettingsView() {
    return (
        <div id="view-settings" className="absolute inset-0 p-6 space-y-6 opacity-0">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>Manage your account settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between"><p>Dark Mode</p><Switch defaultChecked/></div>
                    <div className="flex items-center justify-between"><p>Notifications</p><Switch /></div>
                </CardContent>
            </Card>
        </div>
    )
}

// --- Main Interactive Demo Component ---
export function InteractiveDemoSection() {
    return (
        <section id="interactive-demo" className="py-20 md:py-32">
            <div className="container mx-auto px-4 text-center">
                 <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Experience it Live</h2>
                 <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Scroll to see Doc-Chat AI in action. Watch how easily you can navigate and interact with your dashboard.
                 </p>
            </div>
            <div className="relative h-[600px] md:h-[700px] mt-12">
                 {/* This div is the main container for the pinned animation */}
                 <div id="demo-browser-frame" className="w-[90vw] max-w-4xl h-[550px] mx-auto bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-primary/10 relative overflow-hidden">
                    {/* Browser Header */}
                    <div className="h-10 bg-zinc-800/50 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    {/* Dashboard Content */}
                    <div className="flex h-[calc(100%-2.5rem)]">
                        <MockSidebar />
                        <div className="flex-1 bg-background/50 relative">
                            <DashboardView />
                            <DocumentsView />
                            <HistoryView />
                            <SettingsView />
                        </div>
                    </div>
                     {/* Animated Cursor */}
                    <div id="demo-cursor" className="absolute top-20 left-40 opacity-0 hidden md:block">
                        <MousePointer2 className="h-6 w-6 text-primary drop-shadow-[0_0_5px_hsl(var(--primary))]" />
                    </div>
                 </div>
            </div>
            <div className="text-center mt-12">
                <Button size="lg" asChild>
                    <a href="/auth/register">Try the Real Dashboard</a>
                </Button>
            </div>
        </section>
    );
}
