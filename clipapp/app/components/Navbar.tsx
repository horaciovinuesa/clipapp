'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-green-600 p-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Site Title and Icon */}
        <Link href="/" className="flex items-center text-white text-2xl font-bold">
          <Image
            src="/images/main_icon.png"
            alt="ClipApp Icon"
            width={40}
            height={40}
            className="mr-2"
          />
          ClipApp
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-5">
          <Link href="/" className="text-white hover:text-gray-200 transition-colors">Inicio</Link>
          <Link href="/clima" className="text-white hover:text-green-100 bg-green-700/80 hover:bg-green-700 px-3 py-1.5 rounded-lg border border-green-400/40 font-semibold transition-all shadow-sm flex items-center gap-1.5">
            <span>🌦️</span> Clima
          </Link>
          <Link href="/quienes-somos" className="text-white hover:text-gray-200 transition-colors">Quienes Somos</Link>
          <Link href="/nuestra-app" className="text-white hover:text-gray-200 transition-colors">Que hace nuestra App?</Link>
          <Link href="/subi-tus-vias" className="text-white hover:text-gray-200 transition-colors">Subí tus Vías</Link>
          <Link href="/ayuda" className="text-white hover:text-gray-200 transition-colors">Ayuda</Link>
        </div>

        {/* Hamburger Icon for Mobile */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden flex flex-col items-center space-y-3 bg-green-600 p-4 border-t border-green-500/50">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-gray-200">Inicio</Link>
          <Link href="/clima" onClick={() => setIsMenuOpen(false)} className="text-white bg-green-700 px-4 py-1.5 rounded-lg border border-green-400/50 font-bold">
            🌦️ Clima en Sectores
          </Link>
          <Link href="/quienes-somos" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-gray-200">Quienes Somos</Link>
          <Link href="/nuestra-app" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-gray-200">Que hace nuestra App?</Link>
          <Link href="/subi-tus-vias" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-gray-200">Subí tus Vías</Link>
          <Link href="/ayuda" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-gray-200">Ayuda</Link>
        </div>
      )}
    </nav>
  );
}