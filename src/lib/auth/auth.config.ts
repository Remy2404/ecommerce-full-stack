import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { loginSchema } from '@/lib/validations/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const validatedFields = loginSchema.safeParse(credentials);

          if (validatedFields.success) {
            const { email, password } = validatedFields.data;
            const user = await db.query.users.findFirst({
              where: eq(users.email, email),
            });

            if (!user || !user.password) return null;

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
              return {
                id: user.id,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                role: user.role,
              };
            }
          }
        } catch (error) {
          console.error('Auth error:', error);
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth sign in
      if (account?.provider === 'google' && user.email) {
        try {
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, user.email),
          });

          if (!existingUser) {
            // Create new user from Google OAuth
            const nameParts = (user.name || 'User').split(' ');
            const firstName = nameParts[0] || 'User';
            const lastName = nameParts.slice(1).join(' ') || '';

            const [newUser] = await db.insert(users).values({
              email: user.email,
              phone: '', // OAuth users don't have phone initially
              password: '', // OAuth users don't have password
              firstName,
              lastName,
              avatar: user.image || null,
              role: 'customer',
              isActive: true,
            }).returning();

            user.id = newUser.id;
            (user as any).role = newUser.role;
          } else {
            // Update existing user with Google info if needed
            user.id = existingUser.id;
            (user as any).role = existingUser.role;
          }
        } catch (error) {
          console.error('OAuth user sync error:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as any;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
