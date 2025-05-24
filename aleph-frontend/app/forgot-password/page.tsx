"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [otpError, setOtpError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [otp, setOtp] = useState("")
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Simulate email validation logic
        const isValidEmail = Math.random() < 0.7 // 70% chance of success
        if (isValidEmail) {
            setIsDialogOpen(true)
            setErrorMessage("")
        } else {
            setErrorMessage("Correo electrónico no válido")
        }
    }

    const handleOtpSubmit = () => {
        // Simulate OTP validation logic
        const isOtpValid = Math.random() < 0.7 // 70% chance of success
        if (isOtpValid) {
            console.log("OTP verified successfully")
            setIsDialogOpen(false)
            router.push("/new-password") // Redirect to the success page
        } else {
            setOtpError(true)
        }
    }

    const handleResendCode = () => {
        // Clear the previous OTP and simulate resending logic
        setOtp("")
        console.log("Resend code clicked")
        setOtpError(false)
    }

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Title */}
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-40">
                <h1 className="text-4xl md:text-6xl font-bold text-white text-center">Recupera tu <br />contraseña</h1>
            </div>

            {/* Vinyl record and logo */}
            <div className="absolute top-1/2 right-52 transform -translate-y-1/2 translate-x-1/4 z-20">
                <div className="relative min-w-[400px] mx-auto">
                    <Image
                        src="/Vinilo.png"
                        alt="Vinyl Record"
                        width={700}
                        height={500}
                        className="object-contain animate-spin-slow object-center"
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

            {/* Forgot password form container */}
            <div className="w-full rounded-3xl z-10 absolute top-1/2 left-1/4 transform -translate-y-1/2 flex content-center justify-start bg-gradient-to-t from-black to-transparent">
                <div className="lg:basis-[50%] sm:basis-[80%] bg-violet-400 pt-16 px-12 pb-8 pr-48 rounded-3xl">
                    <h2 className="text-xl font-bold text-black mb-4">Por favor, ingresa tu correo electrónico:</h2>
                    <p className="text-sm text-gray-700 mb-6">
                        Próximamente te enviaremos un correo
                    </p>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Correo electrónico
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ejemplo@correo.com"
                                className="w-full text-gray-950"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                            Enviar
                        </Button>
                    </form>
                </div>
            </div>

            {/* OTP Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Verificación de código</DialogTitle>
                        <DialogDescription>
                            Ingresa el código que hemos enviado a tu correo electrónico.
                        </DialogDescription>
                    </DialogHeader>
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSeparator />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                    {otpError && (
                        <div className="text-red-500 text-sm mt-4">
                            Código incorrecto.{" "}
                            <button
                                onClick={handleResendCode}
                                className="text-blue-500 underline"
                            >
                                Reenviar código
                            </button>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={handleOtpSubmit} className="bg-purple-600 hover:bg-purple-700">
                            Verificar
                        </Button>
                        <DialogClose asChild>
                            <Button variant="ghost">Cancelar</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
