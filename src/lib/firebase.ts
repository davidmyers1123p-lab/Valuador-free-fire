import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  updateDoc 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create/Update user document
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    } else {
      await updateDoc(userRef, {
        lastLogin: serverTimestamp()
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

export async function logout() {
  return auth.signOut();
}

/**
 * Account Linking Types
 */
export interface LinkedAccount {
  userId: string;
  playerId: string;
  nickname: string;
  region: string;
  level?: number;
  rank?: string;
  linkedAt: any;
}

export async function getLinkedAccount(userId: string) {
  const accountRef = doc(db, 'ff_accounts', userId);
  const accountSnap = await getDoc(accountRef);
  if (accountSnap.exists()) {
    return accountSnap.data() as LinkedAccount;
  }
  return null;
}

export async function linkAccount(userId: string, accountData: Partial<LinkedAccount>) {
  const accountRef = doc(db, 'ff_accounts', userId);
  await setDoc(accountRef, {
    ...accountData,
    userId,
    linkedAt: serverTimestamp()
  });
}
