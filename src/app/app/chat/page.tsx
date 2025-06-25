
import Link from 'next/link';
import { getChatHistory } from '@/app/actions/chat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function ChatHistoryPage() {
    const history = await getChatHistory();

    return (
      <div className="p-4 md:p-6">
        <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold font-headline">Chat History</h1>
            <p className="text-muted-foreground mt-1">Review your past conversations here.</p>
        </header>

        <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader>
                <CardTitle>Your Conversations</CardTitle>
                <CardDescription>
                    Select a conversation to pick up where you left off.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {history.length > 0 ? (
                    <ul className="space-y-3">
                        {history.map(session => (
                            <li key={session.document_id}>
                                <Link href={`/app/chat/${session.document_id}`}>
                                    <div className="flex items-center justify-between p-4 rounded-lg transition-colors hover:bg-muted/50 border">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold truncate">{session.document_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Last message {formatDistanceToNow(new Date(session.last_message_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Continue Chat
                                            <MessageSquare className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-12">
                        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Conversations Yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Upload a document and start a chat to see your history here.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/app/uploads">Upload Document</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    );
  }
