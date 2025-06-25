
import { getAllUsersWithDetails } from "@/app/actions/super-admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersTable } from "./users-table";

export const dynamic = 'force-dynamic';

export default async function SuperAdminUsersPage() {
    const users = await getAllUsersWithDetails();

    return (
        <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                    View and manage all users across the platform.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <UsersTable users={users} />
            </CardContent>
        </Card>
    )
}
