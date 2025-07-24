import { Request, Response, NextFunction } from "express";

export function frontTokenMiddleware(req: Request, res: Response, next: NextFunction): void {
    // Solo si el header Host es exactamente "aleph-dsk", permite la solicitud sin validar el token
    if (req.headers.host === "aleph-dsk") {
        next();
        return;
    }
    const token = req.header("x-auth-front-token");
    if (!token || token !== process.env.AUTH_FRONT_TOKEN) {
        res.status(401).json({ error: "Unauthorized: Invalid front token" });
        return;
    }
    next();
}
