/**
 * DhakaCut 2.0 — Firestore Seed Script
 * Uses Firebase REST API (no admin SDK required).
 * Run with: node scripts/seed-firestore.mjs
 */

const PROJECT_ID = 'dhakacut';
const API_KEY = 'AIzaSyDbsEPs4C6zHIQEcNQQfC5xiQRDYO-xONA';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/default/documents`;

const now = new Date().toISOString();

// ─── SALON DATA ───────────────────────────────────────────────────────────────
const SALONS = [
  { id: 'salon-1', name: 'DhakaCut Prime', area: 'Banani', address: 'House 42, Road 11, Banani, Dhaka 1213', phone: '+880 1711 122233', lat: 23.7937, lng: 90.4066, image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600', rating: 4.9, description: 'Our flagship branch in Banani offers premium grooming services.', operatingHours: { open: '09:00', close: '20:00' } },
  { id: 'salon-2', name: 'DhakaCut Premium', area: 'Gulshan 2', address: 'Building 12, Madani Avenue, Gulshan 2, Dhaka 1212', phone: '+880 1711 122244', lat: 23.7925, lng: 90.4149, image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', rating: 4.8, description: 'Located in the exclusive Gulshan 2 neighborhood, this premium lounge delivers signature hair styling.', operatingHours: { open: '09:00', close: '20:00' } },
  { id: 'salon-3', name: 'DhakaCut Elite', area: 'Dhanmondi', address: 'Sanmar Tower, Satmasjid Road, Dhanmondi, Dhaka 1209', phone: '+880 1711 122255', lat: 23.7461, lng: 90.3742, image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600', rating: 4.7, description: 'Our Dhanmondi branch brings executive-class cuts and precision shaves.', operatingHours: { open: '09:00', close: '20:00' } },
  { id: 'salon-4', name: 'DhakaCut Classic', area: 'Mirpur', address: 'Plot 15, Block B, Section 10, Mirpur, Dhaka 1216', phone: '+880 1711 122266', lat: 23.8103, lng: 90.3664, image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&q=80&w=600', rating: 4.5, description: 'Serving the vibrant community of Mirpur with top-class hair styling.', operatingHours: { open: '09:00', close: '20:00' } },
  { id: 'salon-5', name: 'DhakaCut Studio', area: 'Uttara', address: 'Sector 3, Sonargaon Janapath, Uttara, Dhaka 1230', phone: '+880 1711 122277', lat: 23.8759, lng: 90.3795, image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=600', rating: 4.6, description: 'Situated in Uttara, this modern grooming studio specializes in current haircut trends.', operatingHours: { open: '09:00', close: '20:00' } },
  { id: 'salon-6', name: 'DhakaCut Express', area: 'Motijheel', address: 'Dilkusha Commercial Area, Motijheel, Dhaka 1000', phone: '+880 1711 122288', lat: 23.7231, lng: 90.4185, image: 'https://images.unsplash.com/photo-1596728325488-58c87691e9af?auto=format&fit=crop&q=80&w=600', rating: 4.4, description: 'Designed for busy executives in Motijheel, our express branch provides fast and high-quality grooming.', operatingHours: { open: '09:00', close: '20:00' } },
  { id: 'salon-7', name: 'DhakaCut Prestige', area: 'Bashundhara', address: 'Block C, Bashundhara R/A, Dhaka 1229', phone: '+880 1711 122299', lat: 23.8136, lng: 90.4243, image: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&q=80&w=600', rating: 4.7, description: 'Located near the residential estates of Bashundhara, this high-end branch offers relaxing hair styling.', operatingHours: { open: '09:00', close: '20:00' } },
  { id: 'salon-8', name: 'DhakaCut Royal', area: 'Mohammadpur', address: 'Ring Road, Mohammadpur, Dhaka 1207', phone: '+880 1711 122300', lat: 23.7629, lng: 90.3567, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600', rating: 4.5, description: 'Bringing premium male grooming to Mohammadpur, our royal branch offers precision beard detailing.', operatingHours: { open: '09:00', close: '20:00' } },
  { id: 'salon-9', name: 'DhakaCut Luxe', area: 'Rayer Bazar', address: 'Rayer Bazar, Dhaka 1209', phone: '+880 1711 122311', lat: 23.7538, lng: 90.3621, image: 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?auto=format&fit=crop&q=80&w=600', rating: 4.3, description: 'Our Rayer Bazar studio delivers specialized hair treatments and beard detailing.', operatingHours: { open: '09:00', close: '20:00' } },
  { id: 'salon-10', name: 'DhakaCut Downtown', area: 'Old Dhaka', address: 'Sadarghat Road, Old Dhaka, Dhaka 1100', phone: '+880 1711 122322', lat: 23.7104, lng: 90.4074, image: 'https://images.unsplash.com/photo-1532710093739-9470acff878f?auto=format&fit=crop&q=80&w=600', rating: 4.6, description: 'Nestled in the historic lanes of Old Dhaka, this branch blends traditional grooming with modern comforts.', operatingHours: { open: '09:00', close: '20:00' } },
];

// ─── SERVICES DATA ────────────────────────────────────────────────────────────
const SERVICE_TEMPLATES = [
  { suffix: '1', name: 'Classic Haircut', description: 'A tailored haircut featuring a personal consultation, a relaxing shampoo, and precision styling.', price: 250, duration: 30, category: 'Hair' },
  { suffix: '2', name: 'Beard Trim & Shape', description: 'Keep your beard neat and well-defined with our professional trimming and outlining service.', price: 150, duration: 20, category: 'Beard' },
  { suffix: '3', name: 'Hot Towel Shave', description: 'Experience a traditional straight razor shave paired with soothing pre-shave oils and hot towels.', price: 300, duration: 40, category: 'Shave' },
  { suffix: '4', name: 'Hair Color (Full)', description: 'Get a full coverage hair color change using premium, skin-safe organic dyes.', price: 800, duration: 90, category: 'Color' },
  { suffix: '5', name: 'Scalp Treatment', description: 'Rejuvenate your hair roots and soothe your dry scalp with our deep-conditioning therapy.', price: 500, duration: 60, category: 'Treatment' },
];

const SERVICES = [];
for (let salonNum = 1; salonNum <= 10; salonNum++) {
  for (const tmpl of SERVICE_TEMPLATES) {
    SERVICES.push({
      id: `service-${salonNum}-${tmpl.suffix}`,
      salonId: `salon-${salonNum}`,
      name: tmpl.name,
      description: tmpl.description,
      price: tmpl.price,
      duration: tmpl.duration,
      category: tmpl.category,
      createdAt: now,
    });
  }
}

// ─── STAFF DATA ───────────────────────────────────────────────────────────────
const STAFF = [
  { id: 'staff-1', salonId: 'salon-1', name: 'Kabir Khan', phone: '+880 1711 223344', experience: 8, specialization: ['Fade Cut', 'Keratin Treatment'], avgRating: 4.9, reviewCount: 42, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', role: 'Senior Stylist', isAvailable: true },
  { id: 'staff-2', salonId: 'salon-1', name: 'Rafsan Ahmed', phone: '+880 1711 223345', experience: 5, specialization: ['Hot Towel Shave', 'Beard Styling'], avgRating: 4.8, reviewCount: 28, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', role: 'Master Barber', isAvailable: true },
  { id: 'staff-3', salonId: 'salon-1', name: 'Mahin Islam', phone: '+880 1711 223346', experience: 3, specialization: ['Fade Cut', 'Scalp Treatment'], avgRating: 4.4, reviewCount: 15, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', role: 'Junior Stylist', isAvailable: true },
  { id: 'staff-4', salonId: 'salon-2', name: 'Arifin Shuvo', phone: '+880 1711 223347', experience: 10, specialization: ['Hair Coloring', 'Keratin Treatment'], avgRating: 4.9, reviewCount: 56, image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200', role: 'Color Expert', isAvailable: true },
  { id: 'staff-5', salonId: 'salon-2', name: 'Imran Khan', phone: '+880 1711 223348', experience: 6, specialization: ['Hot Towel Shave', 'Beard Styling'], avgRating: 4.7, reviewCount: 19, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200', role: 'Master Barber', isAvailable: true },
  { id: 'staff-6', salonId: 'salon-2', name: 'Sajid Hasan', phone: '+880 1711 223349', experience: 4, specialization: ['Scalp Treatment', 'Keratin Treatment'], avgRating: 4.5, reviewCount: 12, image: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&q=80&w=200', role: 'Skin Care Specialist', isAvailable: true },
  { id: 'staff-7', salonId: 'salon-3', name: 'Zayed Khan', phone: '+880 1711 223350', experience: 7, specialization: ['Fade Cut', 'Beard Styling'], avgRating: 4.6, reviewCount: 24, image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200', role: 'Senior Stylist', isAvailable: true },
  { id: 'staff-8', salonId: 'salon-3', name: 'Taskin Ahmed', phone: '+880 1711 223351', experience: 5, specialization: ['Hair Coloring', 'Scalp Treatment'], avgRating: 4.7, reviewCount: 18, image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200', role: 'Color Expert', isAvailable: true },
  { id: 'staff-9', salonId: 'salon-3', name: 'Rubel Mia', phone: '+880 1711 223352', experience: 3, specialization: ['Fade Cut', 'Hot Towel Shave'], avgRating: 4.2, reviewCount: 9, image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200', role: 'Junior Stylist', isAvailable: true },
  { id: 'staff-10', salonId: 'salon-4', name: 'Shakib Al Hasan', phone: '+880 1711 223353', experience: 12, specialization: ['Fade Cut', 'Hot Towel Shave', 'Beard Styling'], avgRating: 5.0, reviewCount: 75, image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200', role: 'Master Barber', isAvailable: true },
  { id: 'staff-11', salonId: 'salon-4', name: 'Tamim Iqbal', phone: '+880 1711 223354', experience: 9, specialization: ['Fade Cut', 'Keratin Treatment'], avgRating: 4.8, reviewCount: 48, image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=200', role: 'Senior Stylist', isAvailable: true },
  { id: 'staff-12', salonId: 'salon-4', name: 'Mushfiqur Rahim', phone: '+880 1711 223355', experience: 8, specialization: ['Scalp Treatment'], avgRating: 4.7, reviewCount: 32, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', role: 'Skin Care Specialist', isAvailable: true },
  { id: 'staff-13', salonId: 'salon-5', name: 'Mustafizur Rahman', phone: '+880 1711 223356', experience: 4, specialization: ['Fade Cut', 'Beard Styling'], avgRating: 4.5, reviewCount: 14, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', role: 'Junior Stylist', isAvailable: true },
  { id: 'staff-14', salonId: 'salon-5', name: 'Mahmudullah Riyad', phone: '+880 1711 223357', experience: 11, specialization: ['Hair Coloring', 'Keratin Treatment'], avgRating: 4.9, reviewCount: 60, image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=200', role: 'Color Expert', isAvailable: true },
  { id: 'staff-15', salonId: 'salon-5', name: 'Soumya Sarkar', phone: '+880 1711 223358', experience: 5, specialization: ['Hot Towel Shave', 'Beard Styling'], avgRating: 4.3, reviewCount: 21, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200', role: 'Master Barber', isAvailable: true },
  { id: 'staff-16', salonId: 'salon-6', name: 'Liton Das', phone: '+880 1711 223359', experience: 6, specialization: ['Fade Cut', 'Scalp Treatment'], avgRating: 4.6, reviewCount: 22, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', role: 'Senior Stylist', isAvailable: true },
  { id: 'staff-17', salonId: 'salon-6', name: 'Mehidy Miraz', phone: '+880 1711 223360', experience: 5, specialization: ['Scalp Treatment', 'Keratin Treatment'], avgRating: 4.7, reviewCount: 18, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', role: 'Skin Care Specialist', isAvailable: true },
  { id: 'staff-18', salonId: 'salon-6', name: 'Shoriful Islam', phone: '+880 1711 223361', experience: 2, specialization: ['Fade Cut', 'Hot Towel Shave'], avgRating: 4.1, reviewCount: 10, image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200', role: 'Junior Stylist', isAvailable: true },
  { id: 'staff-19', salonId: 'salon-7', name: 'Towhid Hridoy', phone: '+880 1711 223362', experience: 4, specialization: ['Fade Cut', 'Hot Towel Shave', 'Beard Styling'], avgRating: 4.8, reviewCount: 25, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', role: 'Master Barber', isAvailable: true },
  { id: 'staff-20', salonId: 'salon-7', name: 'Najmul Shanto', phone: '+880 1711 223363', experience: 5, specialization: ['Hair Coloring', 'Keratin Treatment'], avgRating: 4.4, reviewCount: 16, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', role: 'Color Expert', isAvailable: true },
  { id: 'staff-21', salonId: 'salon-7', name: 'Rishad Hossain', phone: '+880 1711 223364', experience: 3, specialization: ['Fade Cut', 'Scalp Treatment'], avgRating: 4.7, reviewCount: 12, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200', role: 'Senior Stylist', isAvailable: true },
  { id: 'staff-22', salonId: 'salon-8', name: 'Tanzim Sakib', phone: '+880 1711 223365', experience: 2, specialization: ['Fade Cut', 'Beard Styling'], avgRating: 4.5, reviewCount: 8, image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200', role: 'Junior Stylist', isAvailable: true },
  { id: 'staff-23', salonId: 'salon-8', name: 'Jaker Ali', phone: '+880 1711 223366', experience: 4, specialization: ['Scalp Treatment'], avgRating: 4.6, reviewCount: 14, image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=200', role: 'Skin Care Specialist', isAvailable: true },
  { id: 'staff-24', salonId: 'salon-8', name: 'Ebadot Hossain', phone: '+880 1711 223367', experience: 6, specialization: ['Hot Towel Shave', 'Beard Styling'], avgRating: 4.8, reviewCount: 30, image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200', role: 'Master Barber', isAvailable: true },
  { id: 'staff-25', salonId: 'salon-9', name: 'Nasum Ahmed', phone: '+880 1711 223368', experience: 5, specialization: ['Hair Coloring', 'Scalp Treatment'], avgRating: 4.3, reviewCount: 11, image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200', role: 'Color Expert', isAvailable: true },
  { id: 'staff-26', salonId: 'salon-9', name: 'Afif Hossain', phone: '+880 1711 223369', experience: 6, specialization: ['Fade Cut', 'Keratin Treatment'], avgRating: 4.5, reviewCount: 18, image: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&q=80&w=200', role: 'Senior Stylist', isAvailable: true },
  { id: 'staff-27', salonId: 'salon-9', name: 'Naim Sheikh', phone: '+880 1711 223370', experience: 3, specialization: ['Fade Cut', 'Hot Towel Shave'], avgRating: 4.2, reviewCount: 7, image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200', role: 'Junior Stylist', isAvailable: true },
  { id: 'staff-28', salonId: 'salon-10', name: 'Shamim Patwari', phone: '+880 1711 223371', experience: 4, specialization: ['Fade Cut', 'Beard Styling'], avgRating: 4.6, reviewCount: 15, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200', role: 'Senior Stylist', isAvailable: true },
  { id: 'staff-29', salonId: 'salon-10', name: 'Mahedi Hasan', phone: '+880 1711 223372', experience: 7, specialization: ['Hot Towel Shave', 'Beard Styling'], avgRating: 4.7, reviewCount: 28, image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200', role: 'Master Barber', isAvailable: true },
  { id: 'staff-30', salonId: 'salon-10', name: 'Hasan Mahmud', phone: '+880 1711 223373', experience: 5, specialization: ['Scalp Treatment', 'Keratin Treatment'], avgRating: 4.8, reviewCount: 20, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', role: 'Skin Care Specialist', isAvailable: true },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Convert a JS value to Firestore REST API field format */
function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) fields[k] = toFirestoreValue(v);
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

/** Convert a flat JS object to Firestore REST API document fields */
function toFirestoreDoc(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'id') continue; // id is the document name, not a field
    fields[k] = toFirestoreValue(v);
  }
  return { fields };
}

/** Write a document via Firestore REST API (PATCH = create or overwrite) */
async function writeDoc(collection, docId, data) {
  const url = `${BASE_URL}/${collection}/${docId}?key=${API_KEY}`;
  const body = JSON.stringify(toFirestoreDoc({ ...data, createdAt: data.createdAt || now, updatedAt: now }));
  
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to write ${collection}/${docId}: ${res.status} ${err}`);
  }
  return res.json();
}

