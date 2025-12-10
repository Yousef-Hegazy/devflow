import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader className="animate-spin text-primary" size={48} />
        <p className="text-muted-foreground">Loading Dev Overflow...</p>
      </div>
    </div>
  );
}