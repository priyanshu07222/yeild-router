"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import { Route, X } from "lucide-react";

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0F172B]/90 backdrop-blur-2xl border-b border-[#8795B3]/30 shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
          : "bg-[#0F172B33] backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Route className="h-6 w-6 text-[#8795B3]" strokeWidth={2.4} />
            <div className="text-2xl font-bold text-white">Yield Router</div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12 absolute left-1/2 -translate-x-1/2">
            <Link
              href="#features"
              className="text-[#8795B3] hover:text-white transition-colors text-sm font-medium"
            >
              Docs
            </Link>
            <Link
              href="/deposit"
              className="text-[#8795B3] hover:text-white transition-colors text-sm font-medium"
            >
              Dashboard
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8795B3] hover:text-white transition-colors text-sm font-medium"
            >
              Github
            </a>
          </div>

          <div className="hidden md:block">
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Slide Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="md:hidden fixed inset-0 h-dvh min-h-dvh z-[88] bg-[#020817]/90 backdrop-blur-2xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="md:hidden fixed top-0 right-0 h-dvh min-h-dvh w-[88%] max-w-sm z-[90] bg-[#0F172B] border-l border-[#8795B3]/20 p-6"
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-5 right-5 text-white p-2 rounded-lg border border-[#8795B3]/30 bg-[#111A2B]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between mb-8">
                <Link
                  href="/"
                  className="flex items-center gap-2.5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Route className="h-6 w-6 text-[#8795B3]" strokeWidth={2.4} />
                  <span className="text-2xl font-bold text-white">Yield Router</span>
                </Link>

              </div>

              <div className="mb-8">
                <ConnectButton />
              </div>

              <nav className="space-y-6">
                <Link
                  href="#features"
                  className="block text-[#8795B3] hover:text-white transition-colors text-4xl"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Docs
                </Link>
                <Link
                  href="/deposit"
                  className="block text-[#8795B3] hover:text-white transition-colors text-4xl"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[#8795B3] hover:text-white transition-colors text-4xl"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Github
                </a>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
