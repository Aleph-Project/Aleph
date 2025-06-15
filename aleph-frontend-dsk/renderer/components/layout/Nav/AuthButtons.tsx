"use client";

import { useAuth } from "@/renderer/contexts/authContext";
import { useRouter } from "next/navigation";

export default function AuthButtons() {
    // const { data: session, status } = useSession();
    // const user = session?.user;
    // const isLoading = status === "loading";
    // const userId = user?.email; // Obtener el id del usuario desde session.user.id si existe

    const { authenticated, user, logout } = useAuth();
    // const router = useRouter();

    if (user === undefined) {
        return null; 
    }

    // if (isLoading) {
    //     return null;
    // }

    const buttonClass =
        "text-sm px-5 py-2 rounded-full transition-colors border font-medium " +
        "border-[#9610FB] bg-[#9610FB] text-white hover:bg-[#b05cff] hover:border-[#b05cff]";

    if (!authenticated) {
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

    const handleLogout = async () => {
        await logout();
        // Redirigir a la página de inicio después de cerrar sesión
        window.location.href = "/home";
    }

    return (
        <div className="flex gap-2 items-center">
            <span className="text-sm mr-2">Hola, {user.name || user.email}!</span>
            <button className={buttonClass} onClick={() => handleLogout()}>
                Cerrar sesión
            </button>
        </div>
    );
}
