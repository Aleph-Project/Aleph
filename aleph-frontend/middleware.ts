export { default } from "next-auth/middleware";

export const config = {
    matcher: ["/dashboard/:path*", "/profile/:path*", "/music-player/:path*", "/reviews/:path*"],
};
