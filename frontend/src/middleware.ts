import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Only redirect the root path `/`
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/playlists", request.url));
  }

  // Allow everything else to continue normally
  return NextResponse.next();
}

export const config = {
  matcher: ["/about/:path*", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
