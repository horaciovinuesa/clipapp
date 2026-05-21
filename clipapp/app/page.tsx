'use client';

import Image from 'next/image';
import Head from 'next/head';
import Layout from './components/Layout';

export default function Home() {
  return (
    <Layout>
      <Head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <title>ClipApp - Tu Guía de Escalada en Córdoba</title>
      </Head>

      {/* Hero Section - Modern and Beautiful */}
      <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              Bienvenid@s a <span className="text-green-200">ClipApp</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-green-50 mb-10 max-w-2xl mx-auto leading-relaxed">
              La guía definitiva para escalar en Córdoba. Encontrá sectores, mapas y toda la info que necesitás para tu próxima aventura.
            </p>

            {/* Download Buttons - Now at the top */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <a 
                href="https://play.google.com/store/apps/details?id=com.horaciovinuesa.escalando_cordoba" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <Image
                  src="/images/androidstore.png"
                  alt="Descargar en Google Play"
                  width={200}
                  height={66}
                  className="drop-shadow-lg"
                />
              </a>
              <a 
                href="https://apps.apple.com/ar/app/clip-app/id6736478682" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <Image
                  src="/images/appstore.png"
                  alt="Descargar en App Store"
                  width={200}
                  height={66}
                  className="drop-shadow-lg"
                />
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white">+50</div>
                <div className="text-xs md:text-sm text-green-100">Sectores</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white">+200</div>
                <div className="text-xs md:text-sm text-green-100">Vías</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white">24/7</div>
                <div className="text-xs md:text-sm text-green-100">Disponible</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Lo que te ofrece <span className="text-green-600">ClipApp</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitás para escalar en Córdoba, en un solo lugar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Guías Actualizadas</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Descubrí las mejores zonas de escalada en Córdoba, con información precisa y actualizada directamente de la comunidad.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Mapas Interactivos</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Llegá fácil a cada sector con mapas detallados que te muestran la ruta exacta. Nunca más te pierdas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Funciona Offline</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Tené toda la información que necesitás, incluso sin conexión. Perfecto para tus aventuras en la montaña.
              </p>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
}

