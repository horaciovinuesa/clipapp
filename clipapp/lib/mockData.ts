export interface Route {
  id: string;
  nombre: string;
  grado: string;
  altura?: string;
  chapas?: number;
  grupo: 'General' | 'Izquierda' | 'Centro' | 'Derecha';
}

export interface Sector {
  id: string;
  nombre: string;
  descripcion?: string;
  imageUrl?: string;
  vias: Route[];
}

export interface Area {
  id: string;
  nombre: string;
  sectores: Sector[];
}

export interface Province {
  id: string;
  nombre: string;
  areas: Area[];
}

export interface ClimberUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provincia?: string;
  experiencia?: string; // e.g. Principiante, Intermedio, Avanzado
  bio?: string;
  fechaRegistro: string;
  active: boolean;
}

export interface Outing {
  id: string;
  creadorId: string;
  creadorNombre: string;
  creadorFoto?: string;
  titulo: string;
  descripcion: string;
  provincia: string;
  zona: string;
  fechaSalida: string;
  fechaCreacion: string;
  contacto: string;
  tipoEscalada: string; // e.g. Deportiva, Tradicional, Boulder
  participantesCount: number;
}

export interface Report {
  id: string;
  tipo: 'salida' | 'usuario' | 'via';
  targetId: string; // ID of reported outing/user/route
  targetTitulo: string; // title of reported content
  reportadoPorNombre: string;
  reportadoPorEmail: string;
  motivo: string;
  detalles: string;
  fecha: string;
  estado: 'Pendiente' | 'Revisado' | 'Resuelto' | 'Desestimado';
}

