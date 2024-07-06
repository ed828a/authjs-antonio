"use server";

import { sendVerificationEmail } from "@/data/mailer";
import { getUserByEmail, getUserById } from "@/data/user";
import { getCurrentUser } from "@/lib/auth-lib";
import { db } from "@/lib/db";
import { generateVerificaionToken } from "@/lib/tokens";
import { settingsSchema } from "@/schemas";
import * as z from "zod";
import bcrypt from "bcryptjs";

export const settings = async (values: z.infer<typeof settingsSchema>) => {
  let returnMessage: string | undefined = undefined;

  const user = await getCurrentUser();

  if (!user) {
    return { error: "Unauthorized!" };
  }

  const dbUser = await getUserById(user.id);

  if (!dbUser) {
    return { error: "Un-authorized!" };
  }

  if (user.isOAuth) {
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
    values.isTwoFactorEnabled = undefined;
  }

  if (values.email && values.email !== user.email) {
    const existingUser = await getUserByEmail(values.email);
    if (existingUser && existingUser.id !== user.id) {
      return { error: "Email already in use!" };
    }

    const verificationToken = await generateVerificaionToken(values.email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );
    // save new email, and change emailVerified to undefined
    // await db.user.update({
    //   where: { id: dbUser.id },
    //   data: {
    //     email: values.email,
    //     emailVerified: undefined,
    //   },
    // });
    // return { success: "Verification email sent!" };
    returnMessage = "Verification email sent!";
  }

  if (values.password && values.newPassword && dbUser.password) {
    const passwordsMatch = await bcrypt.compare(
      values.password,
      dbUser.password
    );
    if (!passwordsMatch) {
      return { error: "Incorrect password!" };
    }

    if (values.password === values.newPassword) {
      return { error: "New password is same as the current password" };
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);
    values.password = hashedPassword;
    values.newPassword = undefined;

    returnMessage += " Password changed! ";
  }

  await db.user.update({
    where: { id: dbUser.id },
    data: { ...values },
  });

  return { success: "data updated!" };
};
