import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore'; // Ya no se usa getDoc
import { auth } from '../firebase/config'; // db ya no se necesita aquí
import apiClient from '../services/api'; // Importar nuestro cliente API

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
      setCurrentUser(user); // Mantener el usuario de Firebase Auth
      if (user) {
        console.log("AuthProvider: User found, fetching profile data from API for UID:", user.uid);
        try {
          // Forzar la obtención de un token nuevo ANTES de la llamada API
          console.log("AuthProvider: Forzando refresco de token ID...");
          await user.getIdToken(true); // El 'true' fuerza el refresco
          console.log("AuthProvider: Token refrescado. Realizando llamada a /auth/me...");

          // Llamar a nuestro endpoint /api/v1/auth/me
          // El interceptor de apiClient debería usar el token recién refrescado
          const response = await apiClient.get('/auth/me');
          const fetchedData = response.data; // Los datos del perfil vienen de la API
          console.log("AuthProvider: API profile data fetched:", fetchedData);
          setUserData(fetchedData); // Guardar los datos del perfil (rol, companyId, etc.)
        } catch (error) {
          console.error("AuthProvider: Error fetching user profile from API:", error);
          setUserData(null); // Resetear userData en cualquier error de API

          // Si el error es 401 (No autorizado/Expirado) o 403 (Prohibido/No encontrado en DB),
          // forzar cierre de sesión en Firebase para limpiar estado inválido.
          if (error?.status === 401 || error?.status === 403) {
            console.warn(`AuthProvider: Error ${error.status} fetching profile. Forcing Firebase sign out.`);
            try {
              await auth.signOut(); // Forzar cierre de sesión
              // No necesitamos setCurrentUser(null) aquí, onAuthStateChanged lo hará.
            } catch (signOutError) {
              console.error("AuthProvider: Error during forced sign out:", signOutError);
            }
          }
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
