import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const navigation = useNavigation();

  const fetchAllProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://10.0.2.2/corpfresh-php/productos.php?pagina=${page}&categoria=${selectedCategory}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error('Respuesta del servidor no es JSON válido');
      }

      if (!data.success) {
        throw new Error(data.message || "Error en los datos recibidos");
      }

      const productsData = data.data?.products || data.products || [];
      const paginationData = data.data?.pagination || data.pagination || {};

      setProducts(productsData);
      setTotalPages(paginationData.total_pages || 1);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError(err.message);
      setProducts([]);
      Alert.alert("Error", `No se pudieron cargar los productos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://10.0.2.2/corpfresh-php/categorias.php", {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Categories JSON Parse Error:', parseError);
        throw new Error('Respuesta de categorías no es JSON válido');
      }

      // Manejar diferentes formatos de respuesta
      let categoriesData = [];
      if (Array.isArray(data)) {
        categoriesData = data;
      } else if (data.success && data.data) {
        categoriesData = Array.isArray(data.data) ? data.data : [];
      } else if (data.categories) {
        categoriesData = Array.isArray(data.categories) ? data.categories : [];
      }

      setCategories(categoriesData);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      Alert.alert("Error", `No se pudieron cargar las categorías: ${err.message}`);
      setCategories([]);
    }
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price) || 0;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(numPrice);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "http://10.0.2.2/corpfresh-php/imagenes/1.jpg";
    if (imagePath.startsWith('http')) return imagePath;
    return `http://10.0.2.2/corpfresh-php/${imagePath}`;
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchCategories();
  }, []);

  // Cargar productos cuando cambie página o categoría
  useEffect(() => {
    fetchAllProducts();
  }, [page, selectedCategory]);

  const handleCategoryChange = (itemValue) => {
    setSelectedCategory(itemValue);
    setPage(1); // Reset to first page when category changes
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        navigation.navigate('VisualizarProducto', { id: item.id_producto });
      }}
    >
      <Image
        source={{ uri: getImageUrl(item.imagen_producto) }}
        style={styles.productImage}
        defaultSource={{ uri: "http://10.0.2.2/corpfresh-php/imagenes/1.jpg" }}
        onError={(error) => {
          // console.log('Image load error:', error);
        }}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.nombre_producto || 'Producto sin nombre'}
        </Text>

        <View style={styles.priceContainer}>
          {item.descuento && item.descuento > 0 ? (
            <>
              <Text style={styles.originalPrice}>
                {formatPrice(item.precio_producto)}
              </Text>
              <Text style={styles.discountedPrice}>
                {formatPrice(item.precio_con_descuento || item.precio_producto)}
              </Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{item.descuento}%</Text>
              </View>
            </>
          ) : (
            <Text style={styles.normalPrice}>
              {formatPrice(item.precio_producto)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Navbar navigation={navigation} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Nuestros Productos</Text>

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filtrar por categoría:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={handleCategoryChange}
              style={styles.picker}
              dropdownIconColor="#333"
            >
              <Picker.Item label="Todas las categorías" value={0} />
              {categories.map(category => (
                <Picker.Item
                  key={category.id_categoria || category.id}
                  label={category.nombre_categoria || category.nombre || 'Categoría sin nombre'}
                  value={category.id_categoria || category.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3085d6" />
            <Text style={styles.loadingText}>Cargando productos...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchAllProducts()}
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && (
          <>
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={item => (item.id_producto || item.id || Math.random()).toString()}
              numColumns={2}
              contentContainerStyle={styles.productsList}
              scrollEnabled={false} // Disable FlatList scroll since we're inside ScrollView
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No se encontraron productos en esta categoría.
                  </Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => fetchAllProducts()}
                  >
                    <Text style={styles.retryButtonText}>Recargar</Text>
                  </TouchableOpacity>
                </View>
              }
            />

            {products.length > 0 && totalPages > 1 && (
              <View style={styles.pagination}>
                <TouchableOpacity
                  style={[styles.pageButton, page <= 1 && styles.disabledButton]}
                  onPress={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <Text style={[styles.pageButtonText, page <= 1 && styles.disabledButtonText]}>
                    Anterior
                  </Text>
                </TouchableOpacity>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = page <= 3 ? i + 1 :
                                page >= totalPages - 2 ? totalPages - 4 + i :
                                page - 2 + i;
                  return pageNum > 0 && pageNum <= totalPages ? (
                    <TouchableOpacity
                      key={pageNum}
                      style={[styles.pageButton, page === pageNum && styles.activePageButton]}
                      onPress={() => setPage(pageNum)}
                    >
                      <Text style={[styles.pageButtonText, page === pageNum && styles.activePageButtonText]}>
                        {pageNum}
                      </Text>
                    </TouchableOpacity>
                  ) : null;
                })}

                <TouchableOpacity
                  style={[styles.pageButton, page >= totalPages && styles.disabledButton]}
                  onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  <Text style={[styles.pageButtonText, page >= totalPages && styles.disabledButtonText]}>
                    Siguiente
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  filterContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#ffeeee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    marginBottom: 10,
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  productsList: {
    paddingBottom: 20,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: '47%', // Ensure cards don't get too wide
  },
  productImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    lineHeight: 20,
  },
  priceContainer: {
    marginTop: 5,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
    fontSize: 14,
  },
  discountedPrice: {
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 4,
  },
  normalPrice: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#3085d6',
  },
  discountBadge: {
    backgroundColor: '#e53935',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 10,
    flexWrap: 'wrap',
  },
  pageButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 4,
    marginVertical: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    minWidth: 40,
    alignItems: 'center',
  },
  pageButtonText: {
    color: '#495057',
    fontWeight: '500',
    fontSize: 14,
  },
  activePageButton: {
    backgroundColor: '#3085d6',
  },
  activePageButtonText: {
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#999',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ProductsPage;