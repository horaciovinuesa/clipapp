// Footer Component (components/Footer.tsx)

import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-green-700 text-white py-4 text-center">
      <div className="container mx-auto flex flex-col items-center">
        <p className="text-sm mb-2">
          <a href="/politica-de-privacidad" className="hover:text-gray-300">Política de Privacidad</a> | 
          <a href="/terminos-y-condiciones" className="hover:text-gray-300 ml-2">Términos y Condiciones</a>
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