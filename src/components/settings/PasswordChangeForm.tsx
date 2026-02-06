'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, Lock } from 'lucide-react';

export function PasswordChangeForm() {
  return (
    <div className="space-y-6">
      <Alert className="bg-muted/50 border-border">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription className="text-sm font-medium">
          Password changes are currently unavailable through the settings panel. 
          Please use the &quot;Forgot Password&quot; flow at login if you need to reset your password.
        </AlertDescription>
      </Alert>

      <form className="space-y-4 opacity-70 grayscale-[0.5] pointer-events-none select-none">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <div className="relative">
            <Input id="currentPassword" type="password" disabled value="••••••••" />
            <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" disabled />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="button" disabled>
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
}
