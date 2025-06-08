import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginWithCredentials } from "@/services/authService"

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

const handler = NextAuth({
    providers: [
        // Proveedor Google
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),

        // Proveedor personalizado con tu microservicio
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    // Usa authService para validar login
                    const res = await loginWithCredentials(credentials?.email, credentials?.password);
                    // res debe tener { user, token }
                    const { user, token } = res.data;

                    if (user && token) {
                        // Devuelve ambos para que estén disponibles en el callback jwt
                        return { ...user, backendToken: token };
                    } else {
                        // Si el backend responde sin user/token pero con error, propaga el error
                        if (res.data?.error) {
                            throw new Error(JSON.stringify({ error: res.data.error }));
                        }
                        return null;
                    }
                } catch (err: any) {
                    // Si el error viene del backend, propaga el mensaje de error
                    if (err.response?.data?.error) {
                        throw new Error(JSON.stringify({ error: err.response.data.error }));
                    }
                    // Si ya es un error lanzado arriba, propágalo tal cual
                    if (err instanceof Error && err.message.startsWith("{")) {
                        throw err;
                    }
                    // Error genérico
                    throw new Error(JSON.stringify({ error: "Invalid credentials" }));
                }
            },
        }),
    ],

    session: {
        strategy: "jwt", // Recomendado
    },

    callbacks: {
        async jwt({ token, user, account, profile }) {
            // Guardar id único de Google si el proveedor es Google
            if (account?.provider === "google" && profile) {
                token.googleId = profile.sub;
                token.image = (profile as { picture?: string }).picture; // Guarda la imagen de Google
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
        async session({ session, token }: { session: import("next-auth").Session, token: any }) {
            // Defensive: ensure session.user exists
            if (!session.user) session.user = {};
            session.user.email = token.email;
            session.user.name = token.name;
            session.user.id = token.id;
            // Pasar backendToken a la sesión si existe
            if (token.backendToken) {
                (session.user as { backendToken?: string }).backendToken = token.backendToken as string;
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
});

export { handler as GET, handler as POST };
