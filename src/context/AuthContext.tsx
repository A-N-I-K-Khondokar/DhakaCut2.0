// @refresh reset
import React, { createContext, useState, useEffect, useRef, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase';
import { 
  getCurrentUser, 
  logIn as authLogIn, 
  logOut as authLogOut, 
  signUp as authSignUp,
  signInWithGoogle as authGoogleSignIn,
  updateUserProfile,
  resetPassword as authResetPassword,
  isMockMode
} from '../services/firestoreService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  logIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<User>;
  logOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, name: string, phone: string) => Promise<User>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dhakacut_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Track if logIn/signUp just set the user so onAuthStateChanged can skip redundant Firestore fetch
  const justAuthenticatedRef = useRef(false);

  useEffect(() => {
    // Safety timeout — if auth never resolves, unblock UI after 500ms (mock) or 5s (Firebase)
    const safetyTimer = setTimeout(() => {
      console.warn('[DhakaCut Auth] Safety timer fired — forcing loading=false');
      setLoading(false);
    }, isMockMode ? 500 : 5000);

    if (isMockMode) {
      // Mock mode initialization: retrieve cached user from local storage
      const checkMockUser = async () => {
        try {
          const cachedUser = await getCurrentUser();
          setUser(cachedUser);
        } catch (err) {
          console.error('Error loading mock user session', err);
        } finally {
          clearTimeout(safetyTimer);
          setLoading(false);
        }
      };
      checkMockUser();
    } else {
      // Firebase standard auth listener
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        try {
          if (fbUser) {
            // If logIn/signUp just ran, they already fetched the user profile.
            // Skip the redundant Firestore call to avoid a race/deadlock.
            if (justAuthenticatedRef.current) {
              justAuthenticatedRef.current = false;
              // User state was already set by logIn/signUp — just clear loading
              return;
            }

            // Check if we have valid cached data for this UID
            const localCached = localStorage.getItem('dhakacut_user');
            if (localCached) {
              try {
                const parsed = JSON.parse(localCached);
                if (parsed && parsed.id === fbUser.uid) {
                  setUser(parsed);
                  return;
                }
              } catch (e) {
                localStorage.removeItem('dhakacut_user');
              }
            }

            // No valid cache — fetch from Firestore with a timeout guard
            try {
              const currentUser = await getCurrentUser();
              if (currentUser) {
                setUser(currentUser);
                localStorage.setItem('dhakacut_user', JSON.stringify(currentUser));
              } else {
                // Build a fallback user from Firebase Auth data
                const fallback: User = {
                  id: fbUser.uid,
                  email: fbUser.email || '',
                  displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
                  phone: '',
                  role: 'customer',
                  createdAt: new Date().toISOString(),
                  photoURL: fbUser.photoURL || undefined,
                };
                setUser(fallback);
                localStorage.setItem('dhakacut_user', JSON.stringify(fallback));
              }
            } catch (err) {
              console.error('Error fetching user profile in auth state change', err);
              // Build a fallback user from Firebase Auth data so the user is not stuck
              const fallback: User = {
                id: fbUser.uid,
                email: fbUser.email || '',
                displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
                phone: '',
                role: 'customer',
                createdAt: new Date().toISOString(),
                photoURL: fbUser.photoURL || undefined,
              };
              setUser(fallback);
              localStorage.setItem('dhakacut_user', JSON.stringify(fallback));
            }
          } else {
            setUser(null);
            localStorage.removeItem('dhakacut_user');
          }
        } finally {
          clearTimeout(safetyTimer);
          setLoading(false);
        }
      });

      return () => {
        unsubscribe();
        clearTimeout(safetyTimer);
      };
    }

    return () => clearTimeout(safetyTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // isMockMode is a module-level constant, not a React value

  const logIn = async (email: string, password: string): Promise<User> => {
    setError(null);
    try {
      const loggedUser = await authLogIn(email, password);
      justAuthenticatedRef.current = true; // Tell onAuthStateChanged to skip Firestore fetch
      setUser(loggedUser);
      localStorage.setItem('dhakacut_user', JSON.stringify(loggedUser));
      return loggedUser;
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
      throw err;
    }
  };

  const signUp = async (email: string, password: string, name: string, phone: string): Promise<User> => {
    setError(null);
    try {
      const newUser = await authSignUp(email, password, name, phone);
      justAuthenticatedRef.current = true; // Tell onAuthStateChanged to skip Firestore fetch
      setUser(newUser);
      localStorage.setItem('dhakacut_user', JSON.stringify(newUser));
      return newUser;
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      throw err;
    }
  };

  const logOut = async (): Promise<void> => {
    setError(null);
    try {
      await authLogOut();
      setUser(null);
      localStorage.removeItem('dhakacut_user');
    } catch (err: any) {
      console.error('Error logging out', err);
      setError(err.message || 'Failed to log out');
    }
  };

  const googleSignIn = async (): Promise<User> => {
    setError(null);
    try {
      const googleUser = await authGoogleSignIn();
      justAuthenticatedRef.current = true;
      setUser(googleUser);
      localStorage.setItem('dhakacut_user', JSON.stringify(googleUser));
      return googleUser;
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      throw err;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setError(null);
    try {
      await authResetPassword(email);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
      throw err;
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    if (!user) throw new Error('No authenticated user');
    try {
      await updateUserProfile(user.id, updates);
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (err: any) {
      console.error('Error updating user', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        logIn, 
        signUp, 
        logOut, 
        login: logIn, 
        signup: signUp, 
        logout: logOut, 
        googleSignIn,
        resetPassword, 
        updateUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
