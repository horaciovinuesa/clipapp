const fs = require('fs');
const path = require('path');

const MOBILE_LIB_PATH = '/Users/horaciovinuesa/development/escalando_cordoba/lib';
const OUTPUT_FILE_PATH = '/Users/horaciovinuesa/development/GitHub/clipapp/clipapp/lib/climbingData.json';

const provincesConfig = [
  {
    id: 'cordoba',
    nombre: 'Córdoba',
    areas: [
      { name: 'La Cantera', path: 'screens/ruta_pages/la_cantera_page.dart' },
      { name: 'El Colibrí', path: 'screens/ruta_pages/el_colibri_page.dart' },
      { name: 'Cueva de las Brujas', path: 'screens/ruta_pages/cueva_de_las_brujas_page.dart' },
      { name: 'Ascochinga', path: 'screens/ruta_pages/ascochinga_page.dart' },
      { name: 'Bialet Massé', path: 'screens/ruta_pages/bialet_masse_page.dart' },
      { name: 'La Calera - El Horno', path: 'screens/ruta_pages/calera_el_horno.dart' },
      { name: 'Valle Hermoso', path: 'screens/ruta_pages/valle_hermoso_page.dart' },
      { name: 'Mina Clavero', path: 'screens/ruta_pages/mina_clavero_page.dart' },
      { name: 'La Cueva de los Pajaritos', path: 'screens/ruta_pages/cueva_de_los_pajaritos.dart' },
      { name: 'El Secretillo', path: 'screens/ruta_pages/el_secretillo_page.dart' },
      { name: 'Teatro / Corral', path: 'screens/ruta_pages/teatro_page.dart' },
      { name: 'La Ola', path: 'screens/ruta_pages/la_ola_page.dart' },
      { name: 'Zona Torres Gemelas-La Ballena', path: 'screens/ruta_pages/torres_gemelas_page.dart' },
      { name: 'Los Paredones', path: 'screens/ruta_pages/capila_del_monte/paredones_page.dart' },
      { name: 'Mogotes', path: 'screens/ruta_pages/capila_del_monte/mogotes_page.dart' },
      { name: 'El Paraiso', path: 'screens/ruta_pages/capila_del_monte/paraiso_page.dart' },
      { name: 'Copina I (Segundo Puente)', path: 'screens/ruta_pages/copina/segundo_puente_page.dart' },
      { name: 'Copina II (Sector Hernan)' },
      { name: 'Copina III (Sector Imperial)' },
      { name: 'Copina IV' },
      { name: 'Guia General', path: 'screens/ruta_pages/los_gigantes/guia_general_page.dart' },
      { name: 'Cerro de la cruz', path: 'screens/ruta_pages/los_gigantes/cerro_de_la_cruz_page.dart' },
      { name: 'Zona del Refugio C.A.C', path: 'screens/ruta_pages/los_gigantes/zona_del_refugio_page.dart' },
      { name: 'El Ostiazo', path: 'screens/ruta_pages/los_gigantes/el_ostiazo_page.dart' }
    ]
  },
  {
    id: 'mendoza',
    nombre: 'Mendoza',
    areas: [
      { name: 'Agua de Las Avispas' },
      { name: 'El Santuario', path: 'screens/ruta_pages/mendoza/el_santuario_page.dart' },
      { name: 'Cacheuta' },
      { name: 'Potretillos' },
      { name: 'Cajon de Arenales' },
      { name: 'Agua Del Toro' }
    ]
  },
  {
    id: 'san-luis',
    nombre: 'San Luis',
    areas: [
      { name: 'Villa Del Carmen', path: 'screens/ruta_pages/san_luis/villa_del_carmen_page.dart' },
      { name: 'Valle De Pacanta / Peñon' }
    ]
  },
  {
    id: 'la-rioja',
    nombre: 'La Rioja',
    areas: [
      { name: 'Cuesta de Miranda', path: 'screens/ruta_pages/la_rioja/cuesta_miranda_page.dart' }
    ]
  },
  {
    id: 'chubut',
    nombre: 'Chubut',
    areas: [
      { name: 'Lago Puelo' },
      { name: 'Piedra Parada/La Buitrera', path: 'screens/ruta_pages/chubut/piedra_parada_page.dart' },
      { name: 'Esquel', path: 'screens/ruta_pages/chubut/esquel_page.dart' },
      { name: 'Trevelin', path: 'screens/ruta_pages/chubut/trevelin_page.dart' },
      { name: 'Boca Toma' }
    ]
  },
  {
    id: 'catamarca',
    nombre: 'Catamarca',
    areas: [
      { name: 'Las Juntas' },
      { name: 'Anquincila' },
      { name: 'Isla Larga' },
      { name: 'El Jumeal' }
    ]
  },
  {
    id: 'tucuman',
    nombre: 'Tucumán',
    areas: [
      { name: 'En construcción' }
    ]
  },
  {
    id: 'neuquen',
    nombre: 'Neuquén',
    areas: [
      { name: 'San Martin de los Andes' }
    ]
  },
  {
    id: 'jujuy',
    nombre: 'Jujuy',
    areas: [
      { name: 'San Antonio', path: 'screens/ruta_pages/jujuy/san_antonio_page.dart' },
      { name: 'Termas de Reyes', path: 'screens/ruta_pages/jujuy/termas_de_reyes_page.dart' },
      { name: 'Las Escaleras', path: 'screens/ruta_pages/jujuy/las_escaleras_page.dart' },
      { name: 'Barcena', path: 'screens/ruta_pages/jujuy/barcena_page.dart' },
      { name: 'El Roncal', path: 'screens/ruta_pages/jujuy/el_roncal_page.dart' },
      { name: 'Tilcara', path: 'screens/ruta_pages/jujuy/tilcara_page.dart' },
      { name: 'Yavi', path: 'screens/ruta_pages/jujuy/yavi_page.dart' },
      { name: 'Tuzgle', path: 'screens/ruta_pages/jujuy/tuzgle_page.dart' }
    ]
  }
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function getStorageUrl(storagePath) {
  if (!storagePath) return '';
  return `https://firebasestorage.googleapis.com/v0/b/clipapp-62a1f.firebasestorage.app/o/${encodeURIComponent(storagePath)}?alt=media`;
}

function resolveImport(importingFile, importPath) {
  if (importPath.startsWith('package:escalando_cordoba/')) {
    return path.join(MOBILE_LIB_PATH, importPath.replace('package:escalando_cordoba/', ''));
  }
  return path.resolve(path.dirname(importingFile), importPath);
}

function parseRouteListContent(content) {
  const routes = [];
  const mapRegex = /\{([\s\S]*?)\}/g;
  let match;

  while ((match = mapRegex.exec(content)) !== null) {
    const mapContent = match[1];
    const route = {};
    const kvRegex = /['"]?(\w+)['"]?\s*:\s*(?:['"]([^'"]*)['"]|([0-9?.\-]+))/g;
    let kvMatch;

    while ((kvMatch = kvRegex.exec(mapContent)) !== null) {
      const key = kvMatch[1];
      const val = kvMatch[2] !== undefined ? kvMatch[2] : kvMatch[3];
      route[key] = val;
    }

    if (route.name || route.nombre) {
      routes.push(route);
    }
  }

  return routes;
}

function parseSectorFile(sectorFilePath, sectorClassName, sectorSlug) {
  const content = fs.readFileSync(sectorFilePath, 'utf8');

  // Find all arrays: vias1, vias2, vias3, vias, _viasByImage, viasByImage
  const listRegex = /\b(vias\d*|_viasByImage|viasByImage|_vias|vias)\s*(?:=|:)\s*(?:const\s+)?(?:List<[^>]+>\s*)?\[([\s\S]*?)\]\s*(?:;|,)/g;
  let match;
  const lists = {};

  while ((match = listRegex.exec(content)) !== null) {
    const listName = match[1];
    const listContent = match[2];
    lists[listName] = listContent;
  }

  const numberedListNames = Object.keys(lists).filter(name => /^vias\d+$/.test(name));
  let routesToParse = [];

  if (numberedListNames.length > 0) {
    // Route Duplication Fix: use numbered lists only, ignore combined 'vias' list
    numberedListNames.sort((a, b) => {
      const numA = parseInt(a.replace('vias', ''), 10);
      const numB = parseInt(b.replace('vias', ''), 10);
      return numA - numB;
    });

    console.log(`  Found numbered lists for ${sectorClassName}: ${numberedListNames.join(', ')}`);

    for (const listName of numberedListNames) {
      const listContent = lists[listName];
      const parsedRoutes = parseRouteListContent(listContent);

      let group = 'General';
      if (sectorClassName === 'ParedonesDesplomeSatanPage') {
        // Custom mapping: vias1 -> Derecha, vias2 -> Centro, vias3 -> Izquierda
        if (listName === 'vias1') group = 'Derecha';
        else if (listName === 'vias2') group = 'Centro';
        else if (listName === 'vias3') group = 'Izquierda';
      } else {
        // Standard mapping: vias1 -> Izquierda, vias2 -> Centro, vias3 -> Derecha
        if (listName === 'vias1') {
          group = 'Izquierda';
        } else if (listName === 'vias2') {
          group = numberedListNames.length === 2 ? 'Derecha' : 'Centro';
        } else if (listName === 'vias3') {
          group = 'Derecha';
        }
      }

      parsedRoutes.forEach(r => {
        r.grupo = group;
        routesToParse.push(r);
      });
    }
  } else {
    // Fall back to vias list or viasByImage mapping
    const fallbackListName = Object.keys(lists).find(name => name === 'vias' || name === '_viasByImage' || name === 'viasByImage' || name === '_vias');
    if (fallbackListName) {
      console.log(`  Found fallback list for ${sectorClassName}: ${fallbackListName}`);
      routesToParse = parseRouteListContent(lists[fallbackListName]);
      routesToParse.forEach(r => {
        r.grupo = 'General';
      });
    } else {
      console.log(`  No list matched for ${sectorClassName}, trying global match...`);
      routesToParse = parseRouteListContent(content);
      routesToParse.forEach(r => {
        r.grupo = 'General';
      });
    }
  }

  // Normalize route properties
  const finalRoutes = routesToParse.map((via, idx) => {
    let cleanName = (via.name || via.nombre || '').replace(/^\d+[\s\-.]*/, '').trim();
    if (!cleanName) {
      cleanName = `Vía ${idx + 1}`;
    }

    let grade = (via.grade || via.grado || '').trim();
    if (!grade) grade = '?';

    let altura = (via.altitude || via.length || via.height || '').trim();
    if (altura === '-' || altura === '??' || altura === '???') {
      altura = '';
    } else if (altura && /^\d+$/.test(altura)) {
      altura = `${altura}m`;
    }

    let chapas = parseInt(via.bolts || via.chapas, 10);
    if (isNaN(chapas)) {
      const notesVal = via.notes || via.length || '';
      const chapasMatch = notesVal.match(/(\d+)\s*chapas/i);
      if (chapasMatch) {
        chapas = parseInt(chapasMatch[1], 10);
      } else {
        chapas = 0;
      }
    }

    return {
      id: `${sectorSlug}-${idx + 1}`,
      nombre: cleanName,
      grado: grade,
      altura: altura,
      chapas: chapas,
      grupo: via.grupo || 'General'
    };
  });

  return finalRoutes;
}

function processAreaFile(areaFilePath, areaSlug) {
  const content = fs.readFileSync(areaFilePath, 'utf8');

  // Parse imports in this area page to map sector page classes to files
  const importRegex = /import\s+['"]([^'"]+)['"]/g;
  let importMatch;
  const resolvedImports = [];

  while ((importMatch = importRegex.exec(content)) !== null) {
    const importPathVal = importMatch[1];
    if (importPathVal.endsWith('.dart')) {
      resolvedImports.push(resolveImport(areaFilePath, importPathVal));
    }
  }

  // Helper to find which file defines a sector class
  function findSectorFileByClass(className) {
    for (const filePath of resolvedImports) {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        if (fileContent.includes(`class ${className}`)) {
          return filePath;
        }
      }
    }
    return null;
  }

  // Parse sector blocks
  // Matches: _SectorInfo(...) or SectorInfo(...)
  const sectorBlockRegex = /(?:_SectorInfo|SectorInfo)\s*\(([\s\S]*?)\)/g;
  let sectorMatch;
  const sectores = [];

  while ((sectorMatch = sectorBlockRegex.exec(content)) !== null) {
    const blockContent = sectorMatch[1];

    const nameMatch = blockContent.match(/name\s*:\s*['"]([^'"]+)['"]/);
    const orientationMatch = blockContent.match(/orientation\s*:\s*['"]([^'"]+)['"]/);
    const storagePathMatch = blockContent.match(/(?:storagePath|imageStoragePath)\s*:\s*['"]([^'"]+)['"]/);
    const classMatch = blockContent.match(/\b(\w+Page)\b/);
    const summaryMatch = blockContent.match(/summary\s*:\s*['"]([^'"]+)['"]/);

    if (nameMatch) {
      const name = nameMatch[1];
      const sectorSlug = `${areaSlug}-${slugify(name)}`;
      const orientation = orientationMatch ? orientationMatch[1] : '-';
      const storagePath = storagePathMatch ? storagePathMatch[1] : '';
      const summary = summaryMatch ? summaryMatch[1] : '';

      console.log(`Processing Sector: ${name} (class: ${classMatch ? classMatch[1] : 'Unknown'})`);

      let vias = [];
      if (classMatch) {
        const sectorClassName = classMatch[1];
        const sectorFilePath = findSectorFileByClass(sectorClassName);
        if (sectorFilePath && fs.existsSync(sectorFilePath)) {
          vias = parseSectorFile(sectorFilePath, sectorClassName, sectorSlug);
        } else {
          console.warn(`  Warning: Could not find file defining class ${sectorClassName}`);
        }
      }

      sectores.push({
        id: sectorSlug,
        nombre: name,
        descripcion: summary || `Sector ${name}. Orientación: ${orientation}`,
        imageUrl: getStorageUrl(storagePath),
        vias: vias
      });
    }
  }

  return sectores;
}

function run() {
  console.log('Starting climbing data extraction parser...');
  const results = [];

  for (const province of provincesConfig) {
    const provinceSlug = province.id;
    console.log(`\n========================================\nProvince: ${province.nombre} (${provinceSlug})`);

    const areasList = [];
    for (const area of province.areas) {
      const areaSlug = slugify(area.name);
      console.log(`Processing Area: ${area.name} (${areaSlug})`);

      let sectores = [];
      if (area.path) {
        const areaFilePath = path.join(MOBILE_LIB_PATH, area.path);
        if (fs.existsSync(areaFilePath)) {
          sectores = processAreaFile(areaFilePath, areaSlug);
        } else {
          console.warn(`  Warning: Area file does not exist: ${areaFilePath}`);
        }
      } else {
        console.log(`  Area has no path (placeholder or in construction).`);
      }

      areasList.push({
        id: areaSlug,
        nombre: area.name,
        sectores: sectores
      });
    }

    results.push({
      id: provinceSlug,
      nombre: province.nombre,
      areas: areasList
    });
  }

  console.log(`\nWriting extracted climbing data to ${OUTPUT_FILE_PATH}...`);
  fs.writeFileSync(OUTPUT_FILE_PATH, JSON.stringify(results, null, 2), 'utf8');
  console.log('Extraction completed successfully!');
}

run();
