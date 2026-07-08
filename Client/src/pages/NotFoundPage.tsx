import { Link } from 'react-router-dom';
import { ThumbsUp, Home, ArrowLeft, Search } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="text-center max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <ThumbsUp className="h-7 w-7 text-primary" fill="currentColor" />
          <span className="font-heading text-xl font-bold text-primary">ThumbsUp</span>
        </div>

        {/* 404 Display */}
        <div className="relative mb-6">
          <p className="font-heading text-[120px] font-black text-muted/30 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-16 w-16 text-muted-foreground/40" />
          </div>
        </div>

        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
          Page Not Found
        </h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Double-check the URL or head back to the dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/dashboard" className={cn(buttonVariants({ variant: 'default' }), "bg-primary hover:bg-primary/90 text-primary-foreground")}>
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Help links */}
        <div className="flex justify-center gap-5 mt-8 text-[11px] font-mono text-muted-foreground/50 uppercase tracking-widest">
          <a href="#" className="hover:text-primary transition-colors">Help</a>
          <span>·</span>
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <span>·</span>
          <a href="#" className="hover:text-primary transition-colors">Status</a>
        </div>
      </div>
    </div>
  );
}
