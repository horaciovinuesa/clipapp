'use client';

import Layout from '../components/Layout';

export default function TerminosYCondiciones() {
  return (
    <Layout>
      <section className="py-16 bg-gray-100 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-green-700 mb-8">Términos y Condiciones</h1>
          <p className="text-lg text-gray-700 mb-4">
            Estos Términos y Condiciones rigen el uso de ClipApp. Al usar nuestra aplicación, aceptas los siguientes términos.
          </p>
          <div className="text-left max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-green-700 mt-8 mb-4">Uso de la Aplicación</h2>
            <p className="text-gray-700 mb-4">
              ClipApp está diseñada para proporcionar información sobre zonas de escalada y pautas de seguridad. Te comprometes a usar la aplicación de manera responsable y conforme a la ley.
            </p>

            <h2 className="text-2xl font-bold text-green-700 mt-8 mb-4">Propiedad Intelectual</h2>
            <p className="text-gray-700 mb-4">
              Todo el contenido de ClipApp, incluidas las imágenes, textos y diseños, está protegido por derechos de autor. No puedes reproducir, distribuir o utilizar el contenido sin nuestro permiso.
            </p>

            <h2 className="text-2xl font-bold text-green-700 mt-8 mb-4">Limitación de Responsabilidad</h2>
            <p className="text-gray-700 mb-4">
              ClipApp no se hace responsable de ningún daño o perjuicio que resulte del uso de nuestra aplicación. La información proporcionada se ofrece "tal cual" y no garantizamos su precisión o actualidad.
            </p>

            <h2 className="text-2xl font-bold text-green-700 mt-8 mb-4">Modificaciones a los Términos</h2>
            <p className="text-gray-700 mb-4">
              Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones serán efectivas una vez publicadas en nuestra aplicación.
            </p>

            <h2 className="text-2xl font-bold text-green-700 mt-8 mb-4">Jurisdicción</h2>
            <p className="text-gray-700 mb-4">
              Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes de Argentina. Cualquier disputa relacionada con estos términos será resuelta en los tribunales de Córdoba.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}