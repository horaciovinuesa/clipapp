export interface ClimbingZone {
  id: string;
  nombre: string;
  referenciaNombre: string;
  provinciaId: string;
  provinciaNombre: string;
  descripcion: string;
  sectores: string[];
  windguruSpotId?: string;
  windguruLink?: string;
  googleMapsLink?: string;
  lat: number;
  lon: number;
  altitudMetros?: number;
  imageUrl?: string;
}

export interface ProvinceInfo {
  id: string;
  nombre: string;
  escudo: string;
  descripcion: string;
}

export const PROVINCIAS: ProvinceInfo[] = [
  {
    id: 'cordoba',
    nombre: 'Córdoba',
    escudo: '/images/provincias/cordoba.png',
    descripcion: 'Cuna de la escalada deportiva en Argentina: Altas Cumbres, Los Gigantes, Capilla del Monte y más.',
  },
  {
    id: 'mendoza',
    nombre: 'Mendoza',
    escudo: '/images/provincias/mendoza.png',
    descripcion: 'Paraíso de montaña y bloque: Cajón de Arenales, El Santuario, Cacheuta y Potrerillos.',
  },
  {
    id: 'san-luis',
    nombre: 'San Luis',
    escudo: '/images/provincias/san_luis.png',
    descripcion: 'Paredes vírgenes y roca de calidad en Villa del Carmen y Valle de Pancanta.',
  },
  {
    id: 'chubut',
    nombre: 'Chubut',
    escudo: '/images/provincias/chubut.png',
    descripcion: 'Meca mundial en Piedra Parada y la Buitrera, Trevelin, Esquel y Lago Puelo.',
  },
  {
    id: 'la-rioja',
    nombre: 'La Rioja',
    escudo: '/images/provincias/la_rioja.png',
    descripcion: 'Areniscas rojas y cañones imponentes en Cuesta de Miranda y Anillaco.',
  },
  {
    id: 'jujuy',
    nombre: 'Jujuy',
    escudo: '/images/provincias/jujuy.png',
    descripcion: 'Escalada de altura en Tilcara, Tuzgle, San Antonio y Termas de Reyes.',
  },
  {
    id: 'neuquen',
    nombre: 'Neuquén',
    escudo: '/images/provincias/neuquen.png',
    descripcion: 'Roca volcánica y lagos en San Martín de los Andes y Villa Traful.',
  },
  {
    id: 'catamarca',
    nombre: 'Catamarca',
    escudo: '/images/provincias/catamarca.png',
    descripcion: 'Bloques y sectores deportivos en Las Juntas, Anquincila y El Jumeal.',
  },
  {
    id: 'tucuman',
    nombre: 'Tucumán',
    escudo: '/images/provincias/tucuman.png',
    descripcion: 'Yungas y alta montaña en Tafí del Valle y San Javier.',
  },
];

