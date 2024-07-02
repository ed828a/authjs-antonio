"use server";
// send reset password email
import { sendPasswordResetEmail, sendVerificationEmail } from "@/data/mailer";
import { getUserByEmail } from "@/data/user";
import {
  generatePasswordResetToken,
  generateVerificaionToken,
} from "@/lib/tokens";
import { resetSchema } from "@/schemas";
import * as z from "zod";

export async function reset(values: z.infer<typeof resetSchema>) {
  const validatedFields = resetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid email address!" };
  }

  const { email } = validatedFields.data;

  const existingUser = await getUserByEmail(email);
  if (!existingUser) {
    return { error: "Email not found!" };
  }

  if (!existingUser.password) {
    return { error: "You were not registered by Credentials!" };
  }

  // if (!existingUser.emailVerified) {
  //   const verificaionToken = await generateVerificaionToken(email);

  //   await sendVerificationEmail(email, verificaionToken.token);

  //   return { success: "Confirmation email sent! Please check your email." };
  // }

  try {
    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(
      passwordResetToken.email,
      passwordResetToken.token
    );

    return { success: "reset email sent!" };
  } catch (error) {
    console.log("error", error);
  }
}
