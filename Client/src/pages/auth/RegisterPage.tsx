import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '@/store/api/authApi';
import { toast } from 'sonner';
import {
  ThumbsUp, Eye, EyeOff, User, Mail, Lock, Shield, CheckCircle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/common/ThemeToggle';

type PasswordStrength = 0 | 1 | 2 | 3 | 4;

function getPasswordStrength(password: string): PasswordStrength {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength as PasswordStrength;
}

const STRENGTH_CONFIG = [
  { label: '', color: '' },
  { label: 'Weak', color: 'bg-destructive' },
  { label: 'Fair', color: 'bg-warning' },
  { label: 'Good', color: 'bg-chart-2' },
  { label: 'Strong', color: 'bg-success' },
];

const STRENGTH_TEXT_COLOR = ['', 'text-destructive', 'text-warning', 'text-chart-2', 'text-success'];

export function RegisterPage() {
  const navigate = useNavigate();
  const [registerMutation, { isLoading }] = useRegisterMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!acceptTerms) {
      toast.error('Please accept the Terms of Service');
      return;
    }
    try {
      await registerMutation({ name, email, password, role }).unwrap();
      toast.success('Account created! Please check your email to verify.');
      navigate('/login');
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Atmospheric gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-chart-2/15 blur-[120px]" />
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <main className="w-full max-w-[480px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Brand header */}
        <div className="text-center mb-6">
          <h1 className="font-heading text-2xl font-black text-primary flex items-center justify-center gap-2">
            <ThumbsUp className="h-7 w-7" fill="currentColor" />
            ThumbsUp
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Create your professional account</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-7 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative flex items-center">
                <User className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                  minLength={2}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 chars, uppercase, number, special"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Strength meter */}
              {password.length > 0 && (
                <div className="mt-1 space-y-1">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          i <= strength
                            ? STRENGTH_CONFIG[strength]?.color
                            : 'bg-muted-foreground/20'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-[10px] font-mono uppercase tracking-wider ${STRENGTH_TEXT_COLOR[strength]}`}>
                    {STRENGTH_CONFIG[strength]?.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[11px] text-destructive">Passwords do not match</p>
              )}
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Account Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all"
                required
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 py-1">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-input accent-primary cursor-pointer"
                required
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                I agree to the{' '}
                <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
              </label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                'Register Account'
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </div>

        {/* Trust Footer */}
        <footer className="mt-5 text-center">
          <div className="flex justify-center gap-5 mb-2">
            {[
              { icon: <Lock className="h-3.5 w-3.5" />, label: 'Secure Encryption' },
              { icon: <Shield className="h-3.5 w-3.5" />, label: 'ISO 27001 Certified' },
              { icon: <CheckCircle className="h-3.5 w-3.5" />, label: 'GDPR Ready' },
            ].map(({ icon, label }) => (
              <span key={label} className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
                {icon} {label}
              </span>
            ))}
          </div>
          <p className="text-[10px] font-mono text-muted-foreground/40">
            © 2025 ThumbsUp Task Manager. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
