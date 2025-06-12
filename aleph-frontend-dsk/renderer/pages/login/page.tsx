"use client"

import { signIn } from "next-auth/react";
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false)

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true)
        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
            callbackUrl: "/",
        });
        setLoading(false)
        if (res?.error) {
            // Manejo de error personalizado
            try {
                const errObj = JSON.parse(res.error)
                if (errObj?.error === "Invalid credentials") {
                    setError("Correo o contraseña incorrectos.")
                } else if (errObj?.error === "Account not activated") {
                    setError("Tu cuenta no está activada. Por favor revisa tu correo para activarla.")
                } else {
                    setError("No se pudo iniciar sesión. Intenta de nuevo.")
                }
            } catch {
                setError("No se pudo iniciar sesión. Intenta de nuevo.")
            }
        } else if (!res?.ok) {
            setError("No se pudo iniciar sesión. Intenta de nuevo.")
        } else {
            setError("")
            // Redirige si es exitoso
            window.location.href = res.url || "/"
        }
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Welcome title */}
            <div className="absolute top-24 right-14 z-40">
                <h1 className="text-4xl md:text-6xl font-bold text-white text-center">¡Bienvenido<br></br> a Aleph!</h1>
            </div>
            
            {/* Vinyl record image */}
            <div className="absolute top-44 left-1/2 transform -translate-x-1/2 -translate-y-1/3 z-20">
                <div className="relative min-w-[450px] mx-auto">
                    <Image
                        src="/Vinilo.png"
                        alt="Vinyl Record"
                        width={450}
                        height={450}
                        className="animate-spin-slow object-cover aspect-square overflow-visible"
                        style={{ animationDuration: "20s" }}
                    />
                </div>
            </div>
            {/* Logo positioned above the vinyl */}
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 z-30">
                <Image
                    src="/Logo.png"
                    alt="Aleph Logo"
                    width={250}
                    height={60}
                    className="object-contain object-center w-[100%] max-w-[250px] mx-auto"
                />
            </div>

            {/* Login form container */}
            <div className="w-full rounded-t-3xl z-10 absolute bottom-0 flex content-center justify-center bg-gradient-to-t from-black to-transparent">
                <div className="lg:basis-[50%] sm:basis-[80%] bg-violet-400 pt-24 px-32 pb-8 rounded-t-3xl ">
                    <h2 className="text-2xl font-bold text-black mb-6">Iniciar Sesión</h2>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Correo electrónico o usuario
                            </label>
                            <Input
                                id="email"
                                type="text"
                                placeholder="ejemplo@correo.com"
                                className="w-full text-gray-950"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full pr-10 text-gray-950"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
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

                        {error && (
                            <div className="text-red-600 text-sm text-center">{error}</div>
                        )}

                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                        </Button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">O continuar con</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <Button
                                variant="outline"
                                className="w-full border-gray-300 text-black"
                                type="button"
                                onClick={() => signIn("google", { callbackUrl: "/home" })}
                            >
                                <Image src="/placeholder.svg?height=20&width=20" alt="Google" width={20} height={20} className="mr-2" />
                                Google
                            </Button>
                        </div>

                        <div className="text-center text-sm text-gray-600 space-y-2 mt-6">
                            <p>
                                ¿No tienes una cuenta?{" "}
                                <Link href="/register/page" className="text-purple-600 hover:underline">
                                    Regístrate
                                </Link>
                            </p>
                            <p>
                                <Link href="/forgot-password/page" className="text-purple-600 hover:underline">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
