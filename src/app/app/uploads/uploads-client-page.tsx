
"use client";

import { useRouter } from 'next/navigation';
import { useAdModal } from '@/hooks/use-ad-modal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { UploadHandler } from './upload-handler';
import { DeleteDocumentButton } from './delete-document-button';
import type { Tables } from '@/lib/supabase/database.types';

type Document = Tables<'documents'>;

interface UploadsClientPageProps {
  documents: Document[];
  uploadLimitMb: number;
}

export function UploadsClientPage({ documents, uploadLimitMb }: UploadsClientPageProps) {
    const { showAd } = useAdModal();
    const router = useRouter();

    const handleChatClick = (docId: string) => {
        showAd(() => {
            router.push(`/app/chat/${docId}`);
        });
    };

    return (
      <div className="p-4 md:p-6 space-y-6">
        <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold font-headline">My Uploads</h1>
            <p className="text-muted-foreground mt-1">Manage your uploaded documents here.</p>
        </header>

        <UploadHandler uploadLimitMb={uploadLimitMb} />
        
        <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader>
                <CardTitle>Document List</CardTitle>
                <CardDescription>
                    You have uploaded {documents.length} document(s).
                </CardDescription>
            </CardHeader>
            <CardContent>
                {documents.length > 0 ? (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Uploaded On</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.map(doc => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-primary" />
                                                <span className="truncate">{doc.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {format(new Date(doc.created_at), 'PPP')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleChatClick(doc.id)}>
                                                    <MessageSquare className="h-4 w-4 mr-2" />
                                                    Chat
                                                </Button>
                                                <DeleteDocumentButton documentId={doc.id} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Documents Uploaded</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Upload your first PDF to start chatting with it.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    );
  }
