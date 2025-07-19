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
    wellKnown: "http://172.20.1.2/accounts.google.com/.well-known/openid-configuration",
    // authorization: {
    //     url: "http://172.20.1.2/oauth/o/oauth2/v2/auth",
    //     params: {
    //         scope: "openid email profile",
    //         prompt: "consent",
    //         access_type: "offline",
    //         response_type: "code",
    //     },
    // },
    checks: ["state"],

    // token: {
    //     url: "http://172.20.1.2/oauth/token",
    //     request: async (context) => {
    //         console.log("🔍 TOKEN REQUEST - Using reverse proxy (no PKCE)");
    //         const { params, provider } = context;

    //         console.log("🔍 TOKEN REQUEST - Original params:", params);
    //         console.log("🔍 TOKEN REQUEST - Params keys:", Object.keys(params));

    //         const tokenParams = {
    //             grant_type: "authorization_code",
    //             client_id: provider.clientId,
    //             client_secret: provider.clientSecret,
    //             code: params.code,
    //             redirect_uri:
    //                 params.redirect_uri ||
    //                 `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
    //         };

    //         console.log(
    //             "🔍 TOKEN REQUEST - Final params keys:",
    //             Object.keys(tokenParams)
    //         );
    //         console.log("🔍 TOKEN REQUEST - No PKCE required");

    //         const body = new URLSearchParams(tokenParams).toString();
    //         console.log("🔍 TOKEN REQUEST - Body length:", body.length);

    //         const response = await fetch("http://172.20.1.2/oauth/token", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/x-www-form-urlencoded",
    //                 Accept: "application/json",
    //             },
    //             body: body,
    //         });

    //         console.log("🔍 TOKEN RESPONSE - Status:", response.status);

    //         if (!response.ok) {
    //             const errorText = await response.text();
    //             console.error("🔍 TOKEN ERROR - Response:", errorText);
    //             throw new Error(
    //                 `Token request failed: ${response.status} - ${errorText}`
    //             );
    //         }

    //         const tokens = await response.json();
    //         console.log("🔍 TOKEN RESPONSE - Raw tokens:", tokens);
    //         console.log(
    //             "🔍 TOKEN DEBUG - Access token present:",
    //             !!tokens.access_token
    //         );
    //         console.log("🔍 TOKEN DEBUG - Token keys:", Object.keys(tokens));

    //         return {
    //             access_token: tokens.access_token,
    //             token_type: tokens.token_type,
    //             expires_in: tokens.expires_in,
    //             refresh_token: tokens.refresh_token,
    //             scope: tokens.scope,
    //             id_token: tokens.id_token,
    //         };
    //     },
    // },
    // userinfo: {
    //     url: "http://172.20.1.2/googleapis/oauth2/v2/userinfo",
    //     request: async (context) => {
    //         console.log("🔍 USERINFO REQUEST - Using reverse proxy");
    //         const { tokens } = context;

    //         // ✅ MEJOR DEBUG DE TOKENS
    //         console.log(
    //             "🔍 USERINFO DEBUG - Context tokens:",
    //             tokens ? Object.keys(tokens) : "null"
    //         );
    //         console.log(
    //             "🔍 USERINFO DEBUG - Access token present:",
    //             !!tokens?.access_token
    //         );

    //         if (!tokens?.access_token) {
    //             console.error("🔍 USERINFO ERROR - No access token available");
    //             console.error(
    //                 "🔍 USERINFO ERROR - Full tokens object:",
    //                 tokens
    //             );
    //             throw new Error(
    //                 "No access token available for userinfo request"
    //             );
    //         }

    //         console.log(
    //             "🔍 USERINFO REQUEST - Token available, making request"
    //         );

    //         const response = await fetch(
    //             "http://172.20.1.2/googleapis/oauth2/v2/userinfo",
    //             {
    //                 method: "GET",
    //                 headers: {
    //                     Authorization: `Bearer ${tokens.access_token}`,
    //                     Accept: "application/json",
    //                     "User-Agent": "Aleph-Frontend/1.0",
    //                 },
    //             }
    //         );

    //         console.log("🔍 USERINFO RESPONSE - Status:", response.status);

    //         if (!response.ok) {
    //             const errorText = await response.text();
    //             console.error("🔍 USERINFO ERROR - Response:", errorText);
    //             throw new Error(
    //                 `Userinfo request failed: ${response.status} - ${errorText}`
    //             );
    //         }

    //         const profile = await response.json();
    //         console.log(
    //             "🔍 USERINFO RESPONSE - Profile received:",
    //             profile.email ? "✅" : "❌"
    //         );
    //         return profile;
    //     },
    // },
    token: "http://172.20.1.2/oauth2.googleapis.com/token",
    userinfo: "http://172.20.1.2/googleapis/oauth2/v2/userinfo",
    issuer: "https://accounts.google.com", // Solo texto, no petición
    jwks_endpoint: "http://172.20.1.2/googleapis/oauth2/v3/certs", // Por reverse proxy
    httpOptions: {
        timeout: 20000,
    },
});

const handler = NextAuth({
    debug: process.env.NODE_ENV === "development",

    providers: [
        // Proveedor Google
        // GoogleProvider({
        //     clientId: process.env.GOOGLE_CLIENT_ID!,
        //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        //     wellKnown: undefined,
        //     authorization: {
        //         url: "http://172.20.1.2/oauth/o/oauth2/v2/auth",
        //         params: {
        //             scope: "openid email profile",
        //             prompt: "consent",
        //             access_type: "offline",
        //             response_type: "code"
        //         }
        //     },
        //     token: "http://172.20.1.2/oauth/token",
        //     userinfo: "http://172.20.1.2/googleapis/oauth2/v2/userinfo",
        //     httpOptions: {
        //         timeout: 20000, // 20 segundos en lugar de 3.5 segundos por defecto
        //     },
        //     clientOptions: {
        //         client_id: process.env.GOOGLE_CLIENT_ID!,
        //         client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        //     }
        // }),

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

                // ✅ NUEVO: Crear/obtener token del auth-ms para usuarios de Google
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
