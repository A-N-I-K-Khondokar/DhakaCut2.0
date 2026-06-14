import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase';
import { 
  getCurrentUser, 
  logIn as authLogIn, 
  logOut as authLogOut, 
  signUp as authSignUp,
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

  useEffect(() => {
    // Safety timeout — if auth never resolves, unblock UI after 3 seconds
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 3000);

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
        if (fbUser) {
          try {
            const currentUser = await getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
              localStorage.setItem('dhakacut_user', JSON.stringify(currentUser));
            } else {
              setUser(null);
              localStorage.removeItem('dhakacut_user');
            }
          } catch (err) {
            console.error('Error fetching user profile in auth state change', err);
            setUser(null);
            localStorage.removeItem('dhakacut_user');
          }
        } else {
          setUser(null);
          localStorage.removeItem('dhakacut_user');
        }
        clearTimeout(safetyTimer);
        setLoading(false);
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
    setLoading(true);
    setError(null);
    try {
      const loggedUser = await authLogIn(email, password);
      setUser(loggedUser);
      localStorage.setItem('dhakacut_user', JSON.stringify(loggedUser));
      return loggedUser;
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, phone: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await authSignUp(email, password, name, phone);
      setUser(newUser);
      localStorage.setItem('dhakacut_user', JSON.stringify(newUser));
      return newUser;
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logOut = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await authLogOut();
      setUser(null);
      localStorage.removeItem('dhakacut_user');
    } catch (err: any) {
      console.error('Error logging out', err);
      setError(err.message || 'Failed to log out');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await authResetPassword(email);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
      throw err;
    } finally {
      setLoading(false);
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
        resetPassword, 
        updateUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
