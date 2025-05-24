export function extractAuthIdFromUser(sub: string): string | null {
    const parts = sub.split("|");
    if (parts.length > 1) {
        return parts[1]; // Devuelve la parte después del "|"
    }
    return null; // Devuelve una cadena vacía si no hay parte después del "|"
}