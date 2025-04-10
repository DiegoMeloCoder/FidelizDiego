import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider: useEffect triggered");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("AuthProvider: onAuthStateChanged triggered. User:", user?.uid || 'null');
      setCurrentUser(user);
      if (user) {
        console.log("AuthProvider: User found, fetching Firestore data for UID:", user.uid);
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const fetchedData = userDocSnap.data();
            console.log("AuthProvider: Firestore data fetched:", fetchedData); // Log fetched data
            setUserData(fetchedData);
          } else {
            console.error("AuthProvider: User document not found in Firestore for UID:", user.uid);
            setUserData(null); // Reset user data if doc not found
          }
        } catch (error) {
          console.error("AuthProvider: Error fetching user data:", error);
          setUserData(null); // Reset user data on error
        }
      } else {
        console.log("AuthProvider: No user logged in.");
        setUserData(null); // Clear user data on logout
      }
      // Ensure loading is set to false *after* async operations complete
      console.log("AuthProvider: Setting loading to false.");
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log("AuthProvider: Unsubscribing from onAuthStateChanged.");
      unsubscribe();
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const value = {
    currentUser,
    userData,
    loading,
  };

  // Render children only when loading is complete to prevent rendering with incomplete state
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
