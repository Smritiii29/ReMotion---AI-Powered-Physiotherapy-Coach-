// src/config/firebaseAdmin.js
import admin from "firebase-admin";

// Build the credential object from .env variables
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // Important: Fix escaped newlines
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};

// Check if all required fields are present
if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
  throw new Error("Missing required Firebase service account credentials in .env");
}

// Initialize Firebase Admin only once
const firebaseAdmin = admin.apps.length
  ? admin.app() // Reuse existing app
  : admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL, // Optional, if you use Realtime DB
    });

export const db = firebaseAdmin.firestore();

// Optional: Export auth if you need Admin Auth features later
export const auth = firebaseAdmin.auth();

export default firebaseAdmin;