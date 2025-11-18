import admin from 'firebase-admin';

export const connectToFirestore = (): void => {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }
};

export const getFirestore = () => {
  if (admin.apps.length === 0) {
    connectToFirestore();
  }
  return admin.firestore();
};