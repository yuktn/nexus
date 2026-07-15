"use client";
import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center">
        <Link href="https://status.yuktn.dev" className="font-bold text-3xl">status@yuktn.dev</Link>
        <div className="hidden md:flex space-x-4">
          <Link href="https://yuktn.dev">MORE</Link><Link href="https://github.com/yuktn" target="_blank" rel="noopener noreferrer" className="flex items-center"> GitHub <ExternalLink size={16} /></Link>
        </div>
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>Menu</button>
      </div>
      {isOpen && <div className="md:hidden">...Links...</div>}
    </nav>
  );
}
