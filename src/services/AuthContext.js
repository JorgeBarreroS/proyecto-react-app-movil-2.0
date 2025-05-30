import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Crear el contexto de autenticación
const AuthContext = createContext();

// Proveedor de autenticación
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar datos del usuario al inicializar la app
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("authUser");
        if (storedUser) {
          setAuthState(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error al cargar usuario de AsyncStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const login = async (userData) => {
    try {
      setAuthState(userData);
      await AsyncStorage.setItem("authUser", JSON.stringify(userData));
    } catch (error) {
      console.error("Error al guardar usuario en AsyncStorage:", error);
    }
  };

  const logout = async () => {
    try {
      setAuthState(null);
      await AsyncStorage.removeItem("authUser");
    } catch (error) {
      console.error("Error al eliminar usuario de AsyncStorage:", error);
    }
  };

  const updateEmail = async (newEmail) => {
    try {
      const updatedState = {
        ...authState,
        email: newEmail,
      };
      setAuthState(updatedState);
      await AsyncStorage.setItem("authUser", JSON.stringify(updatedState));
    } catch (error) {
      console.error("Error al actualizar email en AsyncStorage:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, updateEmail, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acceder al contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};