// ─── MAIN SEED FUNCTION ───────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱 DhakaCut Firestore Seed Script');
  console.log('═══════════════════════════════════\n');
  console.log(`📡 Project: ${PROJECT_ID}`);
  console.log(`📊 Seeding: ${SALONS.length} salons, ${SERVICES.length} services, ${STAFF.length} staff\n`);

  // ── Salons ──
  console.log('▶ Seeding salons...');
  let ok = 0, fail = 0;
  for (const salon of SALONS) {
    try {
      await writeDoc('salons', salon.id, salon);
      process.stdout.write('  ✓ ' + salon.name + '\n');
      ok++;
    } catch (e) {
      process.stdout.write('  ✗ ' + salon.name + ': ' + e.message + '\n');
      fail++;
    }
  }
  console.log(`  → ${ok} salons written, ${fail} failed\n`);

  // ── Services ──
  console.log('▶ Seeding services...');
  ok = 0; fail = 0;
  for (const svc of SERVICES) {
    try {
      await writeDoc('services', svc.id, svc);
      ok++;
    } catch (e) {
      process.stdout.write('  ✗ ' + svc.id + ': ' + e.message + '\n');
      fail++;
    }
  }
  console.log(`  → ${ok} services written, ${fail} failed\n`);

  // ── Staff ──
  console.log('▶ Seeding staff...');
  ok = 0; fail = 0;
  for (const member of STAFF) {
    try {
      await writeDoc('staff', member.id, member);
      process.stdout.write('  ✓ ' + member.name + '\n');
      ok++;
    } catch (e) {
      process.stdout.write('  ✗ ' + member.name + ': ' + e.message + '\n');
      fail++;
    }
  }
  console.log(`  → ${ok} staff written, ${fail} failed\n`);

  console.log('═══════════════════════════════════');
  console.log('✅ Seeding complete!\n');
}

seed().catch(err => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});
