"use client";

// import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../contexts/authContext";
import { useEffect } from "react";


export default function Providers({
    children
    // session
}: {
    children: React.ReactNode
    // session?: any
}) {
    // return <SessionProvider session={session}>{children}</SessionProvider>;
    return <AuthProvider>{children}</AuthProvider>;
}
