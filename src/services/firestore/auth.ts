import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User } from '../../types';
import { generateId } from '../../utils/helpers';
import { 
  isMockMode, 
  withTimeout, 
  mapDoc, 
  getLocalData, 
  setLocalData 
} from './core';

export const signUp = async (email: string, password: string, name: string, phone: string): Promise<User> => {
  if (isMockMode) {
    const users = getLocalData<User>('dc_users');
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) throw new Error('Email already in use.');

    const newUser: User = {
      id: `mock-uid-${generateId(8)}`,
      email,
      displayName: name,
      phone,
      role: email.toLowerCase() === 'anik19116@gmail.com' ? 'admin' : 'customer',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setLocalData('dc_users', users);
    
    localStorage.setItem('dhakacut_user', JSON.stringify(newUser));
    return newUser;
  } else {
    localStorage.setItem('dc_signup_in_progress', 'true');
    try {
      let fbUser: any = null;
      try {
        console.log('[DhakaCut Auth Debug] Starting signUp with email:', email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        fbUser = userCredential.user;
        console.log('[DhakaCut Auth Debug] Auth account created. UID:', fbUser.uid);
        await updateProfile(fbUser, { displayName: name });
        console.log('[DhakaCut Auth Debug] Display name set.');
      } catch (authErr: any) {
        console.error('[DhakaCut Service] Auth error in signUp:', authErr);
        if (authErr.code === 'auth/email-already-in-use') {
          throw new Error('This email is already in use.');
        } else if (authErr.code === 'auth/weak-password') {
          throw new Error('The password is too weak. It must be at least 6 characters.');
        } else if (authErr.code === 'auth/invalid-email') {
          throw new Error('The email address is invalid.');
        }
        throw new Error(authErr.message || 'Failed to sign up.');
      }

      const role = email.toLowerCase() === 'anik19116@gmail.com' ? 'admin' : 'customer';
      const userObj: User = {
        id: fbUser.uid,
        email,
        displayName: name,
        phone,
        role,
        createdAt: new Date().toISOString(),
      };

      try {
        await withTimeout(
          setDoc(doc(db, 'users', fbUser.uid), {
            ...userObj,
            createdAt: serverTimestamp(),
          }),
          8000,
          'signUp setDoc'
        );
        console.log('[DhakaCut Auth Debug] Firestore profile saved.');
      } catch (firestoreErr: any) {
        console.warn('[DhakaCut Auth Debug] Firestore write failed during signUp. Profile will sync later.', firestoreErr.message);
      }

      localStorage.setItem('dhakacut_user', JSON.stringify(userObj));
      console.log('[DhakaCut Auth Debug] SignUp complete. Role:', role);
      return userObj;
    } finally {
      localStorage.removeItem('dc_signup_in_progress');
    }
  }
};

export const logIn = async (email: string, password: string): Promise<User> => {
  if (isMockMode) {
    const users = getLocalData<User>('dc_users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('User not found. Try signing up or check credentials.');
    
    if (password.length < 6) throw new Error('Invalid credentials (password too short).');

    localStorage.setItem('dhakacut_user', JSON.stringify(user));
    return user;
  } else {
    let fbUser: any = null;
    try {
      console.log('[DhakaCut Auth Debug] Starting logIn with email:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      fbUser = userCredential.user;
      console.log('[DhakaCut Auth Debug] Auth succeeded. UID:', fbUser.uid);
    } catch (authErr: any) {
      console.error('[DhakaCut Service] Firebase Auth error in logIn:', authErr);
      if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/wrong-password' || authErr.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password.');
      } else if (authErr.code === 'auth/invalid-email') {
        throw new Error('The email address is invalid.');
      }
      throw new Error(authErr.message || 'Failed to log in.');
    }

    try {
      console.log('[DhakaCut Auth Debug] Fetching Firestore user document...');
      const userDoc = await withTimeout(
        getDoc(doc(db, 'users', fbUser.uid)),
        8000,
        'logIn getDoc'
      );

      if (userDoc.exists()) {
        const userData = mapDoc<User>(userDoc);
        localStorage.setItem('dhakacut_user', JSON.stringify(userData));
        console.log('[DhakaCut Auth Debug] User profile loaded from Firestore.');
        return userData;
      }

      console.warn('[DhakaCut Auth Debug] Firestore profile missing. Creating one...');
      const role: 'admin' | 'customer' = (fbUser.email && fbUser.email.toLowerCase() === 'anik19116@gmail.com') ? 'admin' : 'customer';
      const newProfile = {
        id: fbUser.uid,
        email: fbUser.email || email,
        displayName: fbUser.displayName || email.split('@')[0],
        phone: '',
        role,
        createdAt: serverTimestamp(),
      };
      await withTimeout(
        setDoc(doc(db, 'users', fbUser.uid), newProfile),
        8000,
        'logIn setDoc'
      );
      const userObj: User = { ...newProfile, createdAt: new Date().toISOString() };
      localStorage.setItem('dhakacut_user', JSON.stringify(userObj));
      return userObj;
    } catch (firestoreErr: any) {
      console.warn('[DhakaCut Auth Debug] Firestore failed/timed out. Using Auth data as fallback user profile.', firestoreErr.message);
      const role = (fbUser.email && fbUser.email.toLowerCase() === 'anik19116@gmail.com') ? 'admin' : 'customer';
      const offlineUser: User = {
        id: fbUser.uid,
        email: fbUser.email || email,
        displayName: fbUser.displayName || email.split('@')[0],
        phone: '',
        role,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('dhakacut_user', JSON.stringify(offlineUser));
      console.log('[DhakaCut Auth Debug] Fallback login successful via Auth data. Role:', role);
      return offlineUser;
    }
  }
};

export const signInWithGoogle = async (): Promise<User> => {
  if (isMockMode) {
    const mockGoogleUser: User = {
      id: `mock-uid-google-${generateId(6)}`,
      email: 'google.user@gmail.com',
      displayName: 'Google Demo User',
      phone: '',
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    const users = getLocalData<User>('dc_users');
    const existing = users.find(u => u.email === mockGoogleUser.email);
    if (!existing) {
      users.push(mockGoogleUser);
      setLocalData('dc_users', users);
    }
    const finalUser = existing || mockGoogleUser;
    localStorage.setItem('dhakacut_user', JSON.stringify(finalUser));
    return finalUser;
  }

  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');

  try {
    console.log('[DhakaCut Auth Debug] Starting Google Sign-In...');
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;
    console.log('[DhakaCut Auth Debug] Google Sign-In succeeded. UID:', fbUser.uid);

    const role: 'admin' | 'customer' =
      fbUser.email && fbUser.email.toLowerCase() === 'anik19116@gmail.com'
        ? 'admin'
        : 'customer';

    try {
      const userDoc = await withTimeout(
        getDoc(doc(db, 'users', fbUser.uid)),
        8000,
        'googleSignIn getDoc'
      );

      if (userDoc.exists()) {
        const userData = mapDoc<User>(userDoc);
        const merged: User = {
          ...userData,
          photoURL: fbUser.photoURL || userData.photoURL || undefined,
        };
        if (fbUser.photoURL && userData.photoURL !== fbUser.photoURL) {
          updateDoc(doc(db, 'users', fbUser.uid), { photoURL: fbUser.photoURL }).catch(() => {});
        }
        localStorage.setItem('dhakacut_user', JSON.stringify(merged));
        console.log('[DhakaCut Auth Debug] Existing Google user profile loaded.');
        return merged;
      }

      console.log('[DhakaCut Auth Debug] New Google user. Creating Firestore profile...');
      const newProfile: User = {
        id: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User',
        phone: '',
        role,
        createdAt: new Date().toISOString(),
        photoURL: fbUser.photoURL || undefined,
      };
      await withTimeout(
        setDoc(doc(db, 'users', fbUser.uid), {
          ...newProfile,
          createdAt: serverTimestamp(),
        }),
        8000,
        'googleSignIn setDoc'
      );
      localStorage.setItem('dhakacut_user', JSON.stringify(newProfile));
      console.log('[DhakaCut Auth Debug] New Google user profile created. Role:', role);
      return newProfile;
    } catch (firestoreErr: any) {
      console.warn('[DhakaCut Auth Debug] Firestore failed during Google sign-in. Using Auth data as fallback.', firestoreErr.message);
      const fallback: User = {
        id: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User',
        phone: '',
        role,
        createdAt: new Date().toISOString(),
        photoURL: fbUser.photoURL || undefined,
      };
      localStorage.setItem('dhakacut_user', JSON.stringify(fallback));
      return fallback;
    }
  } catch (err: any) {
    console.error('[DhakaCut Service] Google Sign-In error:', err);
    if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
      throw new Error('Google sign-in was cancelled.');
    } else if (err.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked. Please allow popups for this site and try again.');
    } else if (err.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw new Error(err.message || 'Failed to sign in with Google.');
  }
};

export const logOut = async (): Promise<void> => {
  localStorage.removeItem('dhakacut_user');
  if (!isMockMode) {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('[DhakaCut Service] Error in logOut:', err);
      throw new Error(err.message || 'Failed to log out.');
    }
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (isMockMode) {
    const localCached = localStorage.getItem('dhakacut_user');
    if (localCached) {
      return JSON.parse(localCached);
    }
    return null;
  }
  
  const fbUser = auth.currentUser;
  if (!fbUser) {
    localStorage.removeItem('dhakacut_user');
    return null;
  }

  const localCached = localStorage.getItem('dhakacut_user');
  if (localCached) {
    try {
      const parsed = JSON.parse(localCached);
      if (parsed && parsed.id === fbUser.uid) {
        return parsed;
      }
    } catch (e) {
      localStorage.removeItem('dhakacut_user');
    }
  }

  try {
    const userDoc = await withTimeout(
      getDoc(doc(db, 'users', fbUser.uid)),
      8000,
      'getCurrentUser getDoc'
    );
    if (userDoc.exists()) {
      const data = mapDoc<User>(userDoc);
      localStorage.setItem('dhakacut_user', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.error('[DhakaCut Service] Error fetching current user from Firestore (or timed out): ', err);
  }

  const fallback: User = {
    id: fbUser.uid,
    email: fbUser.email || '',
    displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
    phone: '',
    role: 'customer',
    createdAt: new Date().toISOString(),
  };
  return fallback;
};

export const resetPassword = async (email: string): Promise<void> => {
  if (isMockMode) {
    const users = getLocalData<User>('dc_users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('User not found.');
    console.log(`Password reset email sent (Mocked) to: ${email}`);
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in resetPassword:', err);
    if (err.code === 'auth/user-not-found') {
      throw new Error('User not found.');
    } else if (err.code === 'auth/invalid-email') {
      throw new Error('The email address is invalid.');
    }
    throw new Error(err.message || 'Failed to send password reset email.');
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
  if (isMockMode) {
    const users = getLocalData<User>('dc_users');
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found.');
    
    users[idx] = { ...users[idx], ...updates };
    setLocalData('dc_users', users);
    
    const cur = localStorage.getItem('dhakacut_user');
    if (cur) {
      const parsed = JSON.parse(cur) as User;
      if (parsed.id === userId) {
        localStorage.setItem('dhakacut_user', JSON.stringify(users[idx]));
      }
    }
    return;
  }
  try {
    await updateDoc(doc(db, 'users', userId), updates);
    
    const cur = localStorage.getItem('dhakacut_user');
    if (cur) {
      const parsed = JSON.parse(cur) as User;
      if (parsed.id === userId) {
        localStorage.setItem('dhakacut_user', JSON.stringify({ ...parsed, ...updates }));
      }
    }
  } catch (err: any) {
    console.error('[DhakaCut Service] Error in updateUserProfile:', err);
    throw new Error('Failed to update user profile.');
  }
};
