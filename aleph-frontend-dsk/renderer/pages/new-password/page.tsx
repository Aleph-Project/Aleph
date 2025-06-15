"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { resetPassword } from "@/renderer/services/electronAuthService"

export default function NewPasswordPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()
    const email = searchParams?.get("email") || ""
    const code = searchParams?.get("code") || ""

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword)
    }

    // Simple password security check (igual que en register)
    function isPasswordSecure(pw: string) {
        // Al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(pw)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        if (!isPasswordSecure(password)) {
            setError("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.")
            return
        }
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.")
            return
        }
        try {
            await resetPassword(email, code, password)
            setSuccess(true)
            setTimeout(() => router.push("/login/page"), 2000)
        } catch (err: any) {
            setError(err?.response?.data?.error || "No se pudo cambiar la contraseña.")
        }
    }

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Title */}
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-40">
                <h1 className="text-4xl md:text-6xl font-bold text-white text-center">Nueva Contraseña</h1>
            </div>

            {/* Vinyl record and logo */}
            <div className="absolute top-1/2 left-52 transform -translate-y-1/2 -translate-x-1/4 z-20">
                <div className="relative min-w-[400px] mx-auto">
                    <Image
                        src="/Vinilo.png"
                        alt="Vinyl Record"
                        width={450}
                        height={450}
                        className="animate-spin-slow object-cover aspect-square overflow-visible"
                        style={{ animationDuration: "20s" }}
                    />
                    <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 z-30">
                        <Image
                            src="/Logo.png"
                            alt="Aleph Logo"
                            width={150}
                            height={40}
                            className="object-contain object-center w-[100%] max-w-[150px] mx-auto"
                        />
                    </div>
                </div>
            </div>

            {/* New password form container */}
            <div className="w-full rounded-3xl z-10 absolute top-1/2 left-1/4 transform -translate-y-1/2 flex content-center justify-start bg-gradient-to-t from-black to-transparent">
                <div className="lg:basis-[50%] sm:basis-[80%] bg-violet-400 pt-16 px-12 pb-8 pl-48 rounded-3xl">
                    <h2 className="text-xl font-bold text-black mb-4">Ingresa tu nueva contraseña:</h2>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Nueva Contraseña
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full pr-10 text-gray-950"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                                Confirma tu nueva contraseña
                            </label>
                            <div className="relative">
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full pr-10 text-gray-950"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={toggleConfirmPasswordVisibility}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {error && <div className="text-red-700 text-sm text-center">{error}</div>}
                        {success && <div className="text-green-700 text-sm text-center">¡Contraseña cambiada! Redirigiendo...</div>}

                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                            Guardar Contraseña
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