// Mock Data
export const mockProvinces: Province[] = [
  {
    id: 'cordoba',
    nombre: 'Córdoba',
    areas: [
      {
        id: 'el-pantano',
        nombre: 'El Pantano',
        sectores: [
          {
            id: 'desplome-de-satan',
            nombre: 'Desplome de Satán',
            descripcion: 'Un sector clásico de Córdoba de desplome severo y vías atléticas de alta dificultad física.',
            imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=600&q=80',
            vias: [
              // Grupo Izquierda
              { id: 'ds-izq-1', nombre: 'Pecado Original', grado: '6b+', altura: '12m', chapas: 6, grupo: 'Izquierda' },
              { id: 'ds-izq-2', nombre: 'Tentación', grado: '7a', altura: '15m', chapas: 8, grupo: 'Izquierda' },
              { id: 'ds-izq-3', nombre: 'La Serpiente', grado: '7b', altura: '15m', chapas: 7, grupo: 'Izquierda' },
              
              // Grupo Centro
              { id: 'ds-cen-1', nombre: 'Desplome de Satán', grado: '8a', altura: '18m', chapas: 9, grupo: 'Centro' },
              { id: 'ds-cen-2', nombre: 'Infierno Grande', grado: '7c+', altura: '16m', chapas: 8, grupo: 'Centro' },
              { id: 'ds-cen-3', nombre: 'El Purgatorio', grado: '7c', altura: '18m', chapas: 9, grupo: 'Centro' },
              { id: 'ds-cen-4', nombre: 'Averno', grado: '8b', altura: '20m', chapas: 11, grupo: 'Centro' },
              
              // Grupo Derecha
              { id: 'ds-der-1', nombre: 'Ángel Caído', grado: '6c', altura: '14m', chapas: 7, grupo: 'Derecha' },
              { id: 'ds-der-2', nombre: 'Exorcista', grado: '7a+', altura: '14m', chapas: 8, grupo: 'Derecha' },
              { id: 'ds-der-3', nombre: 'Redención', grado: '6b', altura: '12m', chapas: 6, grupo: 'Derecha' }
            ]
          },
          {
            id: 'la-palma',
            nombre: 'La Palma',
            descripcion: 'Pared vertical con presas pequeñas y placas técnicas que exigen un buen juego de pies.',
            imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
            vias: [
              { id: 'lp-gen-1', nombre: 'Palmira', grado: '6a+', altura: '15m', chapas: 8, grupo: 'General' },
              { id: 'lp-gen-2', nombre: 'Brisa de Verano', grado: '6b', altura: '18m', chapas: 9, grupo: 'General' },
              { id: 'lp-gen-3', nombre: 'Coco Loco', grado: '7a', altura: '15m', chapas: 7, grupo: 'General' },
              { id: 'lp-gen-4', nombre: 'Placa Fina', grado: '7b+', altura: '20m', chapas: 10, grupo: 'General' }
            ]
          }
        ]
      },
      {
        id: 'los-gigantes',
        nombre: 'Los Gigantes',
        sectores: [
          {
            id: 'placas-de-la-lajita',
            nombre: 'Placas de la Lajita (La Lajita)',
            descripcion: 'Hermoso cerro de granito con fisuras y placas técnicas. Clima de montaña.',
            imageUrl: 'https://images.unsplash.com/photo-1501555088652-021faa156b9b?auto=format&fit=crop&w=600&q=80',
            vias: [
              { id: 'laj-izq-1', nombre: 'Clásica de los Sábados', grado: '5c', altura: '30m', chapas: 12, grupo: 'Izquierda' },
              { id: 'laj-izq-2', nombre: 'Variante de la Fisura', grado: '6a', altura: '30m', chapas: 10, grupo: 'Izquierda' },
              { id: 'laj-der-1', nombre: 'Adrenalina Pura', grado: '6c+', altura: '25m', chapas: 9, grupo: 'Derecha' },
              { id: 'laj-der-2', nombre: 'Luna Nueva', grado: '7a+', altura: '25m', chapas: 10, grupo: 'Derecha' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'san-luis',
    nombre: 'San Luis',
    areas: [
      {
        id: 'la-carolina',
        nombre: 'La Carolina',
        sectores: [
          {
            id: 'el-pueblo',
            nombre: 'El Pueblo',
            descripcion: 'Vías cortas e intensas sobre roca volcánica de excelente adherencia.',
            imageUrl: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=600&q=80',
            vias: [
              { id: 'car-gen-1', nombre: 'Oro Negro', grado: '6c', altura: '10m', chapas: 5, grupo: 'General' },
              { id: 'car-gen-2', nombre: 'Pirita', grado: '7a', altura: '12m', chapas: 6, grupo: 'General' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'mendoza',
    nombre: 'Mendoza',
    areas: [
      {
        id: 'potrerillos',
        nombre: 'Potrerillos',
        sectores: [
          {
            id: 'cruz-de-caña',
            nombre: 'Cruz de Caña',
            descripcion: 'Vías deportivas con vista al lago Potrerillos y fondo de la precordillera de los Andes.',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
            vias: [
              { id: 'pot-izq-1', nombre: 'Cóndor Pasa', grado: '6b', altura: '22m', chapas: 10, grupo: 'Izquierda' },
              { id: 'pot-der-1', nombre: 'Viento Zonda', grado: '7b', altura: '25m', chapas: 11, grupo: 'Derecha' }
            ]
          }
        ]
      }
    ]
  }
];

export const mockUsers: ClimberUser[] = [
  {
    uid: 'u-1',
    email: 'bautista.escalador@gmail.com',
    displayName: 'Bautista López',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    provincia: 'Córdoba',
    experiencia: 'Avanzado',
    bio: 'Escalo hace 6 años, fanático de los desplomes en El Pantano. Proyecto: Desplome de Satán (8a).',
    fechaRegistro: '2025-11-12',
    active: true
  },
  {
    uid: 'u-2',
    email: 'sofia.climbs@yahoo.com',
    displayName: 'Sofía Martínez',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    provincia: 'Mendoza',
    experiencia: 'Intermedio',
    bio: 'Me encanta la escalada clásica y deportiva. Busco cordada para salidas de fin de semana en Potrerillos.',
    fechaRegistro: '2026-01-20',
    active: true
  },
  {
    uid: 'u-3',
    email: 'juan.perez@escaladores.org',
    displayName: 'Juan Pérez',
    photoURL: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    provincia: 'Córdoba',
    experiencia: 'Principiante',
    bio: 'Empezando en este hermoso deporte. Ya hago 6a de primero. Busco gente buena onda para aprender.',
    fechaRegistro: '2026-03-05',
    active: true
  },
  {
    uid: 'u-4',
    email: 'spam.master@bot.net',
    displayName: 'Troll Bot',
    photoURL: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    provincia: 'Buenos Aires',
    experiencia: 'Principiante',
    bio: 'Hago publicidad en todos lados. Visita mi web de criptomonedas gratis ya mismo!!!',
    fechaRegistro: '2026-05-18',
    active: false
  }
];

export const mockOutings: Outing[] = [
  {
    id: 'o-1',
    creadorId: 'u-1',
    creadorNombre: 'Bautista López',
    creadorFoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    titulo: 'Salida express a El Pantano',
    descripcion: 'Gente, voy a estar yendo al Pantano este sábado por la mañana. Tengo auto con 2 lugares libres saliendo desde zona norte. Plan de escalar duro en Desplome de Satán, pero todos los niveles son bienvenidos.',
    provincia: 'Córdoba',
    zona: 'El Pantano',
    fechaSalida: '2026-05-23',
    fechaCreacion: '2026-05-20',
    contacto: '+54 351 987 6543',
    tipoEscalada: 'Deportiva',
    participantesCount: 3
  },
  {
    id: 'o-2',
    creadorId: 'u-2',
    creadorNombre: 'Sofía Martínez',
    creadorFoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    titulo: 'Fin de semana en Los Gigantes',
    descripcion: 'Busco compañero/a para acampar en Los Gigantes y escalar el sábado/domingo en La Lajita. Llevo cuerda de 70m y juego de empotradores para hacer algunas fisuras clásicas.',
    provincia: 'Córdoba',
    zona: 'Los Gigantes',
    fechaSalida: '2026-05-30',
    fechaCreacion: '2026-05-19',
    contacto: '+54 261 456 7890 (Sofía)',
    tipoEscalada: 'Tradicional',
    participantesCount: 1
  },
  {
    id: 'o-3',
    creadorId: 'u-4',
    creadorNombre: 'Troll Bot',
    creadorFoto: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    titulo: 'COMPRA CRIPTO YA $$$ SEGURO Y RAPIDO',
    descripcion: 'Invierte tus ahorros ahora en CoinEscalador. El mejor rendimiento mensual del 200% garantizado por expertos de la escalada mundial. Entra ya en link-sospechoso.com',
    provincia: 'San Luis',
    zona: 'La Carolina',
    fechaSalida: '2026-05-25',
    fechaCreacion: '2026-05-18',
    contacto: 'troll@bot.net',
    tipoEscalada: 'Deportiva',
    participantesCount: 0
  }
];

export const mockReports: Report[] = [
  {
    id: 'r-1',
    tipo: 'salida',
    targetId: 'o-3',
    targetTitulo: 'COMPRA CRIPTO YA $$$ SEGURO Y RAPIDO',
    reportadoPorNombre: 'Bautista López',
    reportadoPorEmail: 'bautista.escalador@gmail.com',
    motivo: 'Spam / Estafa',
    detalles: 'Es una cuenta bot de spam que está publicando estafas financieras en la sección Encontrar Cordada. Por favor eliminen al usuario y la publicación.',
    fecha: '2026-05-18',
    estado: 'Pendiente'
  },
  {
    id: 'r-2',
    tipo: 'usuario',
    targetId: 'u-4',
    targetTitulo: 'Perfil de Troll Bot',
    reportadoPorNombre: 'Sofía Martínez',
    reportadoPorEmail: 'sofia.climbs@yahoo.com',
    motivo: 'Comportamiento Inapropiado',
    detalles: 'El usuario publica spam y mensajes repetitivos en los perfiles de otros escaladores.',
    fecha: '2026-05-19',
    estado: 'Pendiente'
  }
];
