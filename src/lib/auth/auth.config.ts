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
                image: user.avatar,
                createdAt: user.createdAt,
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
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign in
      if (account?.provider === 'google' && user.email) {
        try {
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, user.email),
          });

          if (!existingUser) {
            // Create new user from Google OAuth
            // Use profile object if available for more accurate names
            const firstName = (profile as any)?.given_name || (user.name || 'User').split(' ')[0];
            const lastName = (profile as any)?.family_name || (user.name || '').split(' ').slice(1).join(' ');

            const [newUser] = await db.insert(users).values({
              email: user.email,
              firstName,
              lastName,
              avatar: user.image || null,
              role: 'customer',
              isActive: true,
            }).returning();

            user.id = newUser.id;
            (user as any).role = newUser.role;
            (user as any).createdAt = newUser.createdAt;
          } else {
            // Update existing user with Google info if needed (like avatar or names)
            const updates: any = {};
            
            if (user.image && existingUser.avatar !== user.image) {
              updates.avatar = user.image;
            }

            // Sync names if they are currently "User" or empty
            const firstName = (profile as any)?.given_name;
            const lastName = (profile as any)?.family_name;
            
            if (firstName && (!existingUser.firstName || existingUser.firstName === 'User')) {
              updates.firstName = firstName;
            }
            if (lastName && !existingUser.lastName) {
              updates.lastName = lastName;
            }

            if (Object.keys(updates).length > 0) {
              await db.update(users)
                .set(updates)
                .where(eq(users.id, existingUser.id));
            }
            
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
        session.user.image = token.image as string;
        session.user.createdAt = token.createdAt as any;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.image = (user as any).image;
        token.createdAt = (user as any).createdAt;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
