"use server";
import { registerSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

import * as z from "zod";
import { getUserByEmail } from "@/data/user";
import { generateVerificaionToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/data/mailer";

export const register = async (values: z.infer<typeof registerSchema>) => {
  const validatedFields = registerSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, name, password } = validatedFields.data;

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { error: "Email already in use!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const verificaionToken = await generateVerificaionToken(email);
  // todo: send verification token email
  await sendVerificationEmail(email, verificaionToken.token);

  return { success: "Confirmation email sent!" };
};
