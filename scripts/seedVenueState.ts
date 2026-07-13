import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Setup environment for emulator by default if not production
if (!process.env.FIREBASE_CONFIG && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
}

initializeApp({
  projectId: 'smarstadiumstournament'
});

const db = getFirestore();

async function seed() {
  const stadiumId = 'stadway_stadium';
  
  const venueState = {
    gates: {
      Gate_A: { occupancyPct: 30, queueLength: 15, status: 'smooth' },
      Gate_B: { occupancyPct: 82, queueLength: 95, status: 'congested' },
      Gate_C: { occupancyPct: 15, queueLength: 5, status: 'smooth' },
      Gate_D: { occupancyPct: 45, queueLength: 25, status: 'moderate' }
    },
    transit: {
      Metro_Red_Line: { etaMins: 5, delayMins: 0 },
      Shuttle_Bus_101: { etaMins: 12, delayMins: 8 },
      Express_Train_A: { etaMins: 7, delayMins: 2 }
    },
    weather: { condition: 'Clear', tempC: 22 },
    updatedAt: new Date().toISOString()
  };

  console.log(`Seeding venueState for ${stadiumId}...`);
  await db.collection('venueState').doc(stadiumId).set(venueState);

  // Seed some mock volunteers
  const volunteers = [
    {
      id: 'vol_juan',
      name: 'Juan Perez',
      languages: ['Spanish', 'English'],
      skills: ['First Aid', 'Wayfinding'],
      currentZone: 'Gate_B',
      available: true
    },
    {
      id: 'vol_priya',
      name: 'Priya Patel',
      languages: ['Hindi', 'English', 'Marathi'],
      skills: ['Translations', 'Accessibility Support'],
      currentZone: 'Gate_C',
      available: true
    },
    {
      id: 'vol_jean',
      name: 'Jean Dupont',
      languages: ['French', 'English'],
      skills: ['Wayfinding'],
      currentZone: 'Gate_A',
      available: true
    }
  ];

  console.log('Seeding mock volunteers...');
  for (const vol of volunteers) {
    await db.collection('volunteers').doc(vol.id).set(vol);
  }

  // Seed default metadata
  await db.collection('metadata').doc('config').set({
    stadiumName: 'StadWay Arena (World Cup 2026)',
    totalCapacity: 80000,
    currentAttendance: 54200
  });

  console.log('Seeding complete successfully!');
}

seed().catch(err => {
  console.error('Error seeding:', err);
});
