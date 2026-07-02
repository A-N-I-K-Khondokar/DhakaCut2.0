/**
 * DhakaCut 2.0 — Fix Royal Cuts Barbershop Image (v2)
 * Uses Firestore REST runQuery to find the salon, then patches its image.
 * Run with: node scripts/fix-royal-cuts-image.mjs
 */

const PROJECT_ID = 'dhakacut';
const API_KEY = 'AIzaSyDbsEPs4C6zHIQEcNQQfC5xiQRDYO-xONA';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/default/documents`;

// A high-quality barbershop/salon image from Unsplash
const NEW_IMAGE_URL = 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=600';

function getFieldString(doc, fieldName) {
  const field = doc.fields?.[fieldName];
  if (!field) return null;
  return field.stringValue ?? null;
}

async function runQuery(structuredQuery) {
  const url = `${BASE_URL}:runQuery?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`runQuery failed: ${res.status} ${err}`);
  }
  return res.json();
}

async function patchSalonImage(docName, imageUrl) {
  const docPath = docName.replace(
    `projects/${PROJECT_ID}/databases/default/documents/`,
    ''
  );
  const url = `${BASE_URL}/${docPath}?key=${API_KEY}&updateMask.fieldPaths=image&updateMask.fieldPaths=updatedAt`;

  const body = JSON.stringify({
    fields: {
      image: { stringValue: imageUrl },
      updatedAt: { stringValue: new Date().toISOString() },
    },
  });

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PATCH failed for ${docPath}: ${res.status} ${err}`);
  }
  return res.json();
}

async function main() {
  console.log('\n🔧 Royal Cuts Barbershop — Image Fix Script (v2)');
  console.log('═══════════════════════════════════════════════\n');

  // Strategy 1: query by area = 'Dhanmondi' to find any salon there
  console.log('📡 Querying Firestore for Dhanmondi salon(s)...');

  const queryResult = await runQuery({
    from: [{ collectionId: 'salons' }],
    where: {
      fieldFilter: {
        field: { fieldPath: 'area' },
        op: 'EQUAL',
        value: { stringValue: 'Dhanmondi' },
      },
    },
  });

  const docs = queryResult
    .map(r => r.document)
    .filter(Boolean);

  if (docs.length === 0) {
    console.log('⚠  No Dhanmondi salons found via area query.');
    console.log('   Trying broader search...\n');

    // Try querying all salons (limited)
    const allResult = await runQuery({
      from: [{ collectionId: 'salons' }],
      limit: 50,
    });

    const allDocs = allResult.map(r => r.document).filter(Boolean);
    console.log(`   Found ${allDocs.length} total salons:\n`);
    allDocs.forEach(doc => {
      const name = getFieldString(doc, 'name') || '(no name)';
      const area = getFieldString(doc, 'area') || '(no area)';
      const image = getFieldString(doc, 'image') || '(no image)';
      const docId = doc.name.split('/').pop();
      console.log(`  • [${docId}] ${name} — ${area}`);
      if (!image || image.includes('placeholder') || !image.startsWith('http')) {
        console.log(`    ⚠  Broken image: "${image}"`);
      }
    });

    // Find any salon with missing/broken image
    const broken = allDocs.filter(doc => {
      const img = getFieldString(doc, 'image') || '';
      return !img || !img.startsWith('http');
    });

    if (broken.length > 0) {
      console.log(`\n🖼  Fixing ${broken.length} salon(s) with missing images...\n`);
      for (const doc of broken) {
        const name = getFieldString(doc, 'name');
        const docId = doc.name.split('/').pop();
        try {
          await patchSalonImage(doc.name, NEW_IMAGE_URL);
          console.log(`   ✅ Updated "${name}" (${docId})`);
        } catch (e) {
          console.log(`   ❌ Failed: ${e.message}`);
        }
      }
    }
    return;
  }

  console.log(`   Found ${docs.length} Dhanmondi salon(s):\n`);
  for (const doc of docs) {
    const name = getFieldString(doc, 'name') || '(no name)';
    const area = getFieldString(doc, 'area') || '';
    const image = getFieldString(doc, 'image') || '';
    const docId = doc.name.split('/').pop();
    console.log(`  • [${docId}] "${name}" — ${area}`);
    console.log(`    Current image: ${image || '(empty)'}`);
  }

  // Patch all Dhanmondi salons that have a broken/missing image
  const toFix = docs.filter(doc => {
    const name = getFieldString(doc, 'name') || '';
    const image = getFieldString(doc, 'image') || '';
    // Fix if it's Royal Cuts OR if image is empty/broken
    return (
      name.toLowerCase().includes('royal') ||
      !image ||
      !image.startsWith('http')
    );
  });

  if (toFix.length === 0) {
    console.log('\n✅ All Dhanmondi salons already have valid images. No fix needed.');
    return;
  }

  console.log(`\n🖼  Patching ${toFix.length} salon(s)...\n`);
  for (const doc of toFix) {
    const name = getFieldString(doc, 'name');
    const docId = doc.name.split('/').pop();
    try {
      await patchSalonImage(doc.name, NEW_IMAGE_URL);
      console.log(`   ✅ Updated "${name}" (${docId})`);
      console.log(`      New image: ${NEW_IMAGE_URL}`);
    } catch (e) {
      console.log(`   ❌ Failed to update "${name}": ${e.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('✅ Done! Refresh your browser to see the fix.\n');
}

main().catch(err => {
  console.error('\n❌ Script failed:', err.message);
  process.exit(1);
});
