'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from './ProfileForm';
import { useAuth } from '@/hooks/auth-context';
import { getUserProfile, updateProfile } from '@/services/user.service';
import { User, UpdateProfileRequest } from '@/types/user';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { getErrorMessage } from '@/lib/http-error';

export function ProfileTab() {
  const { refresh } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch {
        toast.error('Failed to load profile details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your personal information and contact details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {profile && (
          <ProfileForm 
            user={profile} 
            onSubmit={handleSubmit} 
            isLoading={isSaving} 
          />
        )}
      </CardContent>
    </Card>
  );
}
