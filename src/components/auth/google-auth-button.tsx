'use client';

import { GoogleLogin } from '@react-oauth/google';

interface GoogleAuthButtonProps {
  onSuccess: (idToken: string) => void | Promise<void>;
  onError?: () => void;
}

export function GoogleAuthButton({ onSuccess, onError }: GoogleAuthButtonProps) {
  return (
    <div className="flex w-full justify-center">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (!credentialResponse.credential) {
            onError?.();
            return;
          }
          void onSuccess(credentialResponse.credential);
        }}
        onError={() => onError?.()}
        useOneTap={false}
      />
    </div>
  );
}
