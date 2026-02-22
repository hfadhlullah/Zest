import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Routes that require authentication.
 * Everything else is public (but may be rate-limited separately).
 */
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/v1/projects(.*)",
  "/api/v1/users(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Run on all routes except Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
