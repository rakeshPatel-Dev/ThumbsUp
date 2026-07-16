import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useResetPasswordMutation } from '@/store/api/authApi';
import { toast } from 'sonner';
import { ThumbsUp, Key, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword({ token, newPassword }).unwrap();
      toast.success('Password reset successful. Please log in.');
      navigate('/login');
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message ?? 'Invalid or expired token');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 mix-blend-multiply dark:mix-blend-screen blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-chart-2/20 mix-blend-multiply dark:mix-blend-screen blur-[120px]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 pointer-events-none" />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <main className="w-full max-w-[440px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-card border border-border rounded-2xl overflow-hidden p-8 flex flex-col gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
          <header className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-8 w-8 text-primary" fill="currentColor" />
              <h1 className="font-heading text-2xl font-black tracking-tight text-primary">ThumbsUp</h1>
            </div>
            <p className="text-sm text-muted-foreground">Enter the token from your email</p>
          </header>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="token">Reset Token</Label>
              <div className="relative flex items-center">
                <Key className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="token"
                  placeholder="Paste your reset token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="pl-10 font-mono text-sm tracking-wider"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-12"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full mt-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Resetting...</>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>

          <footer className="flex flex-col items-center gap-4 border-t border-border pt-4">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Login
            </Link>
          </footer>
        </div>
      </main>
    </div>
  );
}
