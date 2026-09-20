import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    // Only registers the Google provider if credentials are configured,
    // so the site still works before you've set up Google OAuth.
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const normalizedEmail = credentials.email.toLowerCase();

        // 10 attempts per 15 minutes per account — slows down credential
        // stuffing / password guessing against a single email without
        // being triggered by a normal user mistyping once or twice.
        const allowed = await checkRateLimit(`login:${normalizedEmail}`, 10, 15 * 60);
        if (!allowed) return null;

        const [user] = await sql`
          SELECT * FROM users WHERE email = ${normalizedEmail}
        `;

        if (!user || !user.password_hash) return null;

        const valid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        // Create the user record on first Google sign-in, or update their
        // name/photo on later sign-ins.
        await sql`
          INSERT INTO users (name, email, image, provider)
          VALUES (${user.name ?? null}, ${user.email.toLowerCase()}, ${user.image ?? null}, 'google')
          ON CONFLICT (email)
          DO UPDATE SET name = EXCLUDED.name, image = EXCLUDED.image
        `;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const [dbUser] = await sql`
          SELECT id, name, email, image FROM users WHERE email = ${user.email.toLowerCase()}
        `;
        if (dbUser) {
          token.id = String(dbUser.id);
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
