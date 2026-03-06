"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  LayoutDashboard,
  Landmark,
  GitBranch,
  Trophy,
  User,
  Wallet,
  Route,
  X,
  type LucideIcon,
} from "lucide-react";

const navItems = [
  { name: "Home", href: "/landing", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Vault", href: "/deposit", icon: Landmark },
  { name: "Strategies", href: "/strategies", icon: GitBranch },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Wallet", href: "/wallet", icon: Wallet },
] as const satisfies readonly { name: string; href: string; icon: LucideIcon }[];

export default function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const SidebarContent = ({
    onNavigate,
    onClose,
    isMobile = false,
  }: {
    onNavigate?: () => void;
    onClose?: () => void;
    isMobile?: boolean;
  }) => (
    <div
      className={`p-6 h-full flex flex-col border border-dashed border-[#dbe3f5]/60 rounded-3xl ${
        isMobile ? "bg-[#0B1424]/90 backdrop-blur-2xl" : ""
      }`}
    >
      <div className="mb-8 flex items-center justify-between gap-3">
        <Link href="/landing" className="min-w-0" onClick={onNavigate}>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Route className="w-5 h-5 md:w-6 md:h-6 text-[#8795B3]" strokeWidth={2.4} />
            <span className="truncate">Yield Router</span>
          </h2>
        </Link>
        {isMobile && (
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="text-white p-2 rounded-lg border border-[#8795B3]/25 bg-[#0F172B]/60 hover:bg-[#1B273D]/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center px-4 py-2.5 rounded-lg transition-all ${
                isActive
                  ? "text-white border border-[#8795B3]/50"
                  : "text-[#8795B3] hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 mr-3 shrink-0" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      {!isOpen && (
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <div className="absolute inset-0 bg-[#0B1424]/80 backdrop-blur-xl rounded-lg -m-2" />
        <button
          onClick={() => setIsOpen(true)}
          className="relative p-3 rounded-lg text-white border border-dashed border-[#dbe3f5]/60 cursor-pointer"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed top-0 left-0 h-screen w-64 rounded-r-3xl z-40 p-3">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 h-dvh min-h-dvh w-64 rounded-r-3xl z-40 p-3"
          >
            <SidebarContent onNavigate={() => setIsOpen(false)} onClose={() => setIsOpen(false)} isMobile />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 h-dvh min-h-dvh bg-[#020817]/88 backdrop-blur-xl z-30 md:hidden"
        />
      )}
    </>
  );
}
