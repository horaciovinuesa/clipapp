'use client';

import Image from 'next/image';
import Layout from '../components/Layout';

export default function QuienesSomos() {
  return (
    <Layout>
      {/* Hero Section with Background Image */}
      <div className="relative bg-cover bg-center h-80">
        <div className="absolute inset-0">
          <Image
            src="/images/bg_sample_2.jpg"
            alt="Quienes Somos Background"
            layout="fill"
            objectFit="cover"
            className="filter blur-md"
          />
        </div>

        {/* Text Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white backdrop-blur-md bg-green-800/30">
          <h1 className="text-4xl font-bold">¿Quiénes Somos?</h1>
          <p className="text-lg mt-4 max-w-xl text-center">
            ClipApp es una guía interactiva diseñada para la comunidad de escaladores de Córdoba, Argentina. 
            Nuestra misión es ayudarte a explorar nuevas zonas de escalada y mantenerte informado con mapas interactivos y pautas de seguridad.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <section className="py-16 bg-gray-100 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-green-700 mb-8">Nuestra Historia</h2>
          <p className="text-lg text-gray-700 mb-4">
            Fundada por un grupo apasionado de escaladores, ClipApp surgió de la necesidad de contar con una guía completa de las zonas de escalada en Córdoba. 
            Con el apoyo de la comunidad local, hemos desarrollado una aplicación que no solo te lleva a los mejores lugares de escalada, sino que también garantiza que tengas la información necesaria para una experiencia segura y divertida.
          </p>
          <p className="text-lg text-gray-700">
            Desde el comienzo, nuestra visión ha sido simple: hacer que la escalada sea accesible para todos y ayudar a los escaladores a descubrir y compartir nuevas rutas. 
            Con ClipApp, esperamos inspirar a la próxima generación de escaladores a alcanzar nuevas alturas.
          </p>
        </div>
      </section>
    </Layout>
  );
}