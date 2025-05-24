"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword)
    }

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Title */}
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-40">
                <h1 className="text-4xl md:text-6xl font-bold text-white text-center">Regístrate</h1>
            </div>

            {/* Vinyl record image */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="relative min-w-[700px] mx-auto">
                    <Image
                        src="/Vinilo.png"
                        alt="Vinyl Record"
                        width={900}
                        height={500}
                        className="object-contain animate-spin-slow object-center"
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

            {/* Register form container */}
            <div className="w-full rounded-3xl z-10 absolute my-48 flex content-center justify-start bg-gradient-to-t from-black to-transparent">
                <div className="lg:basis-[50%] sm:basis-[80%] bg-violet-400 pt-24 pl-8 pr-72 pb-8 rounded-r-3xl">
                    <h2 className="text-2xl font-bold text-black mb-6">Crear Cuenta</h2>

                    <form className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-gray-700">
                                Nombre
                            </label>
                            <Input id="name" type="text" placeholder="Tu nombre" className="w-full text-gray-950" />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Correo electrónico
                            </label>
                            <Input id="email" type="email" placeholder="ejemplo@correo.com" className="w-full text-gray-950" />
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
                                Confirma tu contraseña
                            </label>
                            <div className="relative">
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full pr-10 text-gray-950"
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

                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                            ¡Crear Cuenta!
                        </Button>

                        <div className="text-center text-sm text-gray-600 space-y-2 mt-6">
                            <p>
                                ¿Ya tienes una cuenta?{" "}
                                <Link href="/login" className="text-purple-600 hover:underline">
                                    Inicia sesión
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
