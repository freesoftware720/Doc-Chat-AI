
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdModal } from '@/hooks/use-ad-modal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, Star, Sparkles, Brain } from 'lucide-react';
import { format } from 'date-fns';
import { UploadHandler } from './upload-handler';
import { DeleteDocumentButton } from './delete-document-button';
import type { Tables } from '@/lib/supabase/database.types';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Document = Tables<'documents'>;

interface UploadsClientPageProps {
  documents: Document[];
  uploadLimitMb: number;
  isPro: boolean;
  isStudent: boolean;
  multiDocEnabled: boolean;
}

export function UploadsClientPage({ documents, uploadLimitMb, isPro, isStudent, multiDocEnabled }: UploadsClientPageProps) {
    const { showAd } = useAdModal();
    const router = useRouter();
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    
    const handleSelectDoc = (docId: string) => {
        setSelectedDocs(prev => 
            prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedDocs(documents.map(d => d.id));
        } else {
            setSelectedDocs([]);
        }
    };
    
    const isAllSelected = documents.length > 0 && selectedDocs.length === documents.length;

    const handleChatClick = (docId: string) => {
        showAd(() => {
            const path = isStudent ? `/app/student/${docId}` : `/app/chat/${docId}`;
            router.push(path);
        });
    };

    const handleMultiChatClick = () => {
        if (!isPro || !multiDocEnabled || selectedDocs.length < 2) return;
        const ids = selectedDocs.join(',');
        showAd(() => {
             router.push(`/app/chat/multi?ids=${ids}`);
        });
    }

    const tableRows = documents.map((doc) => (
        <TableRow key={doc.id} data-state={selectedDocs.includes(doc.id) ? "selected" : ""}>
            <TableCell className="w-12">
                <Checkbox
                    checked={selectedDocs.includes(doc.id)}
                    onCheckedChange={() => handleSelectDoc(doc.id)}
                    aria-label={`Select document ${doc.name}`}
                />
            </TableCell>
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
                        {isStudent ? (
                            <>
                                <Brain className="h-4 w-4 mr-2" />
                                Study
                            </>
                        ) : (
                            <>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Chat
                            </>
                        )}
                    </Button>
                    <DeleteDocumentButton documentId={doc.id} />
                </div>
            </TableCell>
        </TableRow>
    ));

    return (
      <div className="p-4 md:p-6 space-y-6">
        <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold font-headline">My Uploads</h1>
            <p className="text-muted-foreground mt-1">Manage your uploaded documents here.</p>
        </header>

        <UploadHandler uploadLimitMb={uploadLimitMb} />
        
        <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                     <div>
                        <CardTitle>{selectedDocs.length > 0 ? `${selectedDocs.length} Document${selectedDocs.length > 1 ? 's' : ''} Selected` : 'Document List'}</CardTitle>
                        <CardDescription>
                            You have uploaded {documents.length} document(s).
                        </CardDescription>
                    </div>
                    {multiDocEnabled && selectedDocs.length > 1 && (
                        isPro ? (
                             <Button onClick={handleMultiChatClick}>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Chat with Selected
                            </Button>
                        ) : (
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button disabled>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Chat with Selected
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-400" /> This is a Pro feature</p>
                                    </TooltipContent>
                                </Tooltip>
                             </TooltipProvider>
                        )
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {documents.length > 0 ? (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                         <Checkbox
                                            checked={isAllSelected}
                                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                            aria-label="Select all documents"
                                        />
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Uploaded On</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tableRows}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Documents Uploaded</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Upload your first document to start chatting with it.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    );
  }
