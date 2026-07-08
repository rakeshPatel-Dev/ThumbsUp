import { useState, useEffect } from 'react';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/store/api/userApi';
import { useChangePasswordMutation } from '@/store/api/authApi';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Lock,
  Loader2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ProfilePage() {
  const { data, isLoading } = useGetProfileQuery({});
  const [updateProfile, { isLoading: updatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (data?.data?.user) {
      const u = data.data.user;
      setName(u.name ?? '');
      setEmail(u.email ?? '');
      setRole(u.role ?? '');
    }
  }, [data]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    try {
      await updateProfile({ name: name.trim() }).unwrap();
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Failed to change password');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your personal settings and security</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Info card left */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 text-center shadow-sm">
            <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-3xl font-black mx-auto">
              {name.charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-3 font-semibold text-foreground text-base leading-snug truncate">{name}</h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{email}</p>
            <span className="inline-flex mt-3 px-2 py-0.5 rounded-full text-xs font-mono font-medium border border-primary/30 bg-primary/10 text-primary capitalize">
              {role}
            </span>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              Account Security
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your account is secured with role-based authorization: <span className="font-semibold capitalize text-foreground">{role}</span> privileges.
            </p>
          </div>
        </div>

        {/* Forms right */}
        <div className="md:col-span-2 space-y-6">
          {/* Update profile Form */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-4">Personal Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="profile-name">Full Name</Label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-10"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 opacity-70">
                <Label htmlFor="profile-email">Email Address</Label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="profile-email"
                    value={email}
                    className="pl-10 h-10 bg-muted/30 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>

              <Button type="submit" disabled={updatingProfile} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {updatingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Information
              </Button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Change Password</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="curr-password">Current Password</Label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="curr-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pl-10 h-10"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 h-10"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="conf-password">Confirm New Password</Label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="conf-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={changingPassword} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
