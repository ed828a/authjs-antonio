import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "./auth.config";
import { getUserById } from "./data/user";
import { db } from "./lib/db";
import { UserRole } from "@prisma/client";
import { generateVerificaionToken } from "./lib/tokens";
import { sendVerificationEmail } from "./data/mailer";
import { getTwoFactorConfirmationByUserId } from "./data/two-factor-comfirmation";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log("callback signin account:", account);
      // allow OAuth wihtout email verification
      if (account?.provider !== "credentials") return true;

      if (!user.id) return false;

      const existingUser = await getUserById(user.id);

      // to prevent sign-in without email verification. this logic repeats the logic in login action, but more secure.
      if (!existingUser) return false;

      if (!existingUser.emailVerified) {
        const verificaionToken = await generateVerificaionToken(
          existingUser.email
        );

        await sendVerificationEmail(existingUser.email, verificaionToken.token);

        return false;
      }

      // 2FA check
      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        );

        if (!twoFactorConfirmation) return false;

        // Delete two factor confirmation for next sign-in
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      return true;
    },

    async session({ token, session }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }

        if (token.role) {
          session.user.role = token.role as UserRole;
        }

        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      token.role = existingUser.role;
      token.isTwofactorEnbalbed = existingUser.isTwoFactorEnabled;

      return token;
    },
  },

  session: { strategy: "jwt" },
  ...authConfig,
});
