"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { activateAccount } from "../../services/authService"; // Importa la función de activación

export default function ActivatePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<'pending' | 'success' | 'error'>("pending")
    const [message, setMessage] = useState("")

    useEffect(() => {
        const token = searchParams?.get("token")
        if (!token) {
            setStatus("error")
            setMessage("Token de activación inválido.")
            return
        }
        activateAccount(token)
            .then(() => {
                setStatus("success")
                setMessage("¡Cuenta activada! Ahora puedes iniciar sesión.")
                // Abrir la pantalla de login en una nueva pestaña y luego redirigir
                window.open("/login")
                setTimeout(() => router.push("/login"), 2000)
            })
            .catch(() => {
                setStatus("error")
                setMessage("El enlace de activación no es válido o expiró.")
            })
    }, [router, searchParams])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
            {status === "pending" && <p>Activando tu cuenta...</p>}
            {status === "success" && <p className="text-green-400">{message}</p>}
            {status === "error" && <p className="text-red-500">{message}</p>}
        </div>
    )
}
