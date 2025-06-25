
import { getAppSettings } from "@/app/actions/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppSettingsForm } from "./app-settings-form";

export const dynamic = 'force-dynamic';

export default async function SuperAdminAppSettingsPage() {
    const settings = await getAppSettings();

    return (
        <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>
                    Manage global settings for the entire application. These changes will affect all users.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AppSettingsForm settings={settings} />
            </CardContent>
        </Card>
    )
}

    