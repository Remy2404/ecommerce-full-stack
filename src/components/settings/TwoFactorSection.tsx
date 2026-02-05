'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { Enable2FAModal } from './Enable2FAModal';
import { Disable2FADialog } from './Disable2FADialog';
import { disable2FA } from '@/services/twofa.service';
import { useAuth } from '@/hooks/auth-context';
import { toast } from 'sonner';

interface TwoFactorSectionProps {
  twofaEnabled: boolean;
}

export function TwoFactorSection({ twofaEnabled }: TwoFactorSectionProps) {
  const [isEnableModalOpen, setIsEnableModalOpen] = useState(false);
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const { refresh } = useAuth();

  const handleDisable = async () => {
    setIsDisabling(true);
    try {
      await disable2FA();
      await refresh();
      toast.success('Two-factor authentication disabled');
      setIsDisableDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setIsDisabling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/50">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-full ${twofaEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            {twofaEnabled ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Status</span>
              <Badge variant={twofaEnabled ? 'default' : 'secondary'} className="uppercase text-[10px]">
                {twofaEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {twofaEnabled 
                ? 'Your account is protected with two-factor authentication.' 
                : 'Authentication with a 6-digit verification code is currently disabled.'}
            </p>
          </div>
        </div>
        
        {twofaEnabled ? (
          <Button variant="outline" onClick={() => setIsDisableDialogOpen(true)}>
            Disable 2FA
          </Button>
        ) : (
          <Button onClick={() => setIsEnableModalOpen(true)}>
            Enable 2FA
          </Button>
        )}
      </div>

      <div className="flex items-start gap-4 p-4 text-sm text-muted-foreground bg-primary/5 rounded-lg border border-primary/10">
        <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-foreground">Why enable 2FA?</p>
          <p>
            Two-factor authentication adds an extra layer of security to your account. 
            By requiring more than just a password to log in, you protect your personal 
            information and prevent unauthorized access even if your password is stolen.
          </p>
        </div>
      </div>

      <Enable2FAModal 
        isOpen={isEnableModalOpen} 
        onOpenChange={setIsEnableModalOpen} 
      />
      
      <Disable2FADialog 
        isOpen={isDisableDialogOpen} 
        onClose={() => setIsDisableDialogOpen(false)}
        onConfirm={handleDisable}
        isLoading={isDisabling}
      />
    </div>
  );
}
