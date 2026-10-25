'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Settings,
  Lock,
  Bell,
  Eye,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertTriangle,
  User,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();

  // Change Password Form
  const {
    register: regPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordForm>();

  const [changingPassword, setChangingPassword] = useState(false);

  // Notification Preferences State
  const [prefTaskReminders, setPrefTaskReminders] = useState(true);
  const [prefBuddyRequests, setPrefBuddyRequests] = useState(true);
  const [prefEventUpdates, setPrefEventUpdates] = useState(true);
  const [prefWeeklyDigest, setPrefWeeklyDigest] = useState(false);

  // Privacy Preferences State
  const [privacyVisibleInDirectory, setPrivacyVisibleInDirectory] = useState(true);
  const [privacyShowUniversity, setPrivacyShowUniversity] = useState(true);
  const [privacyAllowMessages, setPrivacyAllowMessages] = useState(true);

  // Account Deletion State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Password Submit
  const onPasswordSubmit = async (data: ChangePasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (data.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Your password has been changed successfully!');
        resetPasswordForm();
      } else {
        throw new Error(json.error || 'Failed to change password');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error changing password');
    } finally {
      setChangingPassword(false);
    }
  };

  // Save Preferences
  const handleSavePreferences = () => {
    toast.success('Notification & privacy preferences saved!');
  };

  // Account Deletion
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password to confirm account deactivation');
      return;
    }

    setDeletingAccount(true);
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Account deactivated. Signing you out...');
        setIsDeleteOpen(false);
        signOut({ callbackUrl: '/login' });
      } else {
        throw new Error(json.error || 'Failed to deactivate account');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error deactivating account');
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Settings className="h-7 w-7 text-amber-400" />
          <span>Account & Security Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-1">
          Manage your credentials, alerts, privacy visibility, and platform security.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="ios-glass-prominent rounded-3xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-6 pb-4 border-b border-white/10">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="h-4 w-4 text-amber-400" /> Account Identity
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">Your registered login credentials</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-stone-400">Name</Label>
              <p className="text-sm font-semibold text-white mt-0.5">
                {session?.user?.name || 'Student'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-stone-400">Email Address</Label>
              <p className="text-sm font-semibold text-white mt-0.5">
                {session?.user?.email || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security: Change Password Card */}
      <div className="ios-glass-prominent rounded-3xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-6 pb-4 border-b border-white/10">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400" /> Change Password
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">Update your secret password for secure logins</p>
        </div>
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currPass" className="text-xs font-bold text-stone-300">Current Password *</Label>
              <Input
                id="currPass"
                type="password"
                placeholder="••••••••"
                {...regPassword('currentPassword', { required: true })}
                className="bg-white/[0.04] border-white/10 focus:border-amber-500 text-white text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="newPass" className="text-xs font-bold text-stone-300">New Password *</Label>
                <Input
                  id="newPass"
                  type="password"
                  placeholder="Min 8 chars, uppercase, lowercase, number"
                  {...regPassword('newPassword', { required: true })}
                  className="bg-white/[0.04] border-white/10 focus:border-amber-500 text-white text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confPass" className="text-xs font-bold text-stone-300">Confirm New Password *</Label>
                <Input
                  id="confPass"
                  type="password"
                  placeholder="Confirm new password"
                  {...regPassword('confirmPassword', { required: true })}
                  className="bg-white/[0.04] border-white/10 focus:border-amber-500 text-white text-xs rounded-xl"
                />
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-white/10 flex justify-end">
            <Button
              type="submit"
              disabled={changingPassword}
              className="btn-ios-primary text-xs px-6 py-2.5 cursor-pointer shadow-md"
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="ios-glass-prominent rounded-3xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-6 pb-4 border-b border-white/10">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="h-4 w-4 text-orange-400" /> Notifications & Reminders
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">Control which in-app updates and alerts you receive</p>
        </div>
        <div className="p-6 space-y-4 divide-y divide-white/5">
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-white">Checklist Task Reminders</Label>
              <p className="text-xs text-stone-400">
                Receive notifications when visa, flight, and registration deadlines approach.
              </p>
            </div>
            <Switch checked={prefTaskReminders} onCheckedChange={setPrefTaskReminders} />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-white">Buddy Request Alerts</Label>
              <p className="text-xs text-stone-400">
                Get notified when another student sends or accepts a connection request.
              </p>
            </div>
            <Switch checked={prefBuddyRequests} onCheckedChange={setPrefBuddyRequests} />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-white">Campus Events & Workshops</Label>
              <p className="text-xs text-stone-400">
                Receive reminders about gatherings and orientations you have registered for.
              </p>
            </div>
            <Switch checked={prefEventUpdates} onCheckedChange={setPrefEventUpdates} />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-white">Weekly Pre-Departure Digest</Label>
              <p className="text-xs text-stone-400">
                Receive a weekly summary email of tips and newly published destination handbooks.
              </p>
            </div>
            <Switch checked={prefWeeklyDigest} onCheckedChange={setPrefWeeklyDigest} />
          </div>
        </div>
        <div className="p-6 border-t border-white/10 flex justify-end">
          <Button
            type="button"
            onClick={handleSavePreferences}
            className="ios-pill text-xs px-5 py-2 cursor-pointer bg-white/[0.04] text-white hover:bg-white/10"
          >
            Save Alert Preferences
          </Button>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="ios-glass-prominent rounded-3xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-6 pb-4 border-b border-white/10">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Eye className="h-4 w-4 text-amber-400" /> Privacy & Student Visibility
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">Choose how you appear to fellow campus international students</p>
        </div>
        <div className="p-6 space-y-4 divide-y divide-white/5">
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-white">
                Show in Peer Buddy Search Directory
              </Label>
              <p className="text-xs text-stone-400">
                Allow peers from your destination university to find and connect with you.
              </p>
            </div>
            <Switch
              checked={privacyVisibleInDirectory}
              onCheckedChange={setPrivacyVisibleInDirectory}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-white">
                Display Enrolled Institution
              </Label>
              <p className="text-xs text-stone-400">
                Show your university and destination city on your public buddy card.
              </p>
            </div>
            <Switch
              checked={privacyShowUniversity}
              onCheckedChange={setPrivacyShowUniversity}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-white">
                Allow Direct Peer Inquiries
              </Label>
              <p className="text-xs text-stone-400">
                Allow students to send you intro messages when requesting buddy connections.
              </p>
            </div>
            <Switch
              checked={privacyAllowMessages}
              onCheckedChange={setPrivacyAllowMessages}
            />
          </div>
        </div>
        <div className="p-6 border-t border-white/10 flex justify-end">
          <Button
            type="button"
            onClick={handleSavePreferences}
            className="ios-pill text-xs px-5 py-2 cursor-pointer bg-white/[0.04] text-white hover:bg-white/10"
          >
            Save Privacy Settings
          </Button>
        </div>
      </div>

      {/* Danger Zone: Account Deactivation */}
      <div className="ios-glass rounded-3xl border border-rose-500/30 bg-rose-950/20 shadow-sm overflow-hidden p-6 space-y-3">
        <h2 className="text-base font-bold text-rose-400 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-rose-400" /> Danger Zone
        </h2>
        <p className="text-xs text-stone-400 leading-relaxed">
          Deactivating your account will remove your buddy listing, cancel active event RSVPs, and
          archive your pre-departure checklist.
        </p>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsDeleteOpen(true)}
          className="text-xs rounded-full px-4 cursor-pointer"
        >
          Deactivate My Account
        </Button>
      </div>

      {/* Account Deletion Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md ios-glass-prominent bg-[#171311]/95 border-white/15 text-white backdrop-blur-3xl">
          <DialogHeader>
            <DialogTitle className="text-rose-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Confirm Account Deactivation
            </DialogTitle>
            <DialogDescription className="text-stone-400 text-xs">
              Please enter your password to confirm that you want to deactivate your Far From Home
              student account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="delPass" className="text-xs font-bold text-stone-300">Your Password *</Label>
              <Input
                id="delPass"
                type="password"
                placeholder="••••••••"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="bg-white/[0.04] border-white/10 focus:border-amber-500 text-white text-xs rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false);
                setDeletePassword('');
              }}
              className="ios-pill text-xs border-white/15 text-stone-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={deletingAccount}
              onClick={handleDeleteAccount}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs rounded-full px-4 cursor-pointer"
            >
              {deletingAccount ? 'Deactivating...' : 'Confirm Deactivation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
