import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, LogIn, LayoutDashboard, ArrowRight, Sparkles, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';

interface EmailVerificationSuccessProps {
  email?: string;
  name?: string;
}

const EmailVerificationSuccess: React.FC<EmailVerificationSuccessProps> = ({
  email = 'your email',
  name = 'User'
}) => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Atmospheric gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 mix-blend-multiply dark:mix-blend-screen blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-chart-2/20 mix-blend-multiply dark:mix-blend-screen blur-[120px]" />
      </div>

      {/* Diagonal background mesh */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-chart-2/5 pointer-events-none" />

      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <main
        className={`w-full max-w-110 relative z-10 transition-all duration-500 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden p-8 flex flex-col gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
          {/* Logo */}
          <header className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-8 w-8 text-primary" fill="currentColor" />
              <h1 className="font-heading text-2xl font-black tracking-tight text-primary">
                ThumbsUp
              </h1>
            </div>
          </header>

          {/* Verified icon */}
          <div className="flex justify-center">
            <div className="bg-primary/10 rounded-full p-4">
              <CheckCircle className="h-16 w-16 text-primary" strokeWidth={1.5} />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-1">
            <h2 className="font-heading text-2xl font-bold text-foreground flex items-center justify-center gap-2">
              Email Verified!
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </h2>
            <p className="text-muted-foreground">
              Hi <span className="font-semibold text-foreground">{name}</span>,
            </p>
            <p className="text-muted-foreground">
              Your email{' '}
              <span className="font-medium text-primary">{email}</span> has been
              successfully verified.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Info Message */}
          <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <LogIn className="h-4 w-4" />
              Your account is now active. Please login to continue.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full font-semibold h-11 gap-2"
              onClick={() => navigate('/login')}
            >
              <LogIn className="h-4 w-4" />
              Login to Your Account
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="w-full font-semibold h-11 gap-2"
              onClick={() => navigate('/dashboard')}
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>

          {/* Footer */}
          <footer className="flex flex-col items-center gap-4 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              Need help?{' '}
              <a href="/support" className="text-primary font-medium hover:underline">
                Contact Support
              </a>
            </p>
            <div className="flex gap-5 items-center text-muted-foreground/50">
              <a href="#" className="text-[10px] font-mono uppercase tracking-widest hover:text-primary transition-colors">Privacy</a>
              <span className="w-1 h-1 rounded-full bg-current" />
              <a href="#" className="text-[10px] font-mono uppercase tracking-widest hover:text-primary transition-colors">Terms</a>
              <span className="w-1 h-1 rounded-full bg-current" />
              <a href="#" className="text-[10px] font-mono uppercase tracking-widest hover:text-primary transition-colors">Support</a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default EmailVerificationSuccess;