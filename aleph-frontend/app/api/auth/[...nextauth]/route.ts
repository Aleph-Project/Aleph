import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginWithCredentials } from "@/services/authService";
import { NextResponse } from 'next/server';

// Extend NextAuth types to include googleId
declare module "next-auth" {
    interface Session {
        user?: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
            googleId?: string;
            id?: string;
            backendToken?: string;
        };
    }
    interface User {
        googleId?: string;
        id?: string;
        backendToken?: string;
    }
}

const googleProvider = GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    wellKnown: "https://172.20.1.2/accounts.google.com/.well-known/openid-configuration",
    checks: ["state"],
    token: "https://172.20.1.2/oauth2.googleapis.com/token",
    userinfo: "https://172.20.1.2/googleapis/oauth2/v2/userinfo",
    issuer: "https://accounts.google.com",
    jwks_endpoint: "https://172.20.1.2/googleapis/oauth2/v3/certs",
    timeout: 20000,
},

);

const handler = NextAuth({
    debug: process.env.NODE_ENV === "development",

    providers: [

        googleProvider,

        // Proveedor personalizado con tu microservicio
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    // Llamar al auth-ms a través del API Gateway (URL interna de Docker)
                    console.log(process.env.APIGATEWAY_INT_URL);
                    const res = await fetch(
                        `${process.env.APIGATEWAY_INT_URL}/api/v1/auth/login`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                email: credentials?.email,
                                password: credentials?.password,
                            }),
                        }
                    );

                    const data = await res.json();

                    if (res.ok && data.user && data.token) {
                        // Devuelve ambos para que estén disponibles en el callback jwt
                        return { ...data.user, backendToken: data.token };
                    } else {
                        // Si el backend responde con error, propaga el error
                        if (data?.error) {
                            throw new Error(
                                JSON.stringify({ error: data.error })
                            );
                        }
                        return null;
                    }
                } catch (err: any) {
                    // Si el error viene del fetch, manejar respuesta
                    if (err.message && err.message.startsWith("{")) {
                        throw err;
                    }
                    // Error genérico
                    throw new Error(
                        JSON.stringify({ error: "Invalid credentials" })
                    );
                }
            },
        }),
    ],

    session: {
        strategy: "jwt", // Recomendado
    },

    callbacks: {
        async jwt({ token, user, account, profile }) {
            console.log(
                "🔍 JWT CALLBACK - Account provider:",
                account?.provider
            );
            console.log(
                "🔍 JWT CALLBACK - Profile:",
                profile ? "exists" : "null"
            );
            // Guardar id único de Google si el proveedor es Google
            if (account?.provider === "google" && profile) {
                console.log("🔍 GOOGLE LOGIN - Profile sub:", profile.sub);
                token.googleId = profile.sub;
                token.image = (profile as { picture?: string }).picture; // Guarda la imagen de Google


                try {
                    const googleUserData = {
                        email: profile.email,
                        name: profile.name,
                        googleId: profile.sub,
                        provider: "google",
                    };
                    console.log(
                        "🔍 GOOGLE LOGIN - Calling auth-ms via:",
                        process.env.APIGATEWAY_INT_URL
                    );
                    // Llamar al auth-ms a través del API Gateway (URL interna de Docker)
                    const authResponse = await fetch(
                        `${process.env.APIGATEWAY_INT_URL}/api/v1/auth/google-login`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(googleUserData),
                        }
                    );

                    if (authResponse.ok) {
                        const authData = await authResponse.json();
                        console.log("🔍 GOOGLE LOGIN - Auth-ms response: OK");
                        token.backendToken = authData.token;
                        token.id = authData.user.id;
                    } else {
                        console.error("🔍 GOOGLE LOGIN - Auth-ms response: ERROR", authResponse.status);
                    }

                } catch (error) {
                    console.error(
                        "Error obteniendo token para usuario de Google:",
                        error
                    );
                }
            }
            // Si viene de credentials, user tendrá backendToken y datos del usuario
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                if (user.backendToken) {
                    token.backendToken = user.backendToken;
                }
            }
            return token;
        },
        async session({
            session,
            token,
        }: {
            session: import("next-auth").Session;
            token: any;
        }) {
            // Defensive: ensure session.user exists
            if (!session.user) session.user = {};
            session.user.email = token.email;
            session.user.name = token.name;
            session.user.id = token.id;
            // Pasar backendToken a la sesión si existe
            if (token.backendToken) {
                (session.user as { backendToken?: string }).backendToken =
                    token.backendToken as string;
            }
            // Pasar imagen a la sesión si existe
            if (token.image) {
                session.user.image = token.image as string;
            }
            return session;
        },
    },
    events: {
        async signIn({ user, account, profile, isNewUser }) {
            console.log("🔍 SIGNIN EVENT - User:", user?.email);
            console.log("🔍 SIGNIN EVENT - Provider:", account?.provider);
        },
        async signOut({ session, token }) {
            console.log("🔍 SIGNOUT EVENT");
        },
        async error(error) {
            console.error("🔍 NEXTAUTH ERROR EVENT:", error);
        },
    },

    pages: {
        signIn: "/login", // Ruta personalizada de login
    },

    secret: process.env.NEXTAUTH_SECRET,
    logger: {
        error(code, metadata) {
            console.error("NextAuth Error:", code, metadata);
        },
        warn(code) {
            console.warn("NextAuth Warning:", code);
        },
        debug(code, metadata) {
            console.debug("NextAuth Debug:", code, metadata);
        },
    },
});

export { handler as GET, handler as POST };
