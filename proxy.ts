import { auth } from "@/lib/auth";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const isAuthRoute = nextUrl.pathname.startsWith("/entrar");
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");

  if (isApiAuthRoute) return;
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/painel", nextUrl));
    }
    return;
  }
  if (!isLoggedIn && !nextUrl.pathname.startsWith("/api")) {
    return Response.redirect(new URL("/entrar", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
