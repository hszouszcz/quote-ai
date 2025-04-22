import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({ size = 24, className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className="animate-spin text-primary" style={{ width: size, height: size }} />
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm z-50">
      <LoadingSpinner size={32} />
    </div>
  );
}

export function LoadingContainer({ children, isLoading }: { children: React.ReactNode; isLoading: boolean }) {
  return (
    <div className="relative">
      {children}
      {isLoading && <LoadingOverlay />}
    </div>
  );
}
