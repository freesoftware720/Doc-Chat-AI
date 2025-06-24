import { Loader } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
