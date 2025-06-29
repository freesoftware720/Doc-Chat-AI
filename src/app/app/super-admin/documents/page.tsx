
import { getAllDocumentsWithDetails } from "@/app/actions/super-admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentsTable } from "./documents-table";

export const dynamic = 'force-dynamic';

export default async function SuperAdminDocumentsPage() {
    const documents = await getAllDocumentsWithDetails();

    return (
        <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader>
                <CardTitle>Document Management</CardTitle>
                <CardDescription>
                    View and manage all documents across the platform.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DocumentsTable documents={documents} />
            </CardContent>
        </Card>
    );
}
