import { NextRequest } from "next/server";
import authConfig from "@/auth.config"; // middleware use only this config, not the one from auth.ts
import NextAuth from "next-auth";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";

// Use only one of the two middleware options below
// 1. Use middleware directly
// export const { auth: middleware } = NextAuth(authConfig)

// 2. Wrapped middleware option

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  // Your custom middleware logic goes here
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth; // req.auth indicates if the user is logged in
  console.log("ROUTE:", req.nextUrl.pathname, " -- Is LoggedIn:", isLoggedIn);

  const session = await auth();
  console.log("session", session);

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // the following are order-matters
  if (isApiAuthRoute) {
    return null; // don't do anything
  }

  if (isAuthRoute) {
    // console.log("isAuthRoute", isAuthRoute);
    // console.log("isLoggedIn", isLoggedIn);
    if (isLoggedIn) {
      // console.log("isLoggedIn / req.auth", !!req.auth, req.auth);
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null; // don't do anything
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  return null;
});

// The main idea here, is to separate the part of the configuration that is edge-compatible from the rest, and only import the edge-compatible part in Middleware.

// Optionally, don't invoke Middleware on some paths; matcher means any routes in [] will invoke middleware
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
// this regex is from clerk, which is better the one from next-auth:  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
