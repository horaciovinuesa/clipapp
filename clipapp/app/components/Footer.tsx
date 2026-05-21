// Footer Component (components/Footer.tsx)

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-green-700 text-white py-4 text-center">
      <div className="container mx-auto flex flex-col items-center">
        <p className="text-sm mb-2">
          <Link href="/politica-de-privacidad" className="hover:text-gray-300">Política de Privacidad</Link> | 
          <Link href="/terminos-y-condiciones" className="hover:text-gray-300 mx-2">Términos y Condiciones</Link> | 
          <Link href="/admin" className="hover:text-gray-300 ml-2">Panel de admin</Link>
        </p>
        <Image
          src="/images/main_icon.png"
          alt="ClipApp Icon"
          width={30}
          height={30}
        />
        <p className="text-xs mt-2">© 2024 ClipApp - Guía de Escalada en Córdoba, Argentina</p>
      </div>
    </footer>
  );
}