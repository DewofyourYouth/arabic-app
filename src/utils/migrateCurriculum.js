import { db } from '../lib/firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { levels } from '../data/curriculum';

export const migrateCurriculumToFirestore = async () => {
  try {
    console.log("Starting migration...");
    const batch = writeBatch(db);

    // 1. Upload Metadata
    const metadataRef = doc(db, 'curriculum', 'metadata');
    batch.set(metadataRef, {
      version: 1,
      lastUpdated: new Date().toISOString()
    });

    // 2. Upload Levels
    levels.forEach(level => {
      // Use string IDs for documents: "level_1", "level_2", etc.
      const docRef = doc(db, 'curriculum', `level_${level.id}`);
      batch.set(docRef, {
        id: level.id,
        title: level.title,
        description: level.description,
        content: level.content
      });
    });

    await batch.commit();
    console.log("Migration completed successfully!");
    return { success: true };
  } catch (error) {
    console.error("Migration failed:", error);
    return { success: false, error };
  }
};
