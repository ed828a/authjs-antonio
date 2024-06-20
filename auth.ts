// This is the auth.ts configuration file you will import from in the rest of your application, other than in the middleware.
import NextAuth, { DefaultSession } from "next-auth";
import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/schemas";
import { getUserByEmail, getUserById } from "./data/user";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { JWT } from "next-auth/jwt"; // auth.js docs

export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
};

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    isTwoFactorEnabled: boolean;
    isOAuth: boolean;
  }
}

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    // user: {
    //   role: UserRole;
    //   /**
    //    * By default, TypeScript merges new interface properties and overwrites existing ones.
    //    * In this case, the default session user properties will be overwritten,
    //    * with the new ones defined above. To keep the default session user properties,
    //    * you need to add them back into the newly declared interface.
    //    */
    // } & DefaultSession["user"];
    user: ExtendedUser;
  }
}

// signIn & signOut can be called in server component or server actions.
// for client component, you can use either server action with this signIn & signOut, or the signIn & signOut from next-auth/react
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" }, // prisma doesn't work on database strategy

  // providers: [
  //   Credentials({
  //     async authorize(credentials) {
  //       console.log("credentials", credentials);

  //       const validatedFields = LoginSchema.safeParse(credentials);

  //       if (validatedFields.success) {
  //         const { email, password } = validatedFields.data;

  //         console.log("email", email);

  //         const user = await getUserByEmail(email);
  //         console.log("user", user);
  //         if (!user || !user.password) return null;

  //         const passwordMatch = await bcrypt.compare(password, user.password);
  //         console.log("passwordMatch", passwordMatch);
  //         if (passwordMatch) return user;
  //       }

  //       return null;
  //     },
  //   }),
  //   GitHub,
  //   Google,
  // ],
  callbacks: {
    async signIn({ user }) {
      const existingUser = await getUserById(user.id!);
      // if (!existingUser || !existingUser.emailVerified) {
      //   return false;
      // }

      return true;
    },

    async session({ session, token }) {
      // input token is identical to the token return from jwt
      console.log("Session token", token);
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role;
      }

      return session;
    },
    async jwt({ token }) {
      console.log("token", token);
      if (!token.sub) return token;

      const user = await getUserById(token.sub);
      console.log("user", user);
      if (user) {
        token.role = user.role;
      }

      return token;
    },
  },
  events: {
    /**
     * Sent when an account in a given provider is linked to a user in our user database.
     * For example, when a user signs up with Github or when an existing user links their Google account.
     * The message object will contain:
     *          user: The user object from your adapter.
     *          account: The object returned from the provider.
     *          profile: The object returned from the profile callback of the OAuth provider.
     */
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },

  // redirect to custom pages
  pages: {
    signIn: "/auth/login",
  },
});
