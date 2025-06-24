import { FileText, MoreVertical, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import type { Document } from '@/app/app/page';

interface PdfListProps {
  files: Document[];
  selectedFile: Document | null;
  onSelectFile: (file: Document) => void;
  onDeleteFile: (documentId: string) => void;
}

export function PdfList({ files, selectedFile, onSelectFile, onDeleteFile }: PdfListProps) {
  return (
    <Card className="h-full bg-card/60 backdrop-blur-md border-white/10 shadow-lg flex flex-col">
      <CardHeader>
        <CardTitle>Uploaded Documents</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {files.length === 0 ? (
            <p className="text-muted-foreground text-sm p-4 text-center">No documents uploaded yet.</p>
          ) : (
            <ul className="space-y-2 pr-4">
              {files.map((file) => (
                <li
                  key={file.id}
                  className={cn(
                    'flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors',
                    selectedFile?.id === file.id
                      ? 'bg-primary/20'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <button
                    onClick={() => onSelectFile(file)}
                    className="flex items-center gap-3 flex-1 text-left overflow-hidden"
                  >
                    <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className="truncate flex-1 font-medium">{file.name}</span>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onDeleteFile(file.id)}
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
