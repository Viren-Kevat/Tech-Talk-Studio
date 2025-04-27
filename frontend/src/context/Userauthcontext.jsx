import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";

export const UserAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null); // Store the auth token
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the token whenever the user changes
  const fetchAuthToken = async (currentUser) => {
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken(); // Fetch the token
        setAuthToken(token);
      } catch (err) {
        console.error("Error fetching auth token:", err);
        setAuthToken(null);
      }
    } else {
      setAuthToken(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await fetchAuthToken(currentUser); // Fetch the token when the user changes
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await fetchAuthToken(userCredential.user); // Fetch the token after signup
      return userCredential;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      await fetchAuthToken(userCredential.user); // Fetch the token after login
      return userCredential;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await fetchAuthToken(userCredential.user); // Fetch the token after Google login
      return userCredential;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      return "Password reset email sent!";
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setAuthToken(null); // Clear the auth token on logout
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        currentUserId: user?.uid || null, // Provide the current user's ID
        authToken, // Provide the auth token
        loading,
        error,
        signup,
        login,
        loginWithGoogle,
        resetPassword,
        logout,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error(
      "useUserAuth must be used within a UserAuthContextProvider"
    );
  }
  return context;
}
