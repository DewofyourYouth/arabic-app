import { db } from '../lib/firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import combinedCurriculum, { verbsData, clozePhrases } from '../data/curriculum/index';

export async function seedDatabase() {
  console.log("Starting database seed...");
  const batch = writeBatch(db);

  // 1. Seed Curriculum Cards
  // We'll store them in a 'curriculum' collection
  // ID will be the card ID
  combinedCurriculum.forEach(card => {
    const cardRef = doc(db, 'curriculum', card.id.toString());
    batch.set(cardRef, card);
  });

  // 2. Seed Verbs
  verbsData.forEach(verb => {
    const verbRef = doc(db, 'verbs', verb.id);
    batch.set(verbRef, verb);
  });

  // 3. Seed Cloze Phrases
  clozePhrases.forEach(phrase => {
    const phraseRef = doc(db, 'phrases', phrase.id);
    batch.set(phraseRef, phrase);
  });

  try {
    await batch.commit();
    console.log("Database seeded successfully!");
    alert("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    alert("Error seeding database: " + error.message);
  }
}
