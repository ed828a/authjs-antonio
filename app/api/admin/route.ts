import { auth } from "@/auth";
import { getCurrentRole } from "@/lib/auth-lib";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  const role = await getCurrentRole();

  if (role === UserRole.ADMIN) {
    return NextResponse.json({ success: "Allowed Route" }, { status: 200 });
  }

  return NextResponse.json({ error: "forbidden route" }, { status: 403 });
}
