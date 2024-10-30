'use client'; // Add this at the top of the file

import Image from 'next/image';
import Layout from './components/Layout';

export default function Home() {

  return (
    <Layout>
      {/* Hero Section - Smaller Height */}
      <div className="relative bg-cover bg-center h-80">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-image.jpg"
            alt="Hero Background"
            layout="fill"
            objectFit="cover"
            className="filter blur-md"
          />
        </div>
        
        {/* Text Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white backdrop-blur-md bg-green-800/30">
          <h1 className="text-4xl font-bold">Bienvenidos a ClipApp</h1>
          <p className="text-lg mt-4 max-w-xl text-center">
            La mejor guía de escalada en Córdoba, Argentina. Explora zonas, mapas y pautas para mejorar tu experiencia de escalada.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-8 md:py-16 bg-gray-100 relative z-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-green-700 mb-8">Características Principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white shadow-lg p-6 rounded-lg text-center">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <Image
                  src="/images/climbing-zone.jpg"
                  alt="Zonas de Escalada"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              </div>
              <h3 className="text-xl font-bold text-green-700">Guias Actualizadas</h3>
              <p className="text-gray-600 mt-2">Encontra las mejores guias de las zonas de escalada en Córdoba y sus alrededores.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white shadow-lg p-6 rounded-lg text-center">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <Image
                  src="/images/interactive-map.jpg"
                  alt="Mapas Interactivos"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              </div>
              <h3 className="text-xl font-bold text-green-700">Mapas Interactivos</h3>
              <p className="text-gray-600 mt-2">Navega con mapas detallados y llega fácilmente a tu próxima aventura o pale amiga.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white shadow-lg p-6 rounded-lg text-center">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <Image
                  src="/images/guidelines.jpg"
                  alt="Pautas de Seguridad"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              </div>
              <h3 className="text-xl font-bold text-green-700">Todas tus zonas en un solo lugar</h3>
              <p className="text-gray-600 mt-2">Con esta app vas a poder ver todos tus sectores y vias sin conexion a internet</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action with Download Links */}
      <section className="py-16 bg-green-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Descarga ClipApp Hoy</h2>
        <p className="text-lg mb-8">Lleva la guía de escalada contigo a donde vayas.</p>
        <div className="flex justify-center space-x-8">
          <a href="https://play.google.com/store/apps/dev?id=9035844281138611591" target="_blank" rel="noopener noreferrer">
            <Image
              src="/images/androidstore.png"
              alt="Android Store"
              width={150}
              height={50}
              className="hover:scale-105 transition-transform duration-300"
            />
          </a>
          <a href="https://apps.apple.com/ar/app/clip-app/id6736478682" target="_blank" rel="noopener noreferrer">
            <Image
              src="/images/appstore.png"
              alt="App Store"
              width={150}
              height={50}
              className="hover:scale-105 transition-transform duration-300"
            />
          </a>
        </div>
      </section>
    </Layout>
  );
}