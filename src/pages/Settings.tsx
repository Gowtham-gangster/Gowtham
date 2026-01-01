import { Layout } from '@/components/layout/Layout';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Settings as SettingsIcon, 
  Volume2, 
  Bell, 
  Eye, 
  Copy, 
  Check, 
  User,
  Share2,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { useVoiceReminder } from '@/hooks/useVoiceReminder';
import integrations from '@/services/integrations';

export const Settings = () => {
  const { 
    user, 
    updateUser, 
    elderlyMode, 
    toggleElderlyMode 
  } = useStore();
  const { speak, isSupported: voiceSupported } = useVoiceReminder();
  const [copied, setCopied] = useState(false);

  const handleCopyInviteCode = async () => {
    if (user?.caregiverInviteCode) {
      await navigator.clipboard.writeText(user.caregiverInviteCode);
      setCopied(true);
      toast.success('Invite code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTestVoice = () => {
    speak('Hello! This is a test of your medication reminder voice. Your medications are being tracked.');
  };

  const handleToggleVoiceReminders = () => {
    updateUser({ voiceRemindersEnabled: !user?.voiceRemindersEnabled });
    toast.success(user?.voiceRemindersEnabled ? 'Voice reminders disabled' : 'Voice reminders enabled');
  };

  const handleToggleNotifications = () => {
    updateUser({ notificationsEnabled: !user?.notificationsEnabled });
    toast.success(user?.notificationsEnabled ? 'Notifications disabled' : 'Notifications enabled');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6 px-4 md:px-0">
        <div>
          <h1 className={cn('text-2xl font-bold flex items-center gap-2', elderlyMode && 'text-3xl')}>
            <SettingsIcon size={elderlyMode ? 32 : 26} className="text-primary" />
            Settings
          </h1>
          <p className={cn('text-muted-foreground', elderlyMode && 'text-lg')}>
            Customize your MedReminder experience
          </p>
        </div>

        {/* Profile */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className={cn('flex items-center gap-2', elderlyMode && 'text-xl')}>
              <User size={20} />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className={cn('font-semibold text-lg', elderlyMode && 'text-xl')}>
                  {user?.name}
                </p>
                <p className="text-muted-foreground break-all">{user?.email}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {user?.role?.toLowerCase()} account
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

          {/* Integrations moved to dedicated Integrations page */}

        {/* Caregiver Invite Code (Patient only) */}
        {user?.role === 'PATIENT' && user?.caregiverInviteCode && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className={cn('flex items-center gap-2', elderlyMode && 'text-xl')}>
                <Share2 size={20} />
                Share with Caregiver
              </CardTitle>
              <CardDescription>
                Share this code with a family member or caregiver to let them monitor your medications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                  value={user.caregiverInviteCode} 
                  readOnly 
                  className={cn('font-mono text-lg', elderlyMode && 'h-14 text-xl')}
                />
                <Button 
                  onClick={handleCopyInviteCode}
                  variant="outline"
                  className={cn('w-full sm:w-auto', elderlyMode && 'h-14 px-6')}
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accessibility */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className={cn('flex items-center gap-2', elderlyMode && 'text-xl')}>
              <Eye size={20} />
              Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className={cn('text-base', elderlyMode && 'text-lg')}>
                  Elderly Mode
                </Label>
                <p className={cn('text-sm text-muted-foreground', elderlyMode && 'text-base')}>
                  Larger text, bigger buttons, simplified interface
                </p>
              </div>
              <Switch
                checked={elderlyMode}
                onCheckedChange={toggleElderlyMode}
                className="scale-125"
              />
            </div>
          </CardContent>
        </Card>

        {/* Voice Settings */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className={cn('flex items-center gap-2', elderlyMode && 'text-xl')}>
              <Volume2 size={20} />
              Voice Reminders
            </CardTitle>
            <CardDescription>
              {voiceSupported 
                ? 'Get spoken reminders when it\'s time to take your medication'
                : 'Voice reminders are not supported in your browser'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className={cn('text-base', elderlyMode && 'text-lg')}>
                  Enable Voice Reminders
                </Label>
                <p className={cn('text-sm text-muted-foreground', elderlyMode && 'text-base')}>
                  Hear spoken reminders for your medications
                </p>
              </div>
              <Switch
                checked={user?.voiceRemindersEnabled ?? false}
                onCheckedChange={handleToggleVoiceReminders}
                disabled={!voiceSupported}
                className="scale-125"
              />
            </div>
            
            {voiceSupported && (
              <>
                <Separator />
                <div>
                  <Button 
                    variant="outline" 
                    onClick={handleTestVoice}
                    className={cn('gap-2', elderlyMode && 'h-12 text-lg')}
                  >
                    <Volume2 size={18} />
                    Test Voice
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className={cn('flex items-center gap-2', elderlyMode && 'text-xl')}>
              <Bell size={20} />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className={cn('text-base', elderlyMode && 'text-lg')}>
                  Push Notifications
                </Label>
                <p className={cn('text-sm text-muted-foreground', elderlyMode && 'text-base')}>
                  Receive notifications for dose reminders and alerts
                </p>
              </div>
              <Switch
                checked={user?.notificationsEnabled ?? false}
                onCheckedChange={handleToggleNotifications}
                className="scale-125"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail size={18} />
                <h4 className={cn('font-medium', elderlyMode && 'text-lg')}>Email Notifications</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className={cn('text-base', elderlyMode && 'text-lg')}>Enable Emails</Label>
                    <p className={cn('text-sm text-muted-foreground', elderlyMode && 'text-base')}>Send emails for selected alerts</p>
                  </div>
                  <Switch
                    checked={user?.notificationSettings?.emailEnabled ?? false}
                    onCheckedChange={(checked) => updateUser({ notificationSettings: { ...(user?.notificationSettings || {}), emailEnabled: checked } })}
                    className="scale-125"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className={cn('text-base', elderlyMode && 'text-lg')}>Dose Reminders</Label>
                  <Switch
                    checked={user?.notificationSettings?.doseReminders ?? true}
                    onCheckedChange={(checked) => updateUser({ notificationSettings: { ...(user?.notificationSettings || {}), doseReminders: checked } })}
                    className="scale-125"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className={cn('text-base', elderlyMode && 'text-lg')}>Missed Dose Alerts</Label>
                  <Switch
                    checked={user?.notificationSettings?.missedDoseAlerts ?? true}
                    onCheckedChange={(checked) => updateUser({ notificationSettings: { ...(user?.notificationSettings || {}), missedDoseAlerts: checked } })}
                    className="scale-125"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className={cn('text-base', elderlyMode && 'text-lg')}>Refill Warnings</Label>
                  <Switch
                    checked={user?.notificationSettings?.refillWarnings ?? true}
                    onCheckedChange={(checked) => updateUser({ notificationSettings: { ...(user?.notificationSettings || {}), refillWarnings: checked } })}
                    className="scale-125"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className={cn('text-base', elderlyMode && 'text-lg')}>Order Notifications</Label>
                  <Switch
                    checked={user?.notificationSettings?.orderNotifications ?? true}
                    onCheckedChange={(checked) => updateUser({ notificationSettings: { ...(user?.notificationSettings || {}), orderNotifications: checked } })}
                    className="scale-125"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
