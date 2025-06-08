import "./config/env";
import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 4000;

connectDB();

app.listen(PORT, () => {
    console.log(`Servicio de autenticación en el puerto: ${PORT}`);
});
