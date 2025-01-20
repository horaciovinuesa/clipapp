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
            Tu compañera ideal para la escalada en Córdoba. Todo lo que necesitas, siempre disponible offline.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-gray-100 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-green-700 mb-8">¿Qué ofrece ClipApp?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white shadow-lg p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-700">Modo Offline</h3>
              <p className="text-gray-700 mt-2">Consulta toda la información sin conexión a internet.</p>
            </div>
            <div className="bg-white shadow-lg p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-700">Todo en un solo lugar</h3>
              <p className="text-gray-700 mt-2">Encuentra las mejores vías y sectores actualizados en un solo lugar.</p>
            </div>
            <div className="bg-white shadow-lg p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-700">Donaciones</h3>
              <p className="text-gray-700 mt-2">Apoya la apertura de nuevas rutas y el mantenimiento de áreas existentes.</p>
            </div>
            <div className="bg-white shadow-lg p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-700">Push Notifications</h3>
              <p className="text-gray-700 mt-2">Mantente informado con las últimas actualizaciones y eventos.</p>
            </div>
            <div className="bg-white shadow-lg p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-700">Interfaz Intuitiva</h3>
              <p className="text-gray-700 mt-2">Diseño fácil de usar para encontrar lo que necesitas rápidamente.</p>
            </div>
            <div className="bg-white shadow-lg p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-700">Actualizaciones Constantes</h3>
              <p className="text-gray-700 mt-2">Nueva información y mejoras continuas para tu experiencia.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-16 bg-green-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Descarga ClipApp Hoy</h2>
        <p className="text-lg mb-8">Disponible en iOS y Android.</p>
        <div className="flex justify-center space-x-8">
          <a href="https://play.google.com/store/apps/details?id=com.horaciovinuesa.escalando_cordoba" target="_blank" rel="noopener noreferrer">
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