import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-green-600 p-4">
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
        <div className="hidden md:flex space-x-4">
          <Link href="/" className="text-white hover:text-gray-300">Inicio</Link>
          <Link href="/quienes-somos" className="text-white hover:text-gray-300">Quienes Somos</Link>
          <Link href="/nuestra-app" className="text-white hover:text-gray-300">Nuestra App</Link>
          <Link href="/ayuda" className="text-white hover:text-gray-300">Ayuda</Link>
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
        <div className="md:hidden flex flex-col items-center space-y-2 bg-green-600 p-4">
          <Link href="/" className="text-white hover:text-gray-300">Inicio</Link>
          <Link href="/quienes-somos" className="text-white hover:text-gray-300">Quienes Somos</Link>
          <Link href="/nuestra-app" className="text-white hover:text-gray-300">Nuestra App</Link>
          <Link href="/ayuda" className="text-white hover:text-gray-300">Ayuda</Link>
        </div>
      )}
    </nav>
  );
}