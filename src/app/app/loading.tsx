import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function AppLoading() {
  return (
    <div className="p-4 md:p-6 space-y-6 h-full flex flex-col">
      {/* Skeleton for DashboardStats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-6 rounded-sm" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skeleton for RecentUploads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
         <div className="lg:col-span-1 space-y-6 flex flex-col">
            <div className="relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-2xl bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-48 mt-4" />
                <Skeleton className="h-4 w-32 mt-2" />
            </div>
         </div>
         <div className="lg:col-span-2 h-full min-h-0">
            <Card className="h-full bg-card/60 backdrop-blur-md border-white/10 shadow-lg flex flex-col">
                <CardHeader>
                    <Skeleton className="h-6 w-56" />
                    <Skeleton className="h-4 w-80 mt-2" />
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden flex flex-col justify-center">
                    <div className="text-center p-8">
                        <FileText size={48} className="text-muted-foreground/30 mb-4 mx-auto" />
                        <Skeleton className="h-6 w-40 mx-auto" />
                        <Skeleton className="h-4 w-64 mx-auto mt-3" />
                    </div>
                </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
