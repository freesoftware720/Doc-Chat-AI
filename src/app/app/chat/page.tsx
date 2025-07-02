
import { getChatHistory } from '@/app/actions/chat';
import { ChatHistoryClientPage } from './chat-history-client';

export default async function ChatHistoryPage() {
    const history = await getChatHistory();

    return <ChatHistoryClientPage history={history} />
  }
