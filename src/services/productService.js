const API_BASE_URL = "http://localhost/corpfresh-php/productos.php"; // Ajusta esto a tu servidor PHP

// Obtener productos con paginación y filtro de categoría
export const fetchProducts = async (page = 1, category = 0) => {
  const url = `${API_BASE_URL}/productos.php?pagina=${page}&categoria=${category}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Error al obtener los productos.");
  }

  return response.json(); // Asegúrate de que el archivo PHP devuelva JSON
};

// Otras funciones para manejar la API
export const fetchCategories = async () => {
  const url = `${API_BASE_URL}/categorias.php`; 
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Error al obtener las categorías.");
  }

  return response.json();
};
