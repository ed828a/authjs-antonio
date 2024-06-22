"use server";

import { signIn } from "@/auth";
import { sendVerificationEmail } from "@/data/mailer";
import { getUserByEmail } from "@/data/user";
import { generateVerificaionToken } from "@/lib/tokens";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { loginSchema } from "@/schemas";
import { AuthError } from "next-auth";
import * as z from "zod";

export async function login(values: z.infer<typeof loginSchema>) {
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  const existingUser = await getUserByEmail(email);
  if (!existingUser) {
    return { error: "Please register yourself before logging-in!" };
  }

  if (!existingUser.password) {
    return { error: "You were not registered by Credentials!" };
  }

  if (!existingUser.emailVerified) {
    const verificaionToken = await generateVerificaionToken(email);

    await sendVerificationEmail(email, verificaionToken.token);

    return { success: "Confirmation email sent! Please check your email." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong." };
      }
    }

    throw error;
  }
}
