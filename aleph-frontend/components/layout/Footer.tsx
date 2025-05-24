"use client";

import Link from "next/link";
import { 
  LinkedinIcon, 
  TwitterIcon, 
  InstagramIcon, 
  GithubIcon, 
  ArrowUpRight 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  // Función para volver arriba cuando se hace clic en el botón
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  
  return (
    <footer className="w-full bg-black/30 backdrop-blur-sm border-t border-white/10 mt-auto">
      <div className="container mx-auto px-8 py-16">
        {/* Top section with logo, nav and newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
          {/* Logo and description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <h2 className="text-2xl font-bold tracking-tight">Aleph</h2>
            </Link>
            <p className="text-sm text-white/70 max-w-xs">
              Crafting narrative through design. 
              We believe good design is key to building strong connections.
            </p>
          </div>
          
          {/* Navigation links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-white/80">Explore</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about-us" className="text-sm text-white/60 hover:text-purple-300 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/lanzamientos" className="text-sm text-white/60 hover:text-purple-300 transition-colors">
                    Lanzamientos
                  </Link>
                </li>
                <li>
                  <Link href="/project" className="text-sm text-white/60 hover:text-purple-300 transition-colors">
                    Project
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm text-white/60 hover:text-purple-300 transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-3 text-white/80">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-sm text-white/60 hover:text-purple-300 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-white/60 hover:text-purple-300 transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Newsletter subscription */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold mb-3 text-white/80">Get updates</h3>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/10 px-4 py-2 rounded-md text-sm flex-grow focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <Button size="sm" variant="outline" className="border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-white/40">
              We'll only send you relevant updates.
            </p>
          </div>
        </div>
        
        
        
        {/* <Separator className="bg-white/10" /> */}
        
        {/* Bottom section with social media and copyright */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center pt-8">
          <div className="flex gap-6">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-purple-300 transition-colors">
              <LinkedinIcon size={18} />
              <span className="sr-only">LinkedIn</span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-purple-300 transition-colors">
              <TwitterIcon size={18} />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-purple-300 transition-colors">
              <InstagramIcon size={18} />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-purple-300 transition-colors">
              <GithubIcon size={18} />
              <span className="sr-only">GitHub</span>
            </a>
            <a href="https://open.spotify.com/user/YOUR_SPOTIFY_USERNAME" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-green-500 transition-colors">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <span className="sr-only">Spotify</span>
            </a>
          </div>
          
          <div className="text-sm text-white/40">
            &copy; {currentYear} Aleph Design Studio. All rights reserved.
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white/60 hover:text-purple-300"
            onClick={scrollToTop}
          >
            <span className="flex items-center gap-1">
              Back to top
              <ArrowUpRight size={16} />
            </span>
          </Button>
        </div>
      </div>
    </footer>
  );
}