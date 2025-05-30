// Servicio para gestionar el carrito de compras

// Función para agregar un producto al carrito
export const addToCart = async (productData) => {
  try {
      // Obtener usuario actual del localStorage
      const authUser = localStorage.getItem('authUser');
      if (!authUser) {
          return { error: "Debes iniciar sesión para agregar productos al carrito" };
      }

      const { email } = JSON.parse(authUser);
      
      console.log("Enviando datos al carrito:", {
          id_producto: productData.id_producto,
          nombre: productData.nombre,
          precio: productData.precio,
          imagen: productData.imagen,
          cantidad: productData.cantidad,
          usuario: email,
          color: productData.color || null,
          talla: productData.talla || null
      });

      const response = await fetch('http://localhost/corpfresh-php/carrito/carrito.php', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              id_producto: productData.id_producto,
              nombre: productData.nombre,
              precio: productData.precio,
              imagen: productData.imagen,
              cantidad: productData.cantidad,
              usuario: email,
              color: productData.color || null,
              talla: productData.talla || null
          }),
      });

      // Obtener la respuesta como texto primero para debugging
      const responseText = await response.text();
      console.log("Respuesta del servidor (texto):", responseText);

      // Verificar si la respuesta es válida
      if (!response.ok) {
          console.error(`Error ${response.status}:`, responseText);
          return { error: `Error del servidor: ${response.status}` };
      }

      // Verificar si contiene un error de PHP
      if (responseText.includes('<br />') || responseText.includes('Fatal error') || responseText.includes('Warning')) {
          console.error("Error de PHP detectado:", responseText);
          return { error: "El servidor encontró un error interno" };
      }

      // Verificar si la respuesta está vacía
      if (!responseText.trim()) {
          console.error("Respuesta vacía del servidor");
          return { error: "Respuesta vacía del servidor" };
      }

      // Intentar parsear como JSON
      try {
          const data = JSON.parse(responseText);
          console.log("Respuesta JSON parseada:", data);
          return data;
      } catch (parseError) {
          console.error("Error al parsear JSON:", parseError);
          console.error("Respuesta que causó error:", responseText);
          return { error: "Error al procesar la respuesta del servidor" };
      }
  } catch (error) {
      console.error('Error al agregar al carrito:', error);
      return { error: error.message };
  }
};

// Función para obtener el carrito actual
export const getCart = async () => {
  try {
      // Obtener usuario actual del localStorage
      const authUser = localStorage.getItem('authUser');
      if (!authUser) {
          return { error: "No hay usuario autenticado" };
      }

      const { email } = JSON.parse(authUser);
      
      console.log("Obteniendo carrito para usuario:", email);
      
      const response = await fetch(`http://localhost/corpfresh-php/carrito/carrito.php?usuario=${email}`);
      
      // Obtener la respuesta como texto primero para debugging
      const responseText = await response.text();
      console.log("Respuesta del servidor (texto):", responseText);
      
      // Verificar si la respuesta es válida
      if (!response.ok) {
          console.error(`Error ${response.status}:`, responseText);
          return { error: `Error del servidor: ${response.status}` };
      }

      // Verificar si contiene un error de PHP
      if (responseText.includes('<br />') || responseText.includes('Fatal error') || responseText.includes('Warning')) {
          console.error("Error de PHP detectado:", responseText);
          return { error: "El servidor encontró un error interno" };
      }

      // Verificar si la respuesta está vacía
      if (!responseText.trim()) {
          console.log("Carrito vacío");
          return [];
      }

      // Intentar parsear como JSON
      try {
          const data = JSON.parse(responseText);
          console.log("Carrito parseado:", data);
          return data;
      } catch (parseError) {
          console.error("Error al parsear JSON:", parseError);
          console.error("Respuesta que causó error:", responseText);
          return { error: "Error al procesar la respuesta del servidor" };
      }
  } catch (error) {
      console.error('Error al obtener el carrito:', error);
      return { error: error.message };
  }
};

