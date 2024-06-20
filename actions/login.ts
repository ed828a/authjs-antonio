"use server";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { LoginSchema } from "@/schemas";
import { AuthError } from "next-auth";

import * as z from "zod";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      console.log("error.type", error.type);

      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };

        case "CallbackRouteError":
          return { error: "Callback Route Error" };

        default:
          console.log("code goes default!!!");
          return { error: "Something went wrong!" };
      }
    }
    console.log("code goes here!!!");
    // next.js requires to throw the error, otherwise, it won't redirect
    throw error;
  }
};
