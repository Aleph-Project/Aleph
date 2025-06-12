"use client";

import { useSession, signOut } from "next-auth/react";

export default function AuthButtons() {
    const { data: session, status } = useSession();
    const user = session?.user;
    const isLoading = status === "loading";
    const userId = user?.email; // Obtener el id del usuario desde session.user.id si existe

    if (isLoading) {
        return null;
    }

    const buttonClass =
        "text-sm px-5 py-2 rounded-full transition-colors border font-medium " +
        "border-[#9610FB] bg-[#9610FB] text-white hover:bg-[#b05cff] hover:border-[#b05cff]";

    if (!user) {
        return (
            <div className="flex gap-2">
                <a href="/login/page">
                    <button className={buttonClass}>
                        Iniciar sesión
                    </button>
                </a>
                <a href="/register/page">
                    <button className={buttonClass}>
                        Regístrate
                    </button>
                </a>
            </div>
        );
    }

    return (
        <div className="flex gap-2 items-center">
            <span className="text-sm mr-2">Hola, {user.name || user.email}!</span>
            <button className={buttonClass} onClick={() => signOut({ callbackUrl: "/" })}>
                Cerrar sesión
            </button>
        </div>
    );
}
