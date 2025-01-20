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

      {/* Hero Section - Smaller Height */}
      <div className="relative bg-cover bg-center h-80">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-image.jpg"
            alt="Escalada en Córdoba"
            layout="fill"
            objectFit="cover"
            className="filter blur-md"
          />
        </div>

        {/* Text Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white backdrop-blur-md bg-green-800/30">
          <h1 className="text-4xl font-bold text-center">Bienvenid@s a ClipApp</h1>
          <p className="text-lg mt-4 max-w-xl text-center">
            La guía definitiva para escalar en Córdoba. Encontrá sectores, mapas y toda la info que necesitás para tu próxima aventura.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-8 md:py-16 bg-gray-100 relative z-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-green-700 mb-8">Lo que te ofrece ClipApp</h2>
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
              <h3 className="text-xl font-bold text-green-700">Guías siempre actualizadas</h3>
              <p className="text-gray-600 mt-2">
                Descubrí las mejores zonas de escalada en Córdoba, con info precisa y al día.
              </p>
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
              <h3 className="text-xl font-bold text-green-700">Mapas que te guían</h3>
              <p className="text-gray-600 mt-2">
                Llegá fácil a cada sector con mapas interactivos que te muestran el camino.
              </p>
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
              <h3 className="text-xl font-bold text-green-700">Todo en un solo lugar</h3>
              <p className="text-gray-600 mt-2">
                Tené toda la info que necesitás, incluso sin conexión, para aprovechar cada salida.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Call to Action with Download Links */}
      <section className="py-16 bg-green-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Descargá ClipApp ahora</h2>
        <p className="text-lg mb-8">Llevá la guía de escalada en tu bolsillo y disfrutá cada momento.</p>
        <div className="flex justify-center space-x-8">
          <a href="https://play.google.com/store/apps/details?id=com.horaciovinuesa.escalando_cordoba" target="_blank" rel="noopener noreferrer">
            <Image
              src="/images/androidstore.png"
              alt="Descargar en Google Play"
              width={150}
              height={50}
              className="hover:scale-105 transition-transform duration-300"
            />
          </a>
          <a href="https://apps.apple.com/ar/app/clip-app/id6736478682" target="_blank" rel="noopener noreferrer">
            <Image
              src="/images/appstore.png"
              alt="Descargar en App Store"
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