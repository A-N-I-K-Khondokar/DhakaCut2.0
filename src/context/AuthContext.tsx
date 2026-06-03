import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase';
import { 
  getCurrentUser, 
  logIn as authLogIn, 
  logOut as authLogOut, 
  signUp as authSignUp,
  updateUserProfile
} from '../services/firestoreService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<User>;
  logOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if we are running in mock mode based on Firestore initialization
  const isMockMode = (() => {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const projId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    return !apiKey || apiKey === 'mock-key' || projId === 'dhakacut-mock';
  })();

  useEffect(() => {
    if (isMockMode) {
      // Mock mode initialization: retrieve cached user from local storage
      const checkMockUser = async () => {
        try {
          const cachedUser = await getCurrentUser();
          setUser(cachedUser);
        } catch (err) {
          console.error('Error loading mock user session', err);
        } finally {
          setLoading(false);
        }
      };
      checkMockUser();
    } else {
      // Firebase standard auth listener
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        setLoading(true);
        if (fbUser) {
          try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
          } catch (err) {
            console.error('Error fetching user profile in auth state change', err);
            setUser(null);
          }
        } else {
          setUser(null);
          localStorage.removeItem('dc_current_user');
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [isMockMode]);

  const logIn = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const loggedUser = await authLogIn(email, password);
      setUser(loggedUser);
      return loggedUser;
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, phone: string): Promise<User> => {
    setLoading(true);
    try {
      const newUser = await authSignUp(email, password, name, phone);
      setUser(newUser);
      return newUser;
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await authLogOut();
      setUser(null);
    } catch (err) {
      console.error('Error logging out', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    if (!user) throw new Error('No authenticated user');
    try {
      await updateUserProfile(user.id, updates);
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('Error updating user', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logIn, signUp, logOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