export const CLIMBING_ZONES: ClimbingZone[] = [
  // ==========================================
  // CÓRDOBA
  // ==========================================
  {
    id: 'altas-cumbres',
    nombre: 'Altas Cumbres',
    referenciaNombre: 'La Ola',
    provinciaId: 'cordoba',
    provinciaNombre: 'Córdoba',
    descripcion: 'Zona de granito de alta montaña sobre la RP 34. Clima fresco con adherencia excepcional y vías deportivas de placa y desplome.',
    sectores: ['La Ola', 'Teatro / El Corral', 'El Secretillo', 'Torres Gemelas', 'La Ballena', 'El Barco', 'El Barrilete'],
    windguruSpotId: '479273',
    windguruLink: 'https://wap2.windguru.cz/view.php?&sc=479273&m=3&n=&from=search&start=0&full=1',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-31.664446570793558,-64.90120930747315',
    lat: -31.6644,
    lon: -64.9012,
    altitudMetros: 2120,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/clipapp-62a1f.firebasestorage.app/o/la_ola%2Frutas_bg_laola.jpg?alt=media',
  },
  {
    id: 'los-gigantes',
    nombre: 'Los Gigantes',
    referenciaNombre: 'Zona del Refugio C.A.C',
    provinciaId: 'cordoba',
    provinciaNombre: 'Córdoba',
    descripcion: 'El macizo granítico más importante de Córdoba. Escalada tradicional y deportiva de varios largos en alta montaña.',
    sectores: ['Guía General', 'Cerro de la Cruz', 'Zona del Refugio C.A.C', 'El Ostiazo', 'La Salamanca', 'Pollito'],
    windguruSpotId: '106701',
    windguruLink: 'https://www.windguru.cz/106701',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-31.40739196613803,-64.7889162741783',
    lat: -31.4074,
    lon: -64.7889,
    altitudMetros: 2250,
  },
  {
    id: 'copina',
    nombre: 'Copina',
    referenciaNombre: 'Segundo Puente',
    provinciaId: 'cordoba',
    provinciaNombre: 'Córdoba',
    descripcion: 'Paredes y cañones de los puentes colgantes sobre el antiguo camino de las Altas Cumbres.',
    sectores: ['Copina I (Segundo Puente)', 'Copina II (Sector Hernán)', 'Copina III (Sector Imperial)', 'Copina IV'],
    windguruSpotId: '119155',
    windguruLink: 'https://www.windguru.cz/119155',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-31.56315161715211,-64.71133336703478',
    lat: -31.5632,
    lon: -64.7113,
    altitudMetros: 1420,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/clipapp-62a1f.firebasestorage.app/o/copina%2Fsegundo_puente%2Fseg_puente_cover.png?alt=media',
  },
  {
    id: 'capilla-del-monte',
    nombre: 'Capilla del Monte',
    referenciaNombre: 'Los Paredones',
    provinciaId: 'cordoba',
    provinciaNombre: 'Córdoba',
    descripcion: 'Formaciones rocosas al pie del cerro Uritorco con gran concentración de vías de deportiva de todos los grados.',
    sectores: ['Los Paredones', 'Los Mogotes', 'El Paraíso'],
    windguruSpotId: '47708',
    windguruLink: 'https://www.windguru.cz/47708',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-30.80143396512128,-64.53452221471969',
    lat: -30.8014,
    lon: -64.5345,
    altitudMetros: 1080,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/clipapp-62a1f.firebasestorage.app/o/paredones%2Fparedones_banner.png?alt=media',
  },
  {
    id: 'la-calera',
    nombre: 'La Calera',
    referenciaNombre: 'El Horno / El Colibrí',
    provinciaId: 'cordoba',
    provinciaNombre: 'Córdoba',
    descripcion: 'Sectores de caliza y dolomía cercanos a la ciudad de Córdoba con vías explosivas de placa y desplome.',
    sectores: ['El Horno', 'El Colibrí'],
    windguruSpotId: '378627',
    windguruLink: 'https://www.windguru.cz/378627',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-31.353702212538256,-64.39794976441807',
    lat: -31.3537,
    lon: -64.3979,
    altitudMetros: 535,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/clipapp-62a1f.firebasestorage.app/o/el_horno%2Frutas_bg_el-horno.jpg?alt=media',
  },
  {
    id: 'alta-gracia',
    nombre: 'Alta Gracia',
    referenciaNombre: 'La Cantera',
    provinciaId: 'cordoba',
    provinciaNombre: 'Córdoba',
    descripcion: 'Antigua cantera con vías deportivas equipadas de acceso inmediato en vehículo, a minutos del centro de Alta Gracia.',
    sectores: ['La Cantera (Pared Principal)', 'Sector Escuela'],
    windguruSpotId: '171354',
    windguruLink: 'https://www.windguru.cz/171354',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-31.675568060090615,-64.4492346485338',
    lat: -31.6756,
    lon: -64.4492,
    altitudMetros: 620,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/clipapp-62a1f.firebasestorage.app/o/la_cantera%2Frutas_bg_cantera.jpg?alt=media',
  },
  {
    id: 'bialet-masse',
    nombre: 'Bialet Massé',
    referenciaNombre: 'Paredes de Bialet Massé',
    provinciaId: 'cordoba',
    provinciaNombre: 'Córdoba',
    descripcion: 'Paredes verticales sobre el Valle de Punilla con vías técnicas y acceso rápido desde la RN 38.',
    sectores: ['Bialet Massé (Sector Principal)'],
    windguruSpotId: '127287',
    windguruLink: 'https://wap2.windguru.cz/view.php?&sc=127287&m=3&n=&from=search&start=0&full=1',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-31.30326064098206,-64.46590331468087',
    lat: -31.3033,
    lon: -64.4659,
    altitudMetros: 680,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/clipapp-62a1f.firebasestorage.app/o/bialet_masse%2Frutas_bg_bialet.jpg?alt=media',
  },
  {
    id: 'valle-hermoso',
    nombre: 'Valle Hermoso',
    referenciaNombre: 'Valle Hermoso',
    provinciaId: 'cordoba',
    provinciaNombre: 'Córdoba',
    descripcion: 'Escalada agradable en las sierras del Valle de Punilla.',
    sectores: ['Valle Hermoso'],
    windguruSpotId: '228022',
    windguruLink: 'https://www.windguru.cz/228022',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-31.11739212177642,-64.49275286983298',
    lat: -31.1174,
    lon: -64.4928,
    altitudMetros: 950,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/clipapp-62a1f.firebasestorage.app/o/valle_hermoso%2Frutas_bg_valle_hermoso.jpg?alt=media',
  },
  {
    id: 'ascochinga',
    nombre: 'Ascochinga',
    referenciaNombre: 'Ascochinga',
    provinciaId: 'cordoba',
    provinciaNombre: 'Córdoba',
    descripcion: 'Granito compacto entre ríos cristalinos y arboledas en las Sierras Chicas norte.',
    sectores: ['Ascochinga'],
    windguruSpotId: '214541',
    windguruLink: 'https://wap2.windguru.cz/view.php?&sc=214541&m=3&n=&from=search&start=0&full=1',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-30.957007263232484,-64.29400773853585',
    lat: -30.9570,
    lon: -64.2940,
    altitudMetros: 760,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/clipapp-62a1f.firebasestorage.app/o/ascochinga%2Frutas_bg_ascochinga.jpg?alt=media',
  },
  {
    id: 'tanti-pajaritos',
    nombre: 'Tanti / Punilla',
    referenciaNombre: 'Cueva de los Pajaritos',
    provinciaId: 'cordoba',
    provinciaNombre: 'Córdoba',
    descripcion: 'Cañón rocoso con sombra, paredes técnicas y pozas de agua en las cercanías de Tanti.',
    sectores: ['La Cueva de los Pajaritos'],
    windguruSpotId: '149897',
    windguruLink: 'https://www.windguru.cz/149897',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-31.1340,-64.5780',
    lat: -31.1340,
    lon: -64.5780,
    altitudMetros: 980,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/clipapp-62a1f.firebasestorage.app/o/cueva_pajaritos%2Frutas_bg_cueva_pajaritos.jpg?alt=media',
  },
  {
    id: 'calamuchita',
    nombre: 'Calamuchita',
    referenciaNombre: 'Cueva de las Brujas (Embalse)',
    provinciaId: 'cordoba',
    provinciaNombre: 'Córdoba',
    descripcion: 'Escalada atlética en cuevas y desplomes sobre las costas del Valle de Calamuchita.',
    sectores: ['Cueva de las Brujas'],
    windguruSpotId: '18699',
    windguruLink: 'https://www.windguru.cz/18699',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-32.09395,-64.42541',
    lat: -32.0940,
    lon: -64.4254,
    altitudMetros: 650,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/clipapp-62a1f.firebasestorage.app/o/cueva_de_las_brujas%2Frutas_bg_cuevaBrujas.jpg?alt=media',
  },
  {
    id: 'traslasierra',
    nombre: 'Traslasierra',
    referenciaNombre: 'Mina Clavero',
    provinciaId: 'cordoba',
    provinciaNombre: 'Córdoba',
    descripcion: 'Paredes y cañones en el faldeo occidental de las Altas Cumbres, con microclima soleado y cálido.',
    sectores: ['Mina Clavero (Sector Río)', 'Sectores Aledaños'],
    windguruSpotId: '560715',
    windguruLink: 'https://www.windguru.cz/560715',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-31.7230,-65.0080',
    lat: -31.7230,
    lon: -65.0080,
    altitudMetros: 920,
  },

  // ==========================================
  // MENDOZA
  // ==========================================
  {
    id: 'tunuyan-arenales',
    nombre: 'Cordón del Portillo (Tunuyán)',
    referenciaNombre: 'Cajón de Arenales',
    provinciaId: 'mendoza',
    provinciaNombre: 'Mendoza',
    descripcion: 'Paraíso del granito en los Andes centrales: torres colosales, fisuras perfectas y big walls de clase mundial a más de 2500m.',
    sectores: ['Cajón de Arenales', 'Torre del Campanile', 'Pared de la Mitria'],
    windguruSpotId: '431960',
    windguruLink: 'https://www.windguru.cz/431960',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-33.6420,-69.5480',
    lat: -33.6420,
    lon: -69.5480,
    altitudMetros: 2600,
  },
  {
    id: 'mendoza-precordillera',
    nombre: 'Precordillera y Luján de Cuyo',
    referenciaNombre: 'El Santuario',
    provinciaId: 'mendoza',
    provinciaNombre: 'Mendoza',
    descripcion: 'Vías deportivas en arenisca, caliza y conglomerado con microclima de precordillera andina.',
    sectores: ['El Santuario', 'Cacheuta', 'Potrerillos', 'Agua de Las Avispas'],
    windguruSpotId: '431960',
    windguruLink: 'https://wap2.windguru.cz/view.php?&sc=431960&m=3&n=&from=search&start=0&full=1',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-32.9560,-69.1750',
    lat: -32.9560,
    lon: -69.1750,
    altitudMetros: 1600,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/clipapp-62a1f.firebasestorage.app/o/mendoza%2Fel_santuario%2Fel_santuario_banner.png?alt=media',
  },

  // ==========================================
  // CHUBUT
  // ==========================================
  {
    id: 'piedra-parada-buitrera',
    nombre: 'Piedra Parada',
    referenciaNombre: 'Piedra Parada / Cañadón de la Buitrera',
    provinciaId: 'chubut',
    provinciaNombre: 'Chubut',
    descripcion: 'Monolito volcánico de 240m de altura y cañadón de 5km de roca ignimbrita con miles de vías de prestigio mundial.',
    sectores: ['Piedra Parada', 'Cañadón de la Buitrera', 'La Calavera', 'El Sueño del Pibe'],
    windguruSpotId: '379898',
    windguruLink: 'https://www.windguru.cz/379898',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-42.6560,-70.1190',
    lat: -42.6560,
    lon: -70.1190,
    altitudMetros: 580,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/clipapp-62a1f.firebasestorage.app/o/chubut%2Fpiedra_parada%2Fpiedra_parada_banner.png?alt=media',
  },
  {
    id: 'cordillera-chubut',
    nombre: 'Cordillera Chubutense',
    referenciaNombre: 'Trevelin',
    provinciaId: 'chubut',
    provinciaNombre: 'Chubut',
    descripcion: 'Paredes andinas resguardadas entre bosques patagónicos y lagos cordilleranos.',
    sectores: ['Trevelin', 'Esquel', 'Lago Puelo', 'Boca Toma'],
    windguruSpotId: '134302',
    windguruLink: 'https://www.windguru.cz/134302',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-43.0850,-71.4640',
    lat: -43.0850,
    lon: -71.4640,
    altitudMetros: 420,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/clipapp-62a1f.firebasestorage.app/o/chubut%2Ftrevelin%2Fbanner_trevelin.png?alt=media',
  },

  // ==========================================
  // LA RIOJA
  // ==========================================
  {
    id: 'cuesta-de-miranda',
    nombre: 'Cuesta de Miranda',
    referenciaNombre: 'Cuesta de Miranda',
    provinciaId: 'la-rioja',
    provinciaNombre: 'La Rioja',
    descripcion: 'Imponentes murallas de arenisca roja entre curvas panorámicas de la RN 40.',
    sectores: ['Cuesta de Miranda', 'Sectores del Cañón'],
    windguruSpotId: '1154817',
    windguruLink: 'https://www.windguru.cz/1154817',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-29.3450,-67.7520',
    lat: -29.3450,
    lon: -67.7520,
    altitudMetros: 1550,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/clipapp-62a1f.firebasestorage.app/o/la_rioja%2Fcuesta_miranda%2Fcuesta_cover.png?alt=media',
  },

  // ==========================================
  // SAN LUIS
  // ==========================================
  {
    id: 'san-luis-sierras',
    nombre: 'Sierras de San Luis',
    referenciaNombre: 'Villa del Carmen',
    provinciaId: 'san-luis',
    provinciaNombre: 'San Luis',
    descripcion: 'Paredes y agujas graníticas en las estribaciones de Comechingones y Sierras Centrales.',
    sectores: ['Villa del Carmen', 'Valle de Pancanta / Peñón'],
    windguruSpotId: '18699',
    windguruLink: 'https://www.windguru.cz/18699',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-32.5530,-65.0210',
    lat: -32.5530,
    lon: -65.0210,
    altitudMetros: 950,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/clipapp-62a1f.firebasestorage.app/o/san_luis%2Fvilla_del_carmen%2Fvdc_banner.png?alt=media',
  },

  // ==========================================
  // JUJUY
  // ==========================================
  {
    id: 'quebrada-humahuaca',
    nombre: 'Quebrada de Humahuaca',
    referenciaNombre: 'Tilcara',
    provinciaId: 'jujuy',
    provinciaNombre: 'Jujuy',
    descripcion: 'Escalada en areniscas de tonalidades rojizas en el corazón de la Quebrada patrimonio de la humanidad.',
    sectores: ['Tilcara', 'Bárcena', 'El Roncal', 'Yavi'],
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-23.5780,-65.3930',
    lat: -23.5780,
    lon: -65.3930,
    altitudMetros: 2460,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/clipapp-62a1f.firebasestorage.app/o/jujuy%2Ftilcara_banner.png?alt=media',
  },
  {
    id: 'puna-tuzgle',
    nombre: 'Puna Jujeña',
    referenciaNombre: 'Volcán Tuzgle',
    provinciaId: 'jujuy',
    provinciaNombre: 'Jujuy',
    descripcion: 'Meca del boulder y deportiva en altura: bloques gigantes de ignimbrita a más de 4000 metros de altitud.',
    sectores: ['Volcán Tuzgle (Bloques y Paredes)'],
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-24.0500,-66.4800',
    lat: -24.0500,
    lon: -66.4800,
    altitudMetros: 4200,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/clipapp-62a1f.firebasestorage.app/o/jujuy%2Ftuzgle_banner.png?alt=media',
  },
  {
    id: 'valles-jujenos',
    nombre: 'Valles Jujeños',
    referenciaNombre: 'San Antonio / Termas de Reyes',
    provinciaId: 'jujuy',
    provinciaNombre: 'Jujuy',
    descripcion: 'Escalada deportiva en valles templados con vegetación andina y ríos de montaña.',
    sectores: ['San Antonio', 'Termas de Reyes', 'Las Escaleras'],
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-24.3680,-65.3340',
    lat: -24.3680,
    lon: -65.3340,
    altitudMetros: 1400,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/clipapp-62a1f.firebasestorage.app/o/jujuy%2Fsan_antonio_banner.png?alt=media',
  },

  // ==========================================
  // NEUQUÉN
  // ==========================================
  {
    id: 'san-martin-de-los-andes',
    nombre: 'San Martín de los Andes',
    referenciaNombre: 'Piedra Trompul / Lago Lácar',
    provinciaId: 'neuquen',
    provinciaNombre: 'Neuquén',
    descripcion: 'Paredes y agujas basálticas entre lagos glaciarios y araucarias en el Parque Nacional Lanín.',
    sectores: ['Piedra Trompul', 'Cerro Colorado', 'Sectores Lácar'],
    windguruSpotId: '254881',
    windguruLink: 'https://www.windguru.cz/254881',
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-40.1580,-71.3530',
    lat: -40.1580,
    lon: -71.3530,
    altitudMetros: 850,
  },

  // ==========================================
  // CATAMARCA
  // ==========================================
  {
    id: 'catamarca-sierras',
    nombre: 'Sierras y Valles de Catamarca',
    referenciaNombre: 'Las Juntas / Anquincila',
    provinciaId: 'catamarca',
    provinciaNombre: 'Catamarca',
    descripcion: 'Bloques de granito y sectores de deportiva en valles verdes y ríos serranos.',
    sectores: ['Las Juntas', 'Anquincila', 'Isla Larga', 'El Jumeal'],
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-28.1000,-65.9000',
    lat: -28.1000,
    lon: -65.9000,
    altitudMetros: 1450,
  },

  // ==========================================
  // TUCUMÁN
  // ==========================================
  {
    id: 'tucuman-valles',
    nombre: 'Valles y Sierras Tucumanas',
    referenciaNombre: 'Tafí del Valle / San Javier',
    provinciaId: 'tucuman',
    provinciaNombre: 'Tucumán',
    descripcion: 'Escalada entre yungas y alta montaña tucumana.',
    sectores: ['Tafí del Valle (Viña de la Cruz)', 'San Javier'],
    googleMapsLink: 'https://www.google.com/maps/search/?api=1&query=-26.8520,-65.7110',
    lat: -26.8520,
    lon: -65.7110,
    altitudMetros: 1950,
  },
];

export function getZonesByProvince(provinciaId: string): ClimbingZone[] {
  return CLIMBING_ZONES.filter((z) => z.provinciaId === provinciaId);
}

export function getZoneById(id: string): ClimbingZone | undefined {
  return CLIMBING_ZONES.find((z) => z.id === id);
}
