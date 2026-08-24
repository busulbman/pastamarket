import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFirebaseConfig } from "@/lib/config";

export function firestore() {
  const credentials = readFirebaseConfig();
  if (!credentials) {
    throw new Error("Firestore yapılandırması eksik. FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL ve FIREBASE_PRIVATE_KEY değişkenlerini kontrol edin.");
  }
  const app = getApps()[0] ?? initializeApp({ credential: cert(credentials), projectId: credentials.projectId });
  return getFirestore(app);
}
