import { authMiddleware } from "./config/middleware";

export default authMiddleware;

export const config = {
  matcher: ["/dashboard/:path*"],
};
