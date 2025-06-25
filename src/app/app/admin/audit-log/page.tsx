
import { getAuditLogs } from "@/app/actions/workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function AuditLogPage() {
    const logs = await getAuditLogs();
    
    const getActionVariant = (action: string) => {
        if (action.includes('success')) return 'default';
        if (action.includes('failed')) return 'destructive';
        if (action.includes('view')) return 'secondary';
        return 'outline';
    };

    return (
        <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader>
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>
                    A record of important events that have occurred in your workspace.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Action</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead className="text-right">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <Badge variant={getActionVariant(log.action)}>{log.action}</Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{log.user_email}</TableCell>
                                    <TableCell>
                                        <pre className="text-xs bg-muted p-1 rounded-md overflow-x-auto">
                                            <code>
                                                {log.details ? JSON.stringify(log.details, null, 2) : 'N/A'}
                                            </code>
                                        </pre>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground text-xs">
                                        {format(new Date(log.created_at), 'Pp')}
                                    </TableCell>
                                </TableRow>
                            ))}
                             {logs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No audit events recorded yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
