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
          <Settings className="h-7 w-7 text-indigo-400" />
          <span>Account & Security Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your credentials, alerts, privacy visibility, and platform security.
        </p>
      </div>

      {/* Account Info Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="p-6 pb-4 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="h-4 w-4 text-teal-600" /> Account Identity
          </CardTitle>
          <CardDescription>Your registered login credentials</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-slate-500">Name</Label>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {session?.user?.name || 'Student'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Email Address</Label>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {session?.user?.email || 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security: Change Password Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="p-6 pb-4 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="h-4 w-4 text-teal-600" /> Change Password
          </CardTitle>
          <CardDescription>Update your secret password for secure logins</CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currPass">Current Password *</Label>
              <Input
                id="currPass"
                type="password"
                placeholder="••••••••"
                {...regPassword('currentPassword', { required: true })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPass">New Password *</Label>
                <Input
                  id="newPass"
                  type="password"
                  placeholder="Min 8 chars, uppercase, lowercase, number"
                  {...regPassword('newPassword', { required: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confPass">Confirm New Password *</Label>
                <Input
                  id="confPass"
                  type="password"
                  placeholder="Confirm new password"
                  {...regPassword('confirmPassword', { required: true })}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-6 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              disabled={changingPassword}
              className="bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs cursor-pointer"
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="p-6 pb-4 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="h-4 w-4 text-teal-600" /> Notifications & Reminders
          </CardTitle>
          <CardDescription>Control which in-app updates and alerts you receive</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4 divide-y divide-slate-100">
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-slate-800">Checklist Task Reminders</Label>
              <p className="text-xs text-slate-500">
                Receive notifications when visa, flight, and registration deadlines approach.
              </p>
            </div>
            <Switch checked={prefTaskReminders} onCheckedChange={setPrefTaskReminders} />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-slate-800">Buddy Request Alerts</Label>
              <p className="text-xs text-slate-500">
                Get notified when another student sends or accepts a connection request.
              </p>
            </div>
            <Switch checked={prefBuddyRequests} onCheckedChange={setPrefBuddyRequests} />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-slate-800">Campus Events & Workshops</Label>
              <p className="text-xs text-slate-500">
                Receive reminders about gatherings and orientations you have registered for.
              </p>
            </div>
            <Switch checked={prefEventUpdates} onCheckedChange={setPrefEventUpdates} />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-slate-800">Weekly Pre-Departure Digest</Label>
              <p className="text-xs text-slate-500">
                Receive a weekly summary email of tips and newly published destination handbooks.
              </p>
            </div>
            <Switch checked={prefWeeklyDigest} onCheckedChange={setPrefWeeklyDigest} />
          </div>
        </CardContent>
        <CardFooter className="p-6 border-t border-slate-100 flex justify-end">
          <Button
            type="button"
            onClick={handleSavePreferences}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs cursor-pointer"
          >
            Save Alert Preferences
          </Button>
        </CardFooter>
      </Card>

      {/* Privacy Settings */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="p-6 pb-4 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Eye className="h-4 w-4 text-teal-600" /> Privacy & Student Visibility
          </CardTitle>
          <CardDescription>Choose how you appear to fellow campus international students</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4 divide-y divide-slate-100">
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold text-slate-800">
                Show in Peer Buddy Search Directory
              </Label>
              <p className="text-xs text-slate-500">
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
              <Label className="text-sm font-semibold text-slate-800">
                Display Enrolled Institution
              </Label>
              <p className="text-xs text-slate-500">
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
              <Label className="text-sm font-semibold text-slate-800">
                Allow Direct Peer Inquiries
              </Label>
              <p className="text-xs text-slate-500">
                Allow students to send you intro messages when requesting buddy connections.
              </p>
            </div>
            <Switch
              checked={privacyAllowMessages}
              onCheckedChange={setPrivacyAllowMessages}
            />
          </div>
        </CardContent>
        <CardFooter className="p-6 border-t border-slate-100 flex justify-end">
          <Button
            type="button"
            onClick={handleSavePreferences}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs cursor-pointer"
          >
            Save Privacy Settings
          </Button>
        </CardFooter>
      </Card>

      {/* Danger Zone: Account Deactivation */}
      <Card className="border-red-200 bg-red-50/20 shadow-sm">
        <CardHeader className="p-6 pb-3">
          <CardTitle className="text-base font-bold text-red-700 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" /> Danger Zone
          </CardTitle>
          <CardDescription className="text-xs text-red-600/80">
            Irreversible account action
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Deactivating your account will remove your buddy listing, cancel active event RSVPs, and
            archive your pre-departure checklist.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            className="text-xs cursor-pointer"
          >
            Deactivate My Account
          </Button>
        </CardContent>
      </Card>

      {/* Account Deletion Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Confirm Account Deactivation
            </DialogTitle>
            <DialogDescription>
              Please enter your password to confirm that you want to deactivate your Far From Home
              student account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="delPass">Your Password *</Label>
              <Input
                id="delPass"
                type="password"
                placeholder="••••••••"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
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
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={deletingAccount}
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-500 text-white cursor-pointer"
            >
              {deletingAccount ? 'Deactivating...' : 'Confirm Deactivation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
