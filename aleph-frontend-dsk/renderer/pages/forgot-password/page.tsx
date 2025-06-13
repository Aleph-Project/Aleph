"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { requestResetCode, verifyResetCode } from "@/renderer/services/authService"
import OtpModal from "@/renderer/components/codigo-otp/page"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [otpError, setOtpError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [otp, setOtp] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage("")
        try {
            await requestResetCode(email)
            setIsDialogOpen(true)
        } catch (err: any) {
            setErrorMessage(err?.response?.data?.error || "No se pudo enviar el código. Intenta de nuevo.")
        }
    }

    const handleOtpSubmit = async () => {
        setOtpError(false)
        try {
            await verifyResetCode(email, otp)
            setIsDialogOpen(false)
            router.push(`/new-password/page?email=${encodeURIComponent(email)}&code=${otp}`)
        } catch (err: any) {
            setOtpError(true)
        }
    }

    const handleResendCode = async () => {
        setOtp("")
        setOtpError(false)
        try {
            await requestResetCode(email)
        } catch {}
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
            {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Verificación de código</DialogTitle>
                        <DialogDescription>
                            Ingresa el código que hemos enviado a tu correo electrónico.
                        </DialogDescription>
                    </DialogHeader>
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                        <InputOTPGroup className="text-black">
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSeparator className="mx-2" />
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
                            <Button variant="ghost" className="bg-gray-500 hover:bg-gray-600">Cancelar</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}
            <OtpModal 
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
                otp={otp}
                setOtp={setOtp}
                otpError={otpError}
                handleOtpSubmit={handleOtpSubmit}
                handleResendCode={handleResendCode}
            />
        </div>
    )
}