// Función para actualizar cantidad de un producto en el carrito
export const updateCartItemQuantity = async (id_carrito, cantidad) => {
  try {
      const response = await fetch('http://localhost/corpfresh-php/carrito/carrito.php', {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              id_carrito,
              cantidad
          }),
      });

      // Obtener la respuesta como texto primero para debugging
      const responseText = await response.text();
      console.log("Respuesta del servidor (texto):", responseText);

      // Verificar si la respuesta es válida
      if (!response.ok) {
          console.error(`Error ${response.status}:`, responseText);
          return { error: `Error del servidor: ${response.status}` };
      }

      // Verificar si contiene un error de PHP
      if (responseText.includes('<br />') || responseText.includes('Fatal error') || responseText.includes('Warning')) {
          console.error("Error de PHP detectado:", responseText);
          return { error: "El servidor encontró un error interno" };
      }

      // Intentar parsear como JSON
      try {
          const data = JSON.parse(responseText);
          return data;
      } catch (parseError) {
          console.error("Error al parsear JSON:", parseError);
          console.error("Respuesta que causó error:", responseText);
          return { error: "Error al procesar la respuesta del servidor" };
      }
  } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      return { error: error.message };
  }
};

// Función para eliminar un producto del carrito
export const removeFromCart = async (id_carrito) => {
  try {
      const response = await fetch('http://localhost/corpfresh-php/carrito/carrito.php', {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              id_carrito
          }),
      });

      // Obtener la respuesta como texto primero para debugging
      const responseText = await response.text();
      console.log("Respuesta del servidor (texto):", responseText);

      // Verificar si la respuesta es válida
      if (!response.ok) {
          console.error(`Error ${response.status}:`, responseText);
          return { error: `Error del servidor: ${response.status}` };
      }

      // Verificar si contiene un error de PHP
      if (responseText.includes('<br />') || responseText.includes('Fatal error') || responseText.includes('Warning')) {
          console.error("Error de PHP detectado:", responseText);
          return { error: "El servidor encontró un error interno" };
      }

      // Intentar parsear como JSON
      try {
          const data = JSON.parse(responseText);
          return data;
      } catch (parseError) {
          console.error("Error al parsear JSON:", parseError);
          console.error("Respuesta que causó error:", responseText);
          return { error: "Error al procesar la respuesta del servidor" };
      }
  } catch (error) {
      console.error('Error al eliminar producto:', error);
      return { error: error.message };
  }
};

// Función para vaciar el carrito completo
export const clearCart = async () => {
  try {
      // Obtener usuario actual del localStorage
      const authUser = localStorage.getItem('authUser');
      if (!authUser) {
          return { error: "No hay usuario autenticado" };
      }

      const { email } = JSON.parse(authUser);
      
      const response = await fetch('http://localhost/corpfresh-php/carrito/carrito.php', {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              usuario: email,
              vaciar: true
          }),
      });

      // Obtener la respuesta como texto primero para debugging
      const responseText = await response.text();
      console.log("Respuesta del servidor (texto):", responseText);

      // Verificar si la respuesta es válida
      if (!response.ok) {
          console.error(`Error ${response.status}:`, responseText);
          return { error: `Error del servidor: ${response.status}` };
      }

      // Verificar si contiene un error de PHP
      if (responseText.includes('<br />') || responseText.includes('Fatal error') || responseText.includes('Warning')) {
          console.error("Error de PHP detectado:", responseText);
          return { error: "El servidor encontró un error interno" };
      }

      // Intentar parsear como JSON
      try {
          const data = JSON.parse(responseText);
          return data;
      } catch (parseError) {
          console.error("Error al parsear JSON:", parseError);
          console.error("Respuesta que causó error:", responseText);
          return { error: "Error al procesar la respuesta del servidor" };
      }
  } catch (error) {
      console.error('Error al vaciar carrito:', error);
      return { error: error.message };
  }
};

// Función para obtener el número de productos en el carrito (para mostrar en el badge del navbar)
export const getCartItemCount = async () => {
  try {
      const cartItems = await getCart();
      if (cartItems.error || !Array.isArray(cartItems)) {
          return 0;
      }
      return cartItems.reduce((total, item) => total + (parseInt(item.cantidad) || 0), 0);
  } catch (error) {
      console.error('Error al obtener cantidad de productos:', error);
      return 0;
  }
};