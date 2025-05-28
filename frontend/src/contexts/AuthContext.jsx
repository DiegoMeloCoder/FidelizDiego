import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import apiClient from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // Start loading true
  const [authError, setAuthError] = useState(null);

  // Function to fetch user profile data from API
  const fetchUserProfile = async (firebaseUser) => {
    console.log("AuthProvider: fetchUserProfile called for UID:", firebaseUser?.uid);
    if (!firebaseUser) {
      console.warn("AuthProvider: fetchUserProfile called without firebaseUser");
      setUserData(null);
      setLoading(false); // No user, stop loading
      return null;
    }

    setAuthError(null); // Clear previous errors on new fetch attempt

    // Ensure token is fresh before API call
    try {
      console.log("AuthProvider: Forcing token refresh before fetching profile...");
      await firebaseUser.getIdToken(true); // Force refresh
      console.log("AuthProvider: Token refreshed. Calling /auth/me...");
    } catch (tokenError) {
      console.error("AuthProvider: Error refreshing token:", tokenError);
      setUserData(null);
      setAuthError('Failed to refresh authentication token.');
      setLoading(false); // Stop loading as we can't proceed
      try { await auth.signOut(); } catch (e) { console.error("Sign out error", e) }
      return null;
    }

    // Proceed with API call
    try {
      const response = await apiClient.get('/auth/me');
      const fetchedData = response.data.data.user;
      console.log("AuthProvider: API profile data fetched:", fetchedData);
      setUserData(fetchedData);
      setLoading(false); // <--- Set loading false AFTER successful fetch
      return fetchedData;
    } catch (error) {
      console.error("AuthProvider: Error fetching user profile from API:", error);
      setUserData(null);
      setAuthError(error.message || 'Failed to fetch user profile.');
      if (error?.status === 401 || error?.status === 403) {
        console.warn(`AuthProvider: Error ${error.status} fetching profile. Forcing Firebase sign out.`);
        try { await auth.signOut(); } catch (signOutError) { console.error("AuthProvider: Error during forced sign out:", signOutError); }
      }
      setLoading(false); // <--- Set loading false AFTER failed fetch
      return null;
    }
    // Removed finally block, loading is set within try/catch now
  };

  useEffect(() => {
    console.log("AuthProvider: useEffect triggered");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("AuthProvider: onAuthStateChanged triggered. User:", user?.uid || 'null');
      setCurrentUser(user);
      if (user) {
        // ---> ADDED: Clear old data and set loading before fetching new profile <---
        console.log("AuthProvider: User detected, clearing old data and setting loading...");
        setUserData(null); // Clear previous user data immediately
        setLoading(true);  // Set loading state while fetching new profile
        // --------------------------------------------------------------------------
        await fetchUserProfile(user); // Wait for profile fetch attempt (this will set loading to false)
      } else {
        console.log("AuthProvider: No user logged in.");
        setUserData(null);
        setAuthError(null); // Clear errors on logout
        setLoading(false); // No user, definitely stop loading
      }
      // Loading state is now managed within fetchUserProfile or the else block
    });

    // Cleanup subscription on unmount
    return () => {
      console.log("AuthProvider: Unsubscribing from onAuthStateChanged.");
      unsubscribe();
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to manually refresh user data
  const refreshUserData = async () => {
    if (currentUser) {
      console.log("AuthProvider: refreshUserData called.");
      // setLoading(true); // Set loading true for manual refresh
      await fetchUserProfile(currentUser); // Re-fetch profile
      // setLoading(false); // Loading is handled within fetchUserProfile
    } else {
      console.warn("AuthProvider: refreshUserData called without a current user.");
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    authError, // Expose error state
    refreshUserData, // Expose the refresh function
    fetchUserProfile, // <-- Add fetchUserProfile to the context value
  };

  // Render children only when loading is complete to prevent rendering with incomplete state
  // OR if there's an auth error (to potentially show error message or login page via redirect)
  // Important: Ensure children are not rendered while loading=true AND no error exists
  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' }}>
          {/* Puedes usar tu componente Spinner aquí si lo tienes y es accesible globalmente */}
          <p style={{ fontSize: '1.2em' }}>Cargando aplicación...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );

}
