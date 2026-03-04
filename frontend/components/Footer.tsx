"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#8795B3]/25 relative z-10 bg-[#0F172B33] backdrop-blur-md">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Yield Router</h3>
            <p className="text-[#8795B3] text-sm">
              Cross-chain yield optimization on Polkadot
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#features"
                  className="text-[#8795B3] hover:text-white transition-colors text-sm"
                >
                  Docs
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8795B3] hover:text-white transition-colors text-sm"
                >
                  Github
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Social</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8795B3] hover:text-white transition-colors text-sm"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-[#8795B3] text-sm">
            © 2024 Yield Router. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
