import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendActivationEmail, sendResetCodeEmail, sendActivationEmailDsk } from "./email.service";
import { UserRepository } from "../repository/user.repository";
import { IUser } from "../models/user.mongo.model";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const userRepository = new UserRepository();

// Almacén temporal de códigos de recuperación y DSK
const resetCodes: { [email: string]: { code: string, expires: number } } = {};
const dskCodes: { [email: string]: { code: string, expires: number } } = {};

export async function register(name: string, email: string, password: string) {
  const exists = await userRepository.findByEmail(email);
  if (exists) throw new Error("Email already registered");
  const hashed = await bcrypt.hash(password, 10);
  const user = await userRepository.create({ name, email, password: hashed });
  // Generar token de activación
  const activationToken = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
  const activationLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/activate?token=${activationToken}`;
  await sendActivationEmail(user.email, activationLink);
  return { id: user._id, name: user.name, email: user.email };
}

export async function login(email: string, password: string) {
  const user = await userRepository.findByEmail(email);
  if (!user) throw new Error("Invalid credentials");
  if (!user.active) throw new Error("Account not activated");
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");
  const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "1h" });
  return { user: { id: user._id, name: user.name, email: user.email }, token };
}

export async function activateUser(token: string) {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = await userRepository.findById(payload.id);
    if (!user || user.email !== payload.email) throw new Error("Invalid activation link");
    if (user.active) return { id: user._id, name: user.name, email: user.email };
    await userRepository.updateActive((user._id as any).toString(), true);
    return { id: user._id, name: user.name, email: user.email };
  } catch {
    throw new Error("Invalid or expired activation link");
  }
}

export async function sendPasswordResetCode(email: string) {
  const user = await userRepository.findByEmail(email);
  if (!user) throw new Error("Correo no registrado");
  // Generar código de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  resetCodes[email] = { code, expires: Date.now() + 10 * 60 * 1000 }; // 10 minutos
  await sendResetCodeEmail(email, code);
}

export async function verifyResetCode(email: string, code: string) {
  const entry = resetCodes[email];
  if (!entry || entry.code !== code || entry.expires < Date.now()) throw new Error("Código inválido o expirado");
  return true;
}

export async function resetPassword(email: string, code: string, newPassword: string) {
  await verifyResetCode(email, code);
  const user = await userRepository.findByEmail(email);
  if (!user) throw new Error("Correo no registrado");
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  delete resetCodes[email];
}

export async function registerdsk(name: string, email: string, password: string) {
  const exists = await userRepository.findByEmail(email);
  if (exists) throw new Error("Email already registered");
  const hashed = await bcrypt.hash(password, 10);
  const user = await userRepository.create({ name, email, password: hashed, active: false });
  // Generar código de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  dskCodes[email] = { code, expires: Date.now() + 10 * 60 * 1000 }; // 10 minutos
  await sendActivationEmailDsk(email, code);
  return { id: user._id, name: user.name, email: user.email, code };
}

export async function activateUserDsk(email: string, code: string) {
  const entry = dskCodes[email];
  if (!entry || entry.code !== code || entry.expires < Date.now()) throw new Error("Código inválido o expirado");
  const user = await userRepository.findByEmail(email);
  if (!user) throw new Error("Correo no registrado");
  if (user.active) return { id: user._id, name: user.name, email: user.email };
  await userRepository.updateActive((user._id as any).toString(), true);
  delete dskCodes[email];
  return { id: user._id, name: user.name, email: user.email };
}
