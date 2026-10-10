import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  User as FirebaseUser,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocFromServer,
  collection,
  onSnapshot
} from 'firebase/firestore';
import { UserProfile } from './types';

// Import configuration generated from ProvisionFirebase
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use the provisioned custom firestoreDatabaseId
export const db = getFirestore(
  app, 
  firebaseConfig.firestoreDatabaseId || '(default)'
);

export const auth = getAuth(app);

// Connection test per Firebase skill instructions
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified successfully');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore: client is currently offline or connecting');
    }
  }
}

testConnection();

// ==========================================
// --- REAL-TIME PHONE OTP AUTHENTICATION ---
// ==========================================

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

/**
 * Initializes invisible or normal RecaptchaVerifier for real SMS OTP delivery
 */
export function initPhoneRecaptcha(containerId: string = 'recaptcha-container'): RecaptchaVerifier {
  // Clear any existing verifier instance
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch {}
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('Recaptcha verified for Phone OTP');
    },
    'expired-callback': () => {
      console.warn('Recaptcha expired. Please request OTP again.');
    },
  });

  window.recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Sends a REAL OTP SMS to the student's mobile number via Firebase Phone Auth
 */
export async function sendFirebasePhoneOtp(
  rawPhoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  // Ensure international standard E.164 format (+91 for India if not included)
  let clean = rawPhoneNumber.trim();
  if (!clean.startsWith('+')) {
    const digits = clean.replace(/\D/g, '').slice(-10);
    clean = `+91${digits}`;
  }

  const confirmationResult = await signInWithPhoneNumber(auth, clean, verifier);
  window.confirmationResult = confirmationResult;
  return confirmationResult;
}

/**
 * Verifies the 6-digit real OTP entered by the student
 */
export async function verifyFirebasePhoneOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<FirebaseUser> {
  const result = await confirmationResult.confirm(otpCode.trim());
  return result.user;
}

// ==========================================
// --- FIRESTORE USER PROFILE PERSISTENCE ---
// ==========================================

export async function fetchFirestoreUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Error fetching Firestore user profile:', err);
  }
  return null;
}

export async function saveFirestoreUserProfile(profile: UserProfile): Promise<void> {
  try {
    await setDoc(doc(db, 'users', profile.id), profile, { merge: true });
  } catch (err) {
    console.warn('Error saving user profile to Firestore:', err);
  }
}

export async function logoutFirebaseUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch {}
}

export { app };
