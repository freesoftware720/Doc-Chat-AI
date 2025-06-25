
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveWorkspace } from "@/app/actions/workspace";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
    const workspace = await getActiveWorkspace();
    const supabase = createClient();

    const { count: documentCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });
        // In a real multi-tenant app, you'd scope this to the workspace
        // .eq('workspace_id', workspace.id);

    const { count: memberCount } = await supabase
        .from('workspace_members')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspace.id);

    return (
        <div>
            <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
                <CardHeader>
                    <CardTitle>Workspace Overview</CardTitle>
                    <CardDescription>A summary of your workspace's current usage.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Workspace Name</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{workspace.name}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Total Documents</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{documentCount ?? 0}</p>
                                <p className="text-xs text-muted-foreground">out of {workspace.max_documents} allowed</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Team Members</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{memberCount ?? 0}</p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
