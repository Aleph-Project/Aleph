"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useNavbarScroll, useMobileMenu } from "./NavVisualEffect";
import AuthButtons from "./AuthButtons";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const isScrolled = useNavbarScroll();
  const { isMenuOpen, toggleMenu, closeMenu } = useMobileMenu();
  const { data: session, status } = useSession();
  // Obtener el id del usuario desde session.user.id si existe
  const user = session?.user;
  const userId = user?.email;
  const isLoading = status === "loading";

  const navigation = user
    ? [
        // { name: "Play now", href: "/music-player" },
        // { name: "Perfil", href: "/profile" },
        // { name: "Buscar canciones", href: "/reviews/browser" },
      ]
    : [
        // { name: "Lanzamientos", href: "/lanzamientos" },
        // { name: "Ranking", href: "/ranking" },
        // { name: "Albums", href: "/albums" },
        { name: "Sobre Nosotros", href: "/sobre-nosotros/page" }
      ];

  return (
    <nav
      className={cn(
      "fixed top-0 w-full px-8 sm:px-12 md:px-16 py-4 pb-8 flex justify-between items-center z-50 transition-all duration-300",
      isScrolled ? "bg-black/70 backdrop-blur-md shadow-lg" : "bg-transparent"
      )}
    >
      {/* Logo */}
      <Link href="/home" className="text-2xl font-bold tracking-tight flex items-center gap-2 z-50">
      <Image src="/Logo.png" alt="Logo" width={150} height={100} style={{ height: "auto" }} />
      </Link>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center pb-4">
        <nav className="flex space-x-8 mr-8">
          {navigation.map((item) => (
          <Link 
            key={item.name} 
            href={item.href} 
            className="hover:text-purple-300 transition-colors text-sm"
          >
            {item.name}
          </Link>
          ))}
        </nav>
        {/* Usa AuthButtons en vez del botón de login */}
        <AuthButtons />
      </div>
      
      {/* Mobile menu button */}
      <button 
      className="md:hidden z-50"
      onClick={toggleMenu}
      aria-label="Toggle menu"
      >
      {isMenuOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <Menu className="h-6 w-6" />
      )}
      </button>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-40 flex flex-col items-center justify-center md:hidden">
        <nav className="flex flex-col items-center space-y-8 mb-12">
        {navigation.map((item) => (
          <Link 
          key={item.name} 
          href={item.href} 
          className="text-xl font-medium hover:text-purple-300 transition-colors"
          onClick={closeMenu}
          >
          {item.name}
          </Link>
        ))}
        </nav>
        {/* Usa AuthButtons también en mobile */}
        <div onClick={closeMenu}>
        <AuthButtons />
        </div>
        
        {/* Mobile footer with social links */}
        <div className="absolute bottom-8 flex gap-4">
        <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-green-500 transition-colors">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-purple-300 transition-colors">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        </a>
        </div>
      </div>
      )}
      
      {/* Indicator for scrolled state - optional design element */}
      <div 
      className={cn(
        "absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300",
        isScrolled ? "w-full opacity-100" : "w-0 opacity-0"
      )}
      />
    </nav>
  );
}