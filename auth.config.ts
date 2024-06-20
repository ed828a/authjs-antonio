import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "./data/user";
import bcrypt from "bcryptjs";

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_CLIENT_ID,
      clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET,
    }),

    Credentials({
      async authorize(credentials) {
        console.log("credentials", credentials);

        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          console.log("email", email);

          const user = await getUserByEmail(email);
          console.log("user", user);
          if (!user || !user.password) return null;

          const passwordMatch = await bcrypt.compare(password, user.password);
          console.log("passwordMatch", passwordMatch);
          if (passwordMatch) return user;
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;

// This file is used to trigger middleware, because database adapter not working in edge, but middleware working in edge.
/**
  Credentials({
      async authorize(credentials) {
        console.log("credentials", credentials);

        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          console.log("email", email);

          try {
            const user = await getUserByEmail(email);
            console.log("user", user);
            if (!user || !user.password) return null;

            const passwordMatch = await bcrypt.compare(password, user.password);
            console.log("passwordMatch", passwordMatch);
            if (passwordMatch) return user;
          } catch (error) {
            console.log("authorize error", error);
          }
        }

        return null;
      },
    }),
    // GitHub,
    // Google,
 */
