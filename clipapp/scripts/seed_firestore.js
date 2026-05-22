/**
 * seed_firestore.js
 * 
 * Standalone Node.js script to seed Firestore with climbing data
 * from climbingData.json using the Firebase REST API.
 * 
 * Usage: node scripts/seed_firestore.js
 * 
 * Note: This script uses the Firebase REST API with the project's API key,
 * so it respects your Firestore Security Rules. You must be authenticated
 * as an admin (horaciovinuesa@gmail.com) for writes to succeed.
 * 
 * Alternatively, use the "Sincronizar Vías (JSON)" button in the admin panel.
 */

const https = require('https');
const climbingData = require('../lib/climbingData.json');

// Firebase project config (same as lib/firebase.ts)
const PROJECT_ID = 'clipapp-62a1f';
const API_KEY = 'AIzaSyCDZfagZmhE_84lLkUJImAot1Ye68KNm-4';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

let totalSectors = 0;
let processedSectors = 0;

function httpsRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.error?.message || data}`));
          } else {
            resolve(parsed);
          }
        } catch {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function makeFirestoreField(value) {
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') return { integerValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(item => {
          if (typeof item === 'object' && item !== null) {
            return { mapValue: { fields: makeFirestoreFields(item) } };
          }
          return makeFirestoreField(item);
        })
      }
    };
  }
  if (typeof value === 'object' && value !== null) {
    return { mapValue: { fields: makeFirestoreFields(value) } };
  }
  return { nullValue: null };
}

function makeFirestoreFields(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    fields[key] = makeFirestoreField(value);
  }
  return fields;
}

async function patchDocument(docPath, fields) {
  const url = new URL(`${BASE_URL}/${docPath}?key=${API_KEY}`);
  const body = { fields };

  const options = {
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${docPath}?key=${API_KEY}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  return httpsRequest(options, body);
}

async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  ClipApp - Firestore Seeder (Climbing Data)    ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  console.log('⚠️  NOTE: This script uses anonymous writes via REST API.');
  console.log('   If Firestore rules require admin auth, use the admin panel button instead.\n');

  // Count total sectors for progress tracking
  for (const province of climbingData) {
    for (const area of province.areas) {
      totalSectors += area.sectores.length;
    }
  }
  console.log(`📊 Data summary:`);
  console.log(`   Provinces: ${climbingData.length}`);
  let totalAreas = 0;
  let totalVias = 0;
  for (const p of climbingData) {
    totalAreas += p.areas.length;
    for (const a of p.areas) {
      for (const s of a.sectores) {
        totalVias += s.vias.length;
      }
    }
  }
  console.log(`   Areas: ${totalAreas}`);
  console.log(`   Sectors: ${totalSectors}`);
  console.log(`   Routes (Vías): ${totalVias}\n`);

  // Verify storage URLs use correct domain
  let sampleUrl = '';
  for (const p of climbingData) {
    for (const a of p.areas) {
      for (const s of a.sectores) {
        if (s.imageUrl) { sampleUrl = s.imageUrl; break; }
      }
      if (sampleUrl) break;
    }
    if (sampleUrl) break;
  }
  console.log(`🔗 Sample image URL: ${sampleUrl}\n`);

  if (sampleUrl.includes('appspot.com')) {
    console.error('❌ ERROR: Image URLs still use appspot.com domain! Re-run parse_climbing_data.js first.');
    process.exit(1);
  }

  console.log('🚀 Starting Firestore seeding...\n');

  let errors = 0;
  for (const province of climbingData) {
    process.stdout.write(`📍 Province: ${province.nombre}...`);
    try {
      await patchDocument(`provincias/${province.id}`, { nombre: { stringValue: province.nombre } });
      process.stdout.write(' ✓\n');
    } catch (e) {
      process.stdout.write(` ✗ (${e.message})\n`);
      errors++;
      continue;
    }

    for (const area of province.areas) {
      try {
        await patchDocument(
          `provincias/${province.id}/areas/${area.id}`,
          makeFirestoreFields({
            nombre: area.nombre,
            descripcion: area.descripcion || '',
            tiempoCaminata: area.tiempoCaminata || '',
            googleMapsLink: area.googleMapsLink || '',
            hospitalLink: area.hospitalLink || '',
            windguruLink: area.windguruLink || '',
            imageUrl: area.imageUrl || '',
            howToGetImageUrl: area.howToGetImageUrl || '',
            overviewImageUrl: area.overviewImageUrl || ''
          })
        );
      } catch (e) {
        console.error(`  ✗ Area ${area.nombre}: ${e.message}`);
        errors++;
      }

      for (const sector of area.sectores) {
        processedSectors++;
        const pct = Math.round((processedSectors / totalSectors) * 100);
        process.stdout.write(`\r   ⏳ Seeding sectors: ${processedSectors}/${totalSectors} (${pct}%)   `);
        try {
          await patchDocument(
            `provincias/${province.id}/areas/${area.id}/sectores/${sector.id}`,
            makeFirestoreFields({
              nombre: sector.nombre,
              descripcion: sector.descripcion || '',
              imageUrl: sector.imageUrl || '',
              overviewImageUrl: sector.overviewImageUrl || '',
              comoLlegarImageUrl: sector.comoLlegarImageUrl || '',
              generalImageUrl: sector.generalImageUrl || '',
              izquierdaImageUrl: sector.izquierdaImageUrl || '',
              centroImageUrl: sector.centroImageUrl || '',
              derechaImageUrl: sector.derechaImageUrl || '',
              vias: sector.vias
            })
          );
        } catch (e) {
          errors++;
          process.stdout.write(`\n  ✗ Sector ${sector.nombre}: ${e.message}\n`);
        }
      }
    }
    process.stdout.write('\n');
  }

  console.log('\n════════════════════════════════════════════════');
  if (errors === 0) {
    console.log('✅ Seeding completed successfully! No errors.');
  } else {
    console.log(`⚠️  Seeding completed with ${errors} error(s).`);
    console.log('   Errors usually mean Firestore security rules require admin login.');
    console.log('   Use the "Sincronizar Vías (JSON)" button in the admin panel instead.');
  }
  console.log('════════════════════════════════════════════════');
}

main().catch(console.error);
