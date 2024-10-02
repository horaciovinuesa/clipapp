'use client';

import { useState } from 'react';
import emailjs from 'emailjs-com';
import Layout from '../components/Layout';

export default function Ayuda() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState('');

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    emailjs.send(
      'service_4ntwhir', // Replace with your EmailJS service ID
      'template_o7bg99q', // Replace with your EmailJS template ID
      {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
      },
      'AVv3AFbI37spndVgE' // Replace with your EmailJS public API key
    ).then(() => {
      setFormStatus('¡Mensaje enviado exitosamente!. Te estaremos respondiendo pronto.');
      setIsSubmitting(false);
      setFormData({ name: '', email: '', message: '' });
    }).catch(() => {
      setFormStatus('Hubo un error al enviar el mensaje. Inténtalo de nuevo.');
      setIsSubmitting(false);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Layout>
      {/* Page Title */}
      <section className="py-16 bg-gray-100 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-green-700 mb-4">Ayuda y Soporte</h1>
          <p className="text-lg text-gray-700 mb-8">
            ¿Tienes alguna duda o necesitas ayuda con ClipApp? Estamos aquí para asistirte.
          </p>

          {/* Contact Form */}
          <form onSubmit={sendEmail} className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-8">
            <div className="mb-4">
              <label htmlFor="name" className="block text-left font-bold text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-left font-bold text-gray-700 mb-2">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-left font-bold text-gray-700 mb-2">Mensaje</label>
              <textarea
                name="message"
                id="message"
                rows={4}
                value={formData.message}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-gray-900 placeholder-gray-400"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
            {formStatus && <p className="mt-4 text-green-700 font-bold">{formStatus}</p>}
          </form>
        </div>
      </section>
    </Layout>
  );
}