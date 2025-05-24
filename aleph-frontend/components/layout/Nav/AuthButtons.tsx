"use client";

import { useUser } from "@auth0/nextjs-auth0";


export default function AuthButtons() {
    const { user, isLoading } = useUser();

    if (isLoading) {
        return null;
    }

    const buttonClass =
        "text-sm px-5 py-2 rounded-full transition-colors border font-medium " +
        "border-[#9610FB] bg-[#9610FB] text-white hover:bg-[#b05cff] hover:border-[#b05cff]";

    if (!user) {
        return (
            <div className="flex gap-2">
                <a href="/auth/login?screen_hint=signup">
                    <button className={buttonClass}>
                        Registrate
                    </button>
                </a>
                <a href="/auth/login">
                    <button className={buttonClass}>
                        Iniciar sesión
                    </button>
                </a>
            </div>
        );
    }

    return (
        <div className="flex gap-2 items-center">
            <span className="text-sm mr-2">Hola, {user.nickname}!</span>
            <a href="/auth/logout">
                <button className={buttonClass}>
                    Cerrar sesión
                </button>
            </a>
        </div>
    );
}
