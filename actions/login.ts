"use server";

import { signIn } from "@/auth";
import { sendTwoFactorTokenEmail, sendVerificationEmail } from "@/data/mailer";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-comfirmation";
import { getTwofactorTokenByEmail } from "@/data/two-factor-token";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";
import { generateTwoFactorToken, generateVerificaionToken } from "@/lib/tokens";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { loginSchema } from "@/schemas";
import { AuthError } from "next-auth";
import * as z from "zod";

export async function login(values: z.infer<typeof loginSchema>) {
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, code } = validatedFields.data;

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

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwofactorTokenByEmail(existingUser.email);

      if (!twoFactorToken) return { error: "Invalid code!" };
      if (twoFactorToken.token !== code) {
        console.log("code", code);
        console.log("twoFactorToken.token", twoFactorToken.token);

        return { error: "Invalid code!" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();
      if (hasExpired) return { error: "Code expired!" };

      await db.twoFactorToken.delete({ where: { id: twoFactorToken.id } });

      const existingTwofactorConfirmation =
        await getTwoFactorConfirmationByUserId(existingUser.id);
      if (existingTwofactorConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingTwofactorConfirmation.id },
        });
      }

      await db.twoFactorConfirmation.create({
        data: { userId: existingUser.id },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(existingUser.email, twoFactorToken.token);

      return { twoFactor: true };
    }
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
