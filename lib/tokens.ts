import { getVerificationTokenByEmail } from "@/data/verification-token";
import { v4 as uuidv4 } from "uuid";
import { db } from "./db";

export const generateVerificaionToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

  const existingToken = await getVerificationTokenByEmail(email);
  if (existingToken) {
    await db.verificaionToken.delete({
      where: { id: existingToken.id },
    });
  }

  const verificaionToken = await db.verificaionToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return verificaionToken;
};
