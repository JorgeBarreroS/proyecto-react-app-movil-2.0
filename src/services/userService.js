export const getUserData = async (userId) => {
    console.log("Solicitando datos del usuario con ID:", userId);
  
    try {
    const response = await fetch(`http://localhost:5000/api/usuarios/${userId}`);
      if (!response.ok) throw new Error("Error en la respuesta del servidor");
  
      const data = await response.json();
      console.log("Datos obtenidos del usuario:", data);
      
      return data;
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      return null;
    }
  };
  