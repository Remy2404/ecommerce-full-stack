import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'customer' | 'merchant' | 'admin' | 'delivery';
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: 'customer' | 'merchant' | 'admin' | 'delivery';
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: 'customer' | 'merchant' | 'admin' | 'delivery';
  }
}
