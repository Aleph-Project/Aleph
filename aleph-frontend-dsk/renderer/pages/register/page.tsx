"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { register, activateUserDsk } from "@/renderer/services/electronAuthService";
import OtpModal from "@/renderer/components/codigo-otp/page";


export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [successDialogOpen, setSuccessDialogOpen] = useState(false)
    const router = useRouter()

    const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
    const [otpError, setOtpError] = useState(false);
    const [otpErrorMessage, setOtpErrorMessage] = useState("");
    const [otp, setOtp] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword)
    }

    // Simple password security check
    function isPasswordSecure(pw: string) {
        // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(pw)
    }

    // Simple email validation
    function isEmailValid(mail: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!name.trim()) {
            setError("El nombre es obligatorio.")
            return
        }
        if (!isEmailValid(email)) {
            setError("El correo electrónico no es válido.")
            return
        }
        if (!isPasswordSecure(password)) {
            setError("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.")
            return
        }
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.")
            return
        }

        setLoading(true)
        try {
            const res = await register({ name, email, password }); 
            console.log('Registration response:', res);
            
            if (res.success) {
                console.log('Registration successful, opening OTP modal');
                //abrir modal OTP para verificar
                setIsOtpDialogOpen(true);
                setOtpError(false);
                setOtpErrorMessage("");
                setOtp("");
            } else {
                setError(res.message || "Error al registrar. Intenta con otro correo o revisa los datos.");
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError("Error inesperado al registrar.");
        } finally {
            setLoading(false)
        }
    }


    const handleOtpSubmit = async () => {
        console.log('OTP Submit called with:', otp);
        
        if (!otp.trim()) {
            setOtpError(true);
            setOtpErrorMessage("Por favor ingresa el código de verificación");
            return;
        }

        setOtpError(false);
        setOtpLoading(true);
        setOtpErrorMessage("");
        
        try {
            console.log('Attempting to activate user with OTP...');
            const result = await activateUserDsk(email, otp.trim());
            console.log('Activation result:', result);
            
            if (result.success) {
                console.log('Account activated successfully, redirecting to home');
                // Activación exitosa - redirigir directamente a home
                setIsOtpDialogOpen(false);
                router.push('/login/page');
            } else {
                console.log('Activation failed:', result.message);
                // Error en la activación - mantener modal abierto
                setOtpError(true);
                setOtpErrorMessage(result.message || "Código inválido o expirado");
            }
        } catch (err: any) {
            console.error("Error en activación:", err);
            setOtpError(true);
            setOtpErrorMessage("Error al verificar el código");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleOtpModalClose = () => {
        console.log('Closing OTP modal');
        setIsOtpDialogOpen(false);
        setOtp("");
        setOtpError(false);
        setOtpErrorMessage("");
    };

    /*const handleSuccessDialogContinue = () => {
        console.log('Success dialog continue clicked');
        setSuccessDialogOpen(false);
        router.push("/login/page");
    } */

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Title */}
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-40">
                <h1 className="text-4xl md:text-6xl font-bold text-white text-center">Regístrate</h1>
            </div>

            {/* Vinyl record image */}
            <div className="absolute top-[52%] left-[52%] transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="relative min-w-[500px] mx-auto">
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

            {/* Register form container */}
            <div className="w-full rounded-3xl z-10 absolute my-48 flex content-center justify-start bg-gradient-to-t from-black to-transparent">
                <div className="lg:basis-[50%] sm:basis-[80%] bg-violet-400 pt-24 pl-8 pr-72 pb-8 rounded-r-3xl z-40">
                    <h2 className="text-2xl font-bold text-black mb-6">Crear Cuenta</h2>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-gray-700">
                                Nombre
                            </label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Tu nombre"
                                className="w-full text-gray-950"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

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
                                onChange={e => setEmail(e.target.value)}
                                required
                                disabled={loading}
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
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    tabIndex={-1}
                                    disabled={loading}
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
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={toggleConfirmPasswordVisibility}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    tabIndex={-1}
                                    disabled={loading}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm text-center">{error}</div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            disabled={loading}
                        >
                            {loading ? "Creando cuenta..." : "¡Crear Cuenta!"}
                        </Button>

                        <div className="text-center text-sm text-gray-600 space-y-2 mt-6">
                            <p>
                                ¿Ya tienes una cuenta?{" "}
                                <Link href="/login/page" className="text-purple-600 hover:underline">
                                    Inicia sesión
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/*<AlertDialog open={successDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-gray-700">¡Cuenta creada exitosamente!</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se ha enviado un correo de activación a tu dirección. Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogAction onClick={handleDialogContinue} className="bg-purple-600 text-white hover:bg-purple-700">
                        Ir a iniciar sesión
                    </AlertDialogAction>
                </AlertDialogContent>
            </AlertDialog>*/}

             <OtpModal 
                isDialogOpen={isOtpDialogOpen}
                setIsDialogOpen={setIsOtpDialogOpen}
                otp={otp}
                setOtp={setOtp}
                otpError={otpError}
                handleOtpSubmit={handleOtpSubmit}
                loading={otpLoading}
                errorMessage={otpErrorMessage}
                onClose={handleOtpModalClose}
            />
        </div>
    )
}
