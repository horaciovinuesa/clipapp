'use client';

import Layout from '../components/Layout';

export default function PoliticaDePrivacidad() {
  return (
    <Layout>
      <section className="py-16 bg-gray-100 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-green-700 mb-8">Política de Privacidad</h1>
          <p className="text-lg text-gray-700 mb-4">
            En ClipApp, nos comprometemos a proteger tu privacidad y a garantizar la seguridad de los datos personales que compartes con nosotros.
          </p>
          <div className="text-left max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-green-700 mt-8 mb-4">Recolección de Información</h2>
            <p className="text-gray-700 mb-4">
              ClipApp recopila información personal cuando te registras, usas nuestra aplicación o interactúas con nosotros. La información recopilada puede incluir tu nombre, dirección de correo electrónico, y otros datos relevantes.
            </p>

            <h2 className="text-2xl font-bold text-green-700 mt-8 mb-4">Uso de la Información</h2>
            <p className="text-gray-700 mb-4">
              Usamos tu información para proporcionar y mejorar nuestros servicios, personalizar tu experiencia en la aplicación, y comunicarnos contigo sobre actualizaciones o cambios en nuestros servicios.
            </p>

            <h2 className="text-2xl font-bold text-green-700 mt-8 mb-4">Protección de Datos</h2>
            <p className="text-gray-700 mb-4">
              Tomamos todas las medidas razonables para proteger la seguridad de tu información personal. Sin embargo, no podemos garantizar la seguridad total de los datos transmitidos por internet.
            </p>

            <h2 className="text-2xl font-bold text-green-700 mt-8 mb-4">Compartir Información</h2>
            <p className="text-gray-700 mb-4">
              No compartimos tu información personal con terceros, excepto cuando sea necesario para cumplir con la ley, proteger nuestros derechos o proporcionar los servicios que has solicitado.
            </p>

            <h2 className="text-2xl font-bold text-green-700 mt-8 mb-4">Tus Derechos</h2>
            <p className="text-gray-700 mb-4">
              Tienes derecho a acceder, modificar o eliminar tu información personal en cualquier momento. Si deseas ejercer estos derechos, por favor ponte en contacto con nosotros.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}