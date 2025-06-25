
import { getActiveWorkspace } from "@/app/actions/workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkspaceSettingsForm } from "./workspace-settings-form";

export default async function AdminSettingsPage() {
    const workspace = await getActiveWorkspace();
    
    return (
        <div className="grid gap-6">
            <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
                <CardHeader>
                    <CardTitle>Workspace Settings</CardTitle>
                    <CardDescription>Update your workspace's name, branding, and limits.</CardDescription>
                </CardHeader>
                <CardContent>
                    <WorkspaceSettingsForm workspace={workspace} />
                </CardContent>
            </Card>
        </div>
    )
}
