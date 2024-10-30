'use client';

import Image from 'next/image';
import Layout from '../components/Layout';

export default function NuestraApp() {
  return (
    <Layout>
      {/* Hero Section with Background Image */}
      <div className="relative bg-cover bg-center h-80">
        <div className="absolute inset-0">
          <Image
            src="/images/bg_sample_3.jpg"
            alt="Nuestra App Background"
            layout="fill"
            objectFit="cover"
            className="filter blur-md"
          />
        </div>

        {/* Text Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white backdrop-blur-md bg-green-800/30">
          <h1 className="text-4xl font-bold">Nuestra App</h1>
          <p className="text-lg mt-4 max-w-xl text-center">
            ClipApp está diseñada para escaladores de Córdoba, Argentina, disponible tanto en iOS como en Android y completamente funcional offline. 
            Lleva toda la información sobre zonas de escalada contigo, sin necesidad de conexión a internet.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <section className="py-16 bg-gray-100 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-green-700 mb-8">Características Principales</h2>
          <p className="text-lg text-gray-700 mb-4">
            ClipApp es una aplicación móvil que te ofrece acceso a todas las zonas de escalada de Córdoba, junto con mapas interactivos y pautas de seguridad. 
            Todo esto está disponible incluso sin conexión a internet, lo que la convierte en una herramienta imprescindible para los escaladores en cualquier lugar.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            Disponible para descargar tanto en dispositivos iOS como Android, ClipApp asegura que puedas acceder a toda la información necesaria mientras exploras nuevas rutas. 
            Con una interfaz intuitiva y mapas interactivos, la app está diseñada para ser tu mejor compañera de escalada.
          </p>
          <p className="text-lg text-gray-700">
            Ya sea que estés buscando una nueva ruta o quieras mantenerte seguro con nuestras pautas de seguridad, ClipApp te tiene cubierto. 
            ¡Descárgala ahora y lleva la guía de escalada contigo, sin importar dónde te encuentres!
          </p>
        </div>
      </section>
      
      {/* Download Section */}
      <section className="py-16 bg-green-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Descarga ClipApp Hoy</h2>
        <p className="text-lg mb-8">Disponible en iOS y Android para uso offline.</p>
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