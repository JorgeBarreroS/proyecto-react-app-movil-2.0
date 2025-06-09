import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SearchBar = ({ searchQuery, onSearchChange, onSearchSubmit }) => (
  <View style={styles.searchContainer}>
    <View style={styles.searchBar}>
      <TextInput
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder="Buscar productos"
        onSubmitEditing={onSearchSubmit}
      />
      <Pressable style={styles.searchButton} onPress={onSearchSubmit}>
        <FontAwesome name="search" size={20} color="white" />
      </Pressable>
    </View>
  </View>
);

const ProductCard = ({ producto }) => {
  const navigation = useNavigation();
  const precio = parseFloat(producto.precio_producto);

  // Función para determinar la fuente de la imagen
  const getImageSource = (imagePath) => {
    if (!imagePath) {
      return "http://10.0.2.2/corpfresh-php/imagenes/1.jpg";
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    return `http://10.0.2.2/corpfresh-php/${imagePath}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <View style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <Image
          style={styles.productImage}
          source={{ uri: getImageSource(producto.imagen_producto) }}
          defaultSource={{ uri: "http://10.0.2.2/corpfresh-php/imagenes/1.jpg" }}
          onError={() => console.log("Error loading image")}
        />
      </View>
      <Text style={styles.productName}>{producto.nombre_producto}</Text>
      <Text style={styles.productPrice}>Precio: {formatPrice(precio)}</Text>
      <Pressable
        style={styles.viewProductButton}
        onPress={() => navigation.navigate('VisualizarProducto', { id: producto.id_producto })}
      >
        <Text style={styles.viewProductButtonText}>Ver Producto</Text>
      </Pressable>
    </View>
  );
};

const Buscador = () => {
  const navigation = useNavigation();
  const [productos, setProductos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProductos = async (query) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://10.0.2.2/corpfresh-php/busqueda.php?q=${query}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setProductos(data);
      } else {
        setProductos([]);
        setError('La respuesta del servidor no es válida.');
      }
    } catch (err) {
      setError('No se pudo realizar la búsqueda. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const handleSearchSubmit = () => {
    fetchProductos(searchQuery);
  };

  useEffect(() => {
    fetchProductos('');
  }, []);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <FontAwesome name="times" size={20} color="black" />
      </Pressable>

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
      />

      <ScrollView style={styles.productsContainer}>
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {productos.length === 0 && !loading && (
          <Text style={styles.noProductsText}>No se encontraron productos.</Text>
        )}
        {productos.length > 0 && (
          <View style={styles.productList}>
            {productos.map((producto) => (
              <ProductCard key={producto.id_producto} producto={producto} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 20,
    width: '100%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007bff',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsContainer: {
    flex: 1,
  },
  productList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  productImageContainer: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 5,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  viewProductButton: {
    backgroundColor: '#343a40',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  viewProductButtonText: {
    color: 'white',
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
  noProductsText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
});

export default Buscador;