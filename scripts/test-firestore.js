import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDbsEPs4C6zHIQEcNQQfC5xiQRDYO-xONA",
  authDomain: "dhakacut.firebaseapp.com",
  projectId: "dhakacut",
  storageBucket: "dhakacut.firebasestorage.app",
  messagingSenderId: "491617627794",
  appId: "1:491617627794:web:08c0266a6cf18ca53a004b"
};

console.log("Initializing Firebase app with config:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {}, 'default');

console.log("Attempting to fetch 'salons' from Firestore...");
try {
  const querySnapshot = await getDocs(collection(db, 'salons'));
  console.log("Success! Found", querySnapshot.size, "salons.");
  querySnapshot.forEach(doc => {
    console.log(`- ID: ${doc.id}, Name: ${doc.data().name}`);
  });
} catch (err) {
  console.error("Firestore error details:");
  console.error("- Code:", err.code);
  const jsonErr = JSON.stringify(err, null, 2);
  console.error("- Full error:", jsonErr === '{}' ? err.message : jsonErr);
}
