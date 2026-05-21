'use client';

import { useState } from 'react';
import emailjs from '@emailjs/browser';
import Layout from '../components/Layout';

interface Via {
  name: string;
  grade: string;
  bolts: string;
  altitude: string;
  climbType: string;
  aperturista?: string;
}

export default function SubiTusVias() {
  const [formData, setFormData] = useState({
    sectorName: '',
    googleMapsLink: '',
    description: '',
    sunHours: '',
    shadeHours: '',
    contribuidorName: '',
    viaName: '',
    viaGrade: '',
    viaBolts: '',
    viaAltitude: '',
    viaClimbType: 'placa',
    viaAperturista: '',
    imageUrl: '',
  });

  const [vias, setVias] = useState<Via[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkStatus, setCheckStatus] = useState<string>('');

  const checkServiceStatus = async () => {
    setIsChecking(true);
    setCheckStatus('');

    try {
      await emailjs.send(
        'service_4ntwhir',
        'template_c9tnvzs',
        {
          from_name: 'Check de estado desde la página',
          from_email: 'check@clipapp.com',
          message: 'Verificación automática del servicio de email. Servicio funcionando correctamente.',
        },
        'AVv3AFbI37spndVgE'
      );
      setCheckStatus('success');
    } catch (error) {
      console.error('Service check failed:', error);
      setCheckStatus('error');
    } finally {
      setIsChecking(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addVia = () => {
    if (formData.viaName && formData.viaGrade) {
      const newVia: Via = {
        name: formData.viaName,
        grade: formData.viaGrade,
        bolts: formData.viaBolts || '?',
        altitude: formData.viaAltitude || '',
        climbType: formData.viaClimbType,
        aperturista: formData.viaAperturista || undefined,
      };
      setVias([...vias, newVia]);
      // Reset via inputs
      setFormData({
        ...formData,
        viaName: '',
        viaGrade: '',
        viaBolts: '',
        viaAltitude: '',
        viaAperturista: '',
      });
    }
  };

  const removeVia = (index: number) => {
    setVias(vias.filter((_, i) => i !== index));
  };

  const addImage = () => {
    if (formData.imageUrl) {
      setImages([...images, formData.imageUrl]);
      setFormData({ ...formData, imageUrl: '' });
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const sendSectorInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus('');

    // Format vias data for email
    const viasText = vias.map((via, index) => 
      `${index + 1}. ${via.name} - ${via.grade} | ${via.bolts} chapas | ${via.altitude}m | ${via.climbType}${via.aperturista ? ` | Aperturista: ${via.aperturista}` : ''}`
    ).join('\n');

    // Format images data for email
    const imagesText = images.length > 0 
      ? `URLs de imágenes:\n${images.map((url, index) => `${index + 1}. ${url}`).join('\n')}`
      : 'Sin imágenes adjuntas';

    const emailData = {
      from_name: formData.contribuidorName || 'Usuario ClipApp',
      from_email: 'noreply@clipapp.com',
      message: `
NUEVO SECTOR SUBIDO

Nombre del Sector: ${formData.sectorName}
Contribuidor: ${formData.contribuidorName || 'No especificado'}
Link de Google Maps: ${formData.googleMapsLink}
Descripción: ${formData.description}
Horas de Sol: ${formData.sunHours || 'No especificado'}
Horas de Sombra: ${formData.shadeHours || 'No especificado'}

VIAS (${vias.length} vías):
${viasText}

${imagesText}
      `,
    };

    emailjs.send(
      'service_4ntwhir',
      'template_c9tnvzs',
      emailData,
      'AVv3AFbI37spndVgE'
    ).then((response) => {
      console.log('Sector info sent successfully:', response);
      setFormStatus('¡Gracias por subir tu sector! Revisaremos la información y pronto la agregaremos a ClipApp.');
      setIsSubmitting(false);
      // Reset form
      setFormData({
        sectorName: '',
        googleMapsLink: '',
        description: '',
        sunHours: '',
        shadeHours: '',
        contribuidorName: '',
        viaName: '',
        viaGrade: '',
        viaBolts: '',
        viaAltitude: '',
        viaClimbType: 'placa',
        viaAperturista: '',
        imageUrl: '',
      });
      setVias([]);
      setImages([]);
    }).catch((error) => {
      console.error('Error sending sector info:', error);
      console.error('Error details:', error.text || error);
      setFormStatus('Hubo un error al enviar el sector. Inténtalo de nuevo.');
      setIsSubmitting(false);
    });
  };

  return (
    <Layout>
      <section className="py-16 bg-gray-100 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold text-green-700 mb-4 text-center">
            📍 Subí tus Vías
          </h1>
          <p className="text-lg text-gray-700 mb-4 text-center">
            ¿Conocés un sector de escalada que no está en ClipApp? Compartí la información y ayudá a que la comunidad crezca.
          </p>
          <p className="text-md text-green-700 mb-4 text-center font-bold">
            💡 Vamos a poner tu nombre como contribuyente en la página de la app
          </p>

          {/* Service Status Check */}
          <div className="mb-8 flex flex-col items-center gap-3">
            {!checkStatus && (
              <button
                type="button"
                onClick={checkServiceStatus}
                disabled={isChecking}
                className="text-sm text-green-600 hover:text-green-700 px-4 py-2 border border-green-300 rounded-lg font-medium hover:bg-green-50 transition-colors disabled:text-green-400 disabled:cursor-not-allowed disabled:border-green-200"
              >
                {isChecking ? '⏳ Verificando...' : '🔍 Checkea el estado del servicio'}
              </button>
            )}
            {checkStatus === 'success' && (
              <p className="text-green-600 font-semibold text-base">
                ✅ Servicio activo!
              </p>
            )}
            {checkStatus === 'error' && (
              <p className="text-red-600 font-semibold text-base">
                ❌ Servicio inactivo, contacta al admin
              </p>
            )}
          </div>

          <form onSubmit={sendSectorInfo} className="bg-white shadow-lg rounded-lg p-8">
            {/* Sector Information */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-green-700 mb-4">Información del Sector</h2>
              
              <div className="mb-4">
                <label htmlFor="sectorName" className="block text-left font-bold text-gray-700 mb-2">
                  Nombre del Sector *
                </label>
                <input
                  type="text"
                  name="sectorName"
                  id="sectorName"
                  value={formData.sectorName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 placeholder-gray-400"
                  placeholder="Ej: Sector Perroncho"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="contribuidorName" className="block text-left font-bold text-gray-700 mb-2">
                  Tu Nombre (opcional)
                </label>
                <input
                  type="text"
                  name="contribuidorName"
                  id="contribuidorName"
                  value={formData.contribuidorName}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 placeholder-gray-400"
                  placeholder="Tu nombre aparecerá como contribuyente"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="googleMapsLink" className="block text-left font-bold text-gray-700 mb-2">
                  Link de Google Maps *
                </label>
                <input
                  type="url"
                  name="googleMapsLink"
                  id="googleMapsLink"
                  value={formData.googleMapsLink}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 placeholder-gray-400"
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-left font-bold text-gray-700 mb-2">
                  Descripción del Sector
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 placeholder-gray-400"
                  placeholder="Breve descripción del sector, tipo de roca, características, etc."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="sunHours" className="block text-left font-bold text-gray-700 mb-2">
                    Horas de Sol ☀️
                  </label>
                  <input
                    type="text"
                    name="sunHours"
                    id="sunHours"
                    value={formData.sunHours}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 placeholder-gray-400"
                    placeholder="Ej: 08:00 - 15:00"
                  />
                </div>

                <div>
                  <label htmlFor="shadeHours" className="block text-left font-bold text-gray-700 mb-2">
                    Horas de Sombra 🌤️
                  </label>
                  <input
                    type="text"
                    name="shadeHours"
                    id="shadeHours"
                    value={formData.shadeHours}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 placeholder-gray-400"
                    placeholder="Ej: 15:00 - 19:00"
                  />
                </div>
              </div>

              {/* Images Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label htmlFor="imageUrl" className="block text-left font-bold text-gray-700 mb-2">
                  URL de Imagen (opcional)
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 placeholder-gray-400 mb-3"
                  placeholder="URL pública de la imagen del sector"
                />
                <button
                  type="button"
                  onClick={addImage}
                  disabled={!formData.imageUrl}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed mb-3"
                >
                  ➕ Agregar otra imagen
                </button>
                <p className="text-xs text-gray-500 mb-2">
                  Por ahora solo aceptamos URLs de imágenes públicas. Pronto agregaremos carga directa de archivos.
                </p>
                <p className="text-xs text-gray-600">
                  ¿No tenés donde subir la imagen?{' '}
                  <a 
                    href="https://imgur.com/upload" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 underline font-bold"
                  >
                    Podes subirla gratis acá 📸
                  </a>
                </p>

                {/* List of Added Images */}
                {images.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-gray-700 mb-2">
                      Imágenes agregadas ({images.length}):
                    </h3>
                    {images.map((imageUrl, index) => (
                      <div key={index} className="bg-blue-50 p-3 rounded-lg mb-2 flex justify-between items-center">
                        <span className="text-sm text-blue-800 break-all">{imageUrl}</span>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm ml-2 flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-6 mb-6">
              <h2 className="text-2xl font-bold text-green-700 mb-4">Vías del Sector</h2>
              
              {/* Add Via Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="viaName" className="block text-left font-bold text-gray-700 mb-2">
                      Nombre de la Vía *
                    </label>
                    <input
                      type="text"
                      name="viaName"
                      id="viaName"
                      value={formData.viaName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 placeholder-gray-400"
                      placeholder="Ej: Vía 1, La Dura, etc."
                    />
                  </div>

                  <div>
                    <label htmlFor="viaGrade" className="block text-left font-bold text-gray-700 mb-2">
                      Grado *
                    </label>
                    <input
                      type="text"
                      name="viaGrade"
                      id="viaGrade"
                      value={formData.viaGrade}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 placeholder-gray-400"
                      placeholder="Ej: 6A, 7A, 5+, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label htmlFor="viaBolts" className="block text-left font-bold text-gray-700 mb-2">
                      Chapas
                    </label>
                    <input
                      type="text"
                      name="viaBolts"
                      id="viaBolts"
                      value={formData.viaBolts}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 placeholder-gray-400"
                      placeholder="Ej: 8, ?, etc."
                    />
                  </div>

                  <div>
                    <label htmlFor="viaAltitude" className="block text-left font-bold text-gray-700 mb-2">
                      Altura (m)
                    </label>
                    <input
                      type="text"
                      name="viaAltitude"
                      id="viaAltitude"
                      value={formData.viaAltitude}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 placeholder-gray-400"
                      placeholder="Ej: 25"
                    />
                  </div>

                  <div>
                    <label htmlFor="viaClimbType" className="block text-left font-bold text-gray-700 mb-2">
                      Tipo de Escalada
                    </label>
                    <select
                      name="viaClimbType"
                      id="viaClimbType"
                      value={formData.viaClimbType}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900"
                    >
                      <option value="placa">Placa</option>
                      <option value="aplome">Aplome</option>
                      <option value="techo">Techo</option>
                      <option value="diedro">Diedro</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="viaAperturista" className="block text-left font-bold text-gray-700 mb-2">
                    Aperturista (opcional)
                  </label>
                  <input
                    type="text"
                    name="viaAperturista"
                    id="viaAperturista"
                    value={formData.viaAperturista}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 placeholder-gray-400"
                    placeholder="Nombre del aperturista"
                  />
                </div>

                <button
                  type="button"
                  onClick={addVia}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors"
                >
                  ➕ Agregar Vía
                </button>
              </div>

              {/* List of Added Vias */}
              {vias.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-700 mb-2">
                    Vías agregadas ({vias.length}):
                  </h3>

                  {vias.map((via, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-lg mb-2 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-green-800">{via.name}</span>
                        <span className="ml-2 text-gray-700">
                          - {via.grade} | {via.bolts} chapas | {via.altitude}m | {via.climbType}{via.aperturista ? ` | Aperturista: ${via.aperturista}` : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVia(index)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors text-lg"
              disabled={isSubmitting || vias.length === 0}
            >
              {isSubmitting ? 'Enviando...' : '🚀 Subir Sector'}
            </button>

            {formStatus && (
              <p className={`mt-4 text-center font-bold ${
                formStatus.includes('Gracias') ? 'text-green-700' : 'text-red-700'
              }`}>
                {formStatus}
              </p>
            )}

            {vias.length === 0 && (
              <p className="mt-2 text-center text-sm text-gray-500">
                * Agregá al menos una vía antes de enviar
              </p>
            )}
          </form>
        </div>
      </section>
    </Layout>
  );
}

