
import { redirect } from 'next/navigation';
import { DashboardStats } from "@/components/dashboard-stats";
import { getDocuments } from '@/app/actions/documents';
import { RecentUploads } from '@/components/recent-uploads';

export default async function AppPage() {
  const recentDocuments = await getDocuments();

  const handleGetStarted = async () => {
    'use server';
    // Find the first document to start a chat with
    const documents = await getDocuments();
    if (documents.length > 0) {
      redirect(`/app/chat/${documents[0].id}`);
    } else {
      // If no documents, stay on the page (the UI will prompt to upload)
      // This could also redirect to /app/uploads
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 h-full flex flex-col">
      <DashboardStats />
      <RecentUploads 
        documents={recentDocuments} 
        getStartedAction={handleGetStarted}
      />
    </div>
  );
}
