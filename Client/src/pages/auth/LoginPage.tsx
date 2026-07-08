import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { toast } from 'sonner';
import { ThumbsUp, Eye, EyeOff, Mail, Lock, Shield, Zap, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginMutation, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await loginMutation({ email, password }).unwrap();
      const { user, accessToken } = result.data;
      dispatch(setCredentials({ user, token: accessToken }));
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message ?? 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Atmospheric gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 mix-blend-multiply dark:mix-blend-screen blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-chart-2/20 mix-blend-multiply dark:mix-blend-screen blur-[120px]" />
      </div>

      {/* Diagonal background mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 pointer-events-none" />

      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <main className="w-full max-w-[440px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden p-8 flex flex-col gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
          {/* Logo */}
          <header className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-8 w-8 text-primary" fill="currentColor" />
              <h1 className="font-heading text-2xl font-black tracking-tight text-primary">
                ThumbsUp
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">Log in to your workspace</p>
          </header>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline transition-all"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-12"
                  required
                  autoComplete="current-password"
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

            {/* Submit */}
            <Button
              type="submit"
              className="w-full mt-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Logging in...
                </>
              ) : (
                'Log In'
              )}
            </Button>
          </form>

          {/* Footer */}
          <footer className="flex flex-col items-center gap-4 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Sign Up
              </Link>
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

        {/* Trust indicators */}
        <div className="mt-6 flex justify-center gap-8 text-white/40 dark:text-white/25">
          {[
            { icon: <Shield className="h-6 w-6" />, label: 'Secure Cloud' },
            { icon: <Zap className="h-6 w-6" />, label: 'Fast Sync' },
            { icon: <CheckCircle className="h-6 w-6" />, label: 'Enterprise Ready' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-primary/40">{icon}</span>
              <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
