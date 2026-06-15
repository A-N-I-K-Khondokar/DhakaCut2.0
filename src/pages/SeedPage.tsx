import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

// ─── Inline seed data (mirrors MOCK_ arrays in firestoreService) ─────────────

const SALONS = [
  { id: 'salon-1', name: 'DhakaCut Prime', area: 'Banani', address: 'House 42, Road 11, Banani, Dhaka 1213', phone: '+880 1711 122233', lat: 23.7937, lng: 90.4066, image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600', rating: 4.9, description: 'Our flagship branch in Banani offers premium grooming services with top-tier professionals. Experience the ultimate hair styling, hot towel shaves, and skin treatments in a luxurious environment.', operatingHours: { open: '09:00', close: '20:00' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'salon-2', name: 'DhakaCut Premium', area: 'Gulshan 2', address: 'Building 12, Madani Avenue, Gulshan 2, Dhaka 1212', phone: '+880 1711 122244', lat: 23.7925, lng: 90.4149, image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', rating: 4.8, description: 'Located in the exclusive Gulshan 2 neighborhood, this premium lounge delivers signature hair styling and luxury grooming.', operatingHours: { open: '09:00', close: '20:00' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'salon-3', name: 'DhakaCut Elite', area: 'Dhanmondi', address: 'Sanmar Tower, Satmasjid Road, Dhanmondi, Dhaka 1209', phone: '+880 1711 122255', lat: 23.7461, lng: 90.3742, image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600', rating: 4.7, description: 'Our Dhanmondi branch brings executive-class cuts and precision shaves closer to you.', operatingHours: { open: '09:00', close: '20:00' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'salon-4', name: 'DhakaCut Classic', area: 'Mirpur', address: 'Plot 15, Block B, Section 10, Mirpur, Dhaka 1216', phone: '+880 1711 122266', lat: 23.8103, lng: 90.3664, image: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&q=80&w=600', rating: 4.5, description: 'Serving the vibrant community of Mirpur, this branch provides top-class hair styling and shaves at highly competitive rates.', operatingHours: { open: '09:00', close: '20:00' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'salon-5', name: 'DhakaCut Studio', area: 'Uttara', address: 'Sector 3, Sonargaon Janapath, Uttara, Dhaka 1230', phone: '+880 1711 122277', lat: 23.8759, lng: 90.3795, image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=600', rating: 4.6, description: 'Situated in Uttara, this modern grooming studio specializes in current haircut trends and custom styling.', operatingHours: { open: '09:00', close: '20:00' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'salon-6', name: 'DhakaCut Express', area: 'Motijheel', address: 'Dilkusha Commercial Area, Motijheel, Dhaka 1000', phone: '+880 1711 122288', lat: 23.7231, lng: 90.4185, image: 'https://images.unsplash.com/photo-1596728325488-58c87691e9af?auto=format&fit=crop&q=80&w=600', rating: 4.4, description: 'Designed for busy executives in Motijheel, our express branch provides fast and high-quality grooming services.', operatingHours: { open: '09:00', close: '20:00' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'salon-7', name: 'DhakaCut Prestige', area: 'Bashundhara', address: 'Block C, Bashundhara R/A, Dhaka 1229', phone: '+880 1711 122299', lat: 23.8136, lng: 90.4243, image: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&q=80&w=600', rating: 4.7, description: 'Located near the residential estates of Bashundhara, this high-end branch offers relaxing hair styling and facial services.', operatingHours: { open: '09:00', close: '20:00' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'salon-8', name: 'DhakaCut Royal', area: 'Mohammadpur', address: 'Ring Road, Mohammadpur, Dhaka 1207', phone: '+880 1711 122300', lat: 23.7629, lng: 90.3567, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600', rating: 4.5, description: 'Bringing premium male grooming to Mohammadpur, our royal branch offers precision beard detailing and classic cuts.', operatingHours: { open: '09:00', close: '20:00' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'salon-9', name: 'DhakaCut Luxe', area: 'Rayer Bazar', address: 'Rayer Bazar, Dhaka 1209', phone: '+880 1711 122311', lat: 23.7538, lng: 90.3621, image: 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?auto=format&fit=crop&q=80&w=600', rating: 4.3, description: 'Our Rayer Bazar studio delivers specialized hair treatments and beard detailing.', operatingHours: { open: '09:00', close: '20:00' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'salon-10', name: 'DhakaCut Downtown', area: 'Old Dhaka', address: 'Sadarghat Road, Old Dhaka, Dhaka 1100', phone: '+880 1711 122322', lat: 23.7104, lng: 90.4074, image: 'https://images.unsplash.com/photo-1532710093739-9470acff878f?auto=format&fit=crop&q=80&w=600', rating: 4.6, description: 'Nestled in the historic lanes of Old Dhaka, this branch blends traditional grooming with modern comforts.', operatingHours: { open: '09:00', close: '20:00' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const SERVICE_NAMES = [
  { name: 'Classic Haircut', description: 'A tailored haircut featuring a personal consultation, a relaxing shampoo, and precision styling.', price: 250, duration: 30, category: 'Hair' },
  { name: 'Beard Trim & Shape', description: 'Keep your beard neat and well-defined with our professional trimming and outlining service.', price: 150, duration: 20, category: 'Beard' },
  { name: 'Hot Towel Shave', description: 'Experience a traditional straight razor shave paired with soothing pre-shave oils and hot towels.', price: 300, duration: 40, category: 'Shave' },
  { name: 'Hair Color (Full)', description: 'Get a full coverage hair color change using premium, skin-safe organic dyes.', price: 800, duration: 90, category: 'Color' },
  { name: 'Scalp Treatment', description: 'Rejuvenate your hair roots and soothe your dry scalp with our deep-conditioning therapy.', price: 500, duration: 60, category: 'Treatment' },
];

const STAFF_BY_SALON: Record<string, { id: string; name: string; role: string; experience: number; specialization: string[]; avgRating: number; reviewCount: number; image: string; phone: string }[]> = {
  'salon-1': [
    { id: 'staff-1', name: 'Kabir Khan', role: 'Senior Stylist', experience: 8, specialization: ['Fade Cut', 'Keratin Treatment'], avgRating: 4.9, reviewCount: 42, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', phone: '+880 1711 223344' },
    { id: 'staff-2', name: 'Rafsan Ahmed', role: 'Master Barber', experience: 5, specialization: ['Hot Towel Shave', 'Beard Styling'], avgRating: 4.8, reviewCount: 28, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', phone: '+880 1711 223345' },
    { id: 'staff-3', name: 'Mahin Islam', role: 'Junior Stylist', experience: 3, specialization: ['Fade Cut', 'Scalp Treatment'], avgRating: 4.4, reviewCount: 15, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', phone: '+880 1711 223346' },
  ],
  'salon-2': [
    { id: 'staff-4', name: 'Arifin Shuvo', role: 'Color Expert', experience: 10, specialization: ['Hair Coloring', 'Keratin Treatment'], avgRating: 4.9, reviewCount: 56, image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200', phone: '+880 1711 223347' },
    { id: 'staff-5', name: 'Imran Khan', role: 'Master Barber', experience: 6, specialization: ['Hot Towel Shave', 'Beard Styling'], avgRating: 4.7, reviewCount: 19, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200', phone: '+880 1711 223348' },
  ],
  'salon-3': [
    { id: 'staff-7', name: 'Zayed Khan', role: 'Senior Stylist', experience: 7, specialization: ['Fade Cut', 'Beard Styling'], avgRating: 4.6, reviewCount: 24, image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200', phone: '+880 1711 223350' },
    { id: 'staff-8', name: 'Taskin Ahmed', role: 'Color Expert', experience: 5, specialization: ['Hair Coloring', 'Scalp Treatment'], avgRating: 4.7, reviewCount: 18, image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200', phone: '+880 1711 223351' },
  ],
  'salon-4': [
    { id: 'staff-10', name: 'Shakib Al Hasan', role: 'Master Barber', experience: 12, specialization: ['Fade Cut', 'Hot Towel Shave', 'Beard Styling'], avgRating: 5.0, reviewCount: 75, image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200', phone: '+880 1711 223353' },
    { id: 'staff-11', name: 'Tamim Iqbal', role: 'Senior Stylist', experience: 9, specialization: ['Fade Cut', 'Keratin Treatment'], avgRating: 4.8, reviewCount: 48, image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=200', phone: '+880 1711 223354' },
  ],
  'salon-5': [
    { id: 'staff-13', name: 'Mustafizur Rahman', role: 'Junior Stylist', experience: 4, specialization: ['Fade Cut', 'Beard Styling'], avgRating: 4.5, reviewCount: 14, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', phone: '+880 1711 223356' },
    { id: 'staff-14', name: 'Mahmudullah Riyad', role: 'Color Expert', experience: 11, specialization: ['Hair Coloring', 'Keratin Treatment'], avgRating: 4.9, reviewCount: 60, image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=200', phone: '+880 1711 223357' },
  ],
  'salon-6': [
    { id: 'staff-16', name: 'Liton Das', role: 'Senior Stylist', experience: 6, specialization: ['Fade Cut', 'Scalp Treatment'], avgRating: 4.6, reviewCount: 22, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', phone: '+880 1711 223359' },
  ],
  'salon-7': [
    { id: 'staff-19', name: 'Rubel Hossain', role: 'Master Barber', experience: 9, specialization: ['Hot Towel Shave', 'Beard Styling'], avgRating: 4.8, reviewCount: 35, image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200', phone: '+880 1711 223362' },
  ],
  'salon-8': [
    { id: 'staff-22', name: 'Farhan Akter', role: 'Senior Stylist', experience: 8, specialization: ['Fade Cut', 'Hair Coloring'], avgRating: 4.7, reviewCount: 29, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200', phone: '+880 1711 223365' },
  ],
  'salon-9': [
    { id: 'staff-25', name: 'Miraz Hossain', role: 'Color Expert', experience: 6, specialization: ['Hair Coloring', 'Keratin Treatment'], avgRating: 4.5, reviewCount: 20, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', phone: '+880 1711 223368' },
  ],
  'salon-10': [
    { id: 'staff-28', name: 'Saifuddin Saif', role: 'Master Barber', experience: 10, specialization: ['Fade Cut', 'Hot Towel Shave'], avgRating: 4.9, reviewCount: 50, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', phone: '+880 1711 223371' },
  ],
};

type LogEntry = { msg: string; ok: boolean };

export default function SeedPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const addLog = (msg: string, ok = true) =>
    setLogs(prev => [...prev, { msg, ok }]);

  const seed = async () => {
    setRunning(true);
    setLogs([]);
    setDone(false);

    try {
      // ── Salons ──────────────────────────────────────────────────────────────
      addLog('📍 Seeding salons...');
      for (const salon of SALONS) {
        await setDoc(doc(db, 'salons', salon.id), salon);
        addLog(`  ✓ ${salon.name}`);
      }

      // ── Services ─────────────────────────────────────────────────────────────
      addLog('✂️  Seeding services...');
      for (const salon of SALONS) {
        for (let i = 0; i < SERVICE_NAMES.length; i++) {
          const svc = SERVICE_NAMES[i];
          const id = `service-${salon.id.split('-')[1]}-${i + 1}`;
          await setDoc(doc(db, 'services', id), {
            id,
            salonId: salon.id,
            ...svc,
            createdAt: new Date().toISOString(),
          });
        }
        addLog(`  ✓ Services for ${salon.name}`);
      }

      // ── Staff ────────────────────────────────────────────────────────────────
      addLog('💈 Seeding staff...');
      for (const [salonId, staffList] of Object.entries(STAFF_BY_SALON)) {
        for (const member of staffList) {
          await setDoc(doc(db, 'staff', member.id), {
            ...member,
            salonId,
            isAvailable: true,
            createdAt: new Date().toISOString(),
          });
        }
        addLog(`  ✓ Staff for ${salonId}`);
      }

      addLog('🎉 All data seeded successfully!', true);
      setDone(true);
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`, false);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '1.5rem',
        padding: '2.5rem',
        maxWidth: '640px',
        width: '100%',
        backdropFilter: 'blur(20px)',
      }}>
        <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          🗄️ Seed Firestore Database
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', lineHeight: 1.6 }}>
          This will write all 10 salons, 50 services, and 20+ staff members to your Firestore database.
          Run this once after creating your database.
        </p>

        <button
          id="seed-btn"
          onClick={seed}
          disabled={running || done}
          style={{
            width: '100%',
            padding: '0.875rem',
            borderRadius: '0.75rem',
            border: 'none',
            background: done
              ? 'linear-gradient(135deg, #22c55e, #16a34a)'
              : running
              ? 'rgba(255,255,255,0.1)'
              : 'linear-gradient(135deg, #c9a96e, #a67c52)',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: running || done ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            marginBottom: '1.5rem',
          }}
        >
          {done ? '✅ Database Seeded Successfully!' : running ? '⏳ Seeding...' : '🚀 Seed Database Now'}
        </button>

        {logs.length > 0 && (
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            borderRadius: '0.75rem',
            padding: '1rem',
            maxHeight: '400px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            lineHeight: 1.8,
          }}>
            {logs.map((entry, i) => (
              <div key={i} style={{ color: entry.ok ? '#a3e635' : '#f87171' }}>
                {entry.msg}
              </div>
            ))}
          </div>
        )}

        {done && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '0.75rem',
            color: '#86efac',
            fontSize: '0.875rem',
          }}>
            ✅ Done! Now go to <strong>firestoreService.ts</strong> and set{' '}
            <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>
              isMockMode = false
            </code>{' '}
            to switch the app to live Firebase mode.
          </div>
        )}
      </div>
    </div>
  );
}
