import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ['/', '/(api|trpc)(.*)']
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next|_axiom).*)', '/', '/(api|trpc)(.*)'],
};
