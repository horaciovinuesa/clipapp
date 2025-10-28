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
            alt="Quiénes Somos Background"
            layout="fill"
            objectFit="cover"
            className="filter blur-md"
          />
        </div>

        {/* Text Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white backdrop-blur-md bg-green-800/30">
          <h1 className="text-4xl font-bold">¿Quiénes Somos?</h1>
          <p className="text-lg mt-4 max-w-xl text-center">
            Apasionados por la escalada, dedicados a brindarte la mejor guía de Córdoba. ¡Conócenos!
          </p>
        </div>
      </div>

      {/* Content Section */}
      <section className="py-16 bg-gray-100 text-center">
        <div className="container mx-auto px-4">
          <p className="text-lg text-gray-700 mb-4">
          <br />
            ClipApp es una guía interactiva diseñada para la comunidad de escaladores de Córdoba, Argentina. 
            Nuestra misión es ayudarte a explorar nuevas zonas de escalada y mantenerte informado con mapas interactivos y pautas de seguridad.
            <br /><br /><br /><br />
          </p>

          <h2 className="text-3xl font-bold text-green-700 mb-8">Nuestra Historia</h2>
          <p className="text-lg text-gray-700 mb-8">
            Desde el comienzo, nuestra visión ha sido simple: hacer que la escalada sea accesible para todos y ayudar a los escaladores a descubrir y compartir nuevas rutas.  <br />
            Ademas, esperamos con esta guia unificada y offline poder solucionar un problema en comun: Tener info accesible y sin necesidad de internet para encontrar una via.
            <br /><br /><br />
          </p>

        

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
            {/* Profile 1 */}
            <div className="text-center">
              <Image
                src="/images/profile_01.png"
                alt="Horacio - Desarrollador"
                width={150}
                height={150}
                className="rounded-full mx-auto"
              />
              <h3 className="text-xl font-bold text-green-700 mt-4">Horacio</h3>
              <p className="text-gray-700 text-md">
              Desarrollador, encargado de convertir ideas en realidad con Flutter para que llegue a la mayor cantidad posible de personas en la comunidad.
              </p>
            </div>

            {/* Profile 2 */}
            <div className="text-center">
              <Image
                src="/images/profile_02.png"
                alt="Fusco - Relevamiento"
                width={150}
                height={150}
                className="rounded-full mx-auto"
              />
              <h3 className="text-xl font-bold text-green-700 mt-4">Fusco</h3>
              <p className="text-gray-700 text-md">
              Aperturista de la comunidad. Especialista en relevamiento de vías y zonas, asegurando datos precisos y actualizados.
              </p>
            </div>

            {/* Profile 3 */}
            <div className="text-center">
              <Image
                src="/images/profile_03.png"
                alt="Romina - Fotografía"
                width={150}
                height={150}
                className="rounded-full mx-auto"
              />
              <h3 className="text-xl font-bold text-green-700 mt-4">Romina</h3>
              <p className="text-gray-700 text-md">
              Fotógrafa dedicada, capturando cada detalle de las zonas de escalada para la comunidad.
              </p>
              <p className="text-sm text-gray-500 italic mt-3">
                Siempre en nuestros corazones, te recordamos con amor. Tu pasión por la escalada y la musica sigue inspirandonos.
              </p>
            </div>

            
          </div>
          <p className="mt-12 text-lg text-gray-700">
          <br /><br /><br />ClipApp nació de nuestra pasión por la escalada y el deseo de brindar información precisa a la comunidad. <br />
            ¡Seguimos trabajando para mejorar y expandir esta herramienta esencial para escaladores!
          </p>
        </div>
      </section>
    </Layout>
  );
}