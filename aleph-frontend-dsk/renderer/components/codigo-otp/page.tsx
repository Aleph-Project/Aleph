"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";

import { Button } from "@/components/ui/button"
import { sq } from "date-fns/locale";

interface modalProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  otp: string;
  setOtp: (value: string) => void;
  otpError: boolean;
  handleOtpSubmit: () => void;
  handleResendCode?: () => void; 
  loading?: boolean;
  errorMessage?: string;
  onClose?: () => void;
}

export default function OtpModal({isDialogOpen, setIsDialogOpen, otp, setOtp, otpError, handleOtpSubmit, handleResendCode, loading=false, errorMessage="", onClose}: modalProps) {

  const handleClose = () => {
    if (onClose) {
      onClose();
    } 
    setIsDialogOpen(false);
  }
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
          <Button
            onClick={handleOtpSubmit}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Verificar
          </Button>
          <DialogClose asChild>
            <Button variant="ghost" className="bg-gray-500 hover:bg-gray-600">
              Cancelar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
