"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navigation() {
  return (
    <nav className="glass-card border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-white">
            Yield Router
          </Link>
          <div className="flex gap-4 items-center">
            <Link
              href="/deposit"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Deposit
            </Link>
            <Link
              href="/withdraw"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Withdraw
            </Link>
            <Link
              href="/strategies"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Strategies
            </Link>
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
