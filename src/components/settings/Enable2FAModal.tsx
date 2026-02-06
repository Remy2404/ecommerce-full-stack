'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { setup2FA, enable2FA } from '@/services/twofa.service';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/auth-context';
import { ShieldCheck, QrCode, Loader2, Copy, Check } from 'lucide-react';
import { getErrorMessage } from '@/lib/http-error';

interface Enable2FAModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Enable2FAModal({ isOpen, onOpenChange }: Enable2FAModalProps) {
  const [step, setStep] = useState<'intro' | 'setup' | 'verify'>('intro');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { refresh } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  const resetModal = () => {
    setStep('intro');
    setQrCode('');
    setSecret('');
    setCode('');
    setIsLoading(false);
  };

  const handleSetup = async () => {
    setIsLoading(true);
    try {
      const response = await setup2FA();
      setQrCode(response.qrCodeUrl);
      setSecret(response.secret);
      setStep('verify');
      toast.success('Authenticator configuration generated');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to setup 2FA'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      await enable2FA(code);
      await refresh();
      toast.success('Two-factor authentication enabled successfully');
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Invalid verification code'));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Secret key copied to clipboard');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Enable Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 'intro' && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                <p className="font-medium">How it works:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Install an authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>Scan the QR code or enter the secret key</li>
                  <li>Enter the 6-digit code from the app to verify</li>
                </ol>
              </div>
              <Button className="w-full" onClick={handleSetup} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Get Started
              </Button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-white p-2 rounded-lg border">
                  {qrCode ? (
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-muted rounded">
                      <QrCode className="h-10 w-10 text-muted-foreground animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="text-center text-sm">
                  <p className="text-muted-foreground">Scan this QR code with your app</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Manual entry secret key</label>
                <div className="flex gap-2">
                  <code className="flex-1 bg-muted p-2 rounded text-xs font-mono break-all flex items-center h-10">
                    {secret}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyToClipboard} className="shrink-0">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium">Verification Code</label>
                <Input
                  id="otp"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  autoComplete="one-time-code"
                />
              </div>

              <Alert className="bg-primary/5 border-primary/20">
                <AlertDescription className="text-xs">
                  Make sure to save your secret key in a safe place.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep('intro')}>
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleVerify} 
                  disabled={isLoading || code.length !== 6}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Enable 2FA
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
