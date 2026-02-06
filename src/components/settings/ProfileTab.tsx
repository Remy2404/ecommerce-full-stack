'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from './ProfileForm';
import { useAuth } from '@/hooks/auth-context';
import { updateProfile, uploadAvatar } from '@/services/user.service';
import { UpdateProfileRequest } from '@/types/user';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/http-error';

export function ProfileTab() {
  const { profile, refresh } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (data: UpdateProfileRequest) => {
    setIsSaving(true);
    try {
      await updateProfile(data);
      await refresh();
      toast.success('Profile updated successfully');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update profile'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setIsSaving(true);
    try {
      await uploadAvatar(file);
      await refresh();
      toast.success('Avatar updated successfully');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to upload avatar'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your personal information and contact details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {profile ? (
          <ProfileForm 
            user={profile} 
            onSubmit={handleSubmit} 
            onAvatarUpload={handleAvatarUpload}
            isLoading={isSaving} 
          />
        ) : (
          <p className="text-sm text-muted-foreground">Profile unavailable.</p>
        )}
      </CardContent>
    </Card>
  );
}
