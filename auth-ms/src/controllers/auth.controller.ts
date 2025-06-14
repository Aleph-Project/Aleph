import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body;
    const user = await userService.register(name, email, password);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const { user, token } = await userService.login(email, password);
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
}

export async function activate(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.body;
    const user = await userService.activateUser(token);
    res.json({ user, message: "Cuenta activada correctamente" });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    await userService.sendPasswordResetCode(email);
    res.json({ message: "Código enviado al correo" });
  } catch (err) {
    next(err);
  }
}

export async function verifyCode(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, code } = req.body;
    await userService.verifyResetCode(email, code);
    res.json({ message: "Código válido" });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, code, newPassword } = req.body;
    await userService.resetPassword(email, code, newPassword);
    res.json({ message: "Contraseña actualizada" });
  } catch (err) {
    next(err);
  }
}

export async function registerdsk(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body;
    const result = await userService.registerdsk(name, email, password);
    // Devuelve el código en la respuesta
    res.status(201).json({ user: { id: result.id, name: result.name, email: result.email }, code: result.code });
  } catch (err) {
    next(err);
  }
}

export async function activateDsk(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, code } = req.body;
    const user = await userService.activateUserDsk(email, code);
    res.json({ user, message: "Cuenta activada correctamente" });
  } catch (err) {
    next(err);
  }
}
