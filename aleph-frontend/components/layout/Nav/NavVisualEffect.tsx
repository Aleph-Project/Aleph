import { useState, useEffect, useCallback } from "react";

// Hook para detectar scroll y devolver si está scrolleado
export function useNavbarScroll(threshold: number = 50): boolean {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > threshold);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [threshold]);

    return isScrolled;
}

// Hook para manejar el menú móvil
export function useMobileMenu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = useCallback(() => {
        setIsMenuOpen((open) => !open);
    }, []);

    const closeMenu = useCallback(() => {
        setIsMenuOpen(false);
    }, []);

    return { isMenuOpen, toggleMenu, closeMenu };
}
