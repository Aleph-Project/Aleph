import axios from "axios";
import https from "https";

const api = axios.create({
  baseURL: process.env.API_BASE_URL || "https://localhost:444",
  headers: {
    Host: "aleph-dsk",
    "Content-Type": "application/json"
  },
  httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Permite certificados self-signed
});

export default api;