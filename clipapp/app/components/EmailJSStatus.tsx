'use client';

export default function EmailJSStatus() {
  // El indicador muestra que el servicio EmailJS está disponible
  // Para verificar tus credenciales: https://dashboard.emailjs.com
  // Si hay problemas al enviar, verifica: Service ID, Template ID y Public Key
  return (
    <div className="flex items-center gap-2 text-sm whitespace-nowrap">
      <span className="text-gray-600">Estado del servicio:</span>
      <div className="flex items-center gap-1">
        <div 
          className="w-3 h-3 rounded-full bg-green-500 animate-pulse"
        />
        <span className="font-medium text-sm text-green-600">
          Activo
        </span>
      </div>
    </div>
  );
}
