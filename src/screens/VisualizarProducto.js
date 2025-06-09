import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  FlatList
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { addToCart } from '../services/carritoService';

const VisualizarProducto = () => {
  const route = useRoute();
  const { id } = route.params;
  const navigation = useNavigation();
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [nuevaPuntuacion, setNuevaPuntuacion] = useState(5);
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  const formatPrecio = (precio) => {
    const numPrice = parseFloat(precio) || 0;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(numPrice);
  };

  const getImageSource = (imagePath) => {
    if (!imagePath) return "http://10.0.2.2/corpfresh-php/imagenes/1.jpg";
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return `http://10.0.2.2/corpfresh-php/${imagePath}`;
  };

  const fetchComentarios = async () => {
    setLoadingComentarios(true);
    try {
      const response = await fetch(`http://10.0.2.2/corpfresh-php/comentarios.php?id_producto=${id}`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

      const data = await response.json();
      setComentarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener comentarios:", err);
      setComentarios([]);
    } finally {
      setLoadingComentarios(false);
    }
  };

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        setLoading(true);
        setError(null);
        setProducto(null);

        const response = await fetch(`http://10.0.2.2/corpfresh-php/visualizarProducto.php?id=${id}`);
        if (!response.ok) throw new Error("No se pudo cargar el producto.");
        const data = await response.json();

        if (data.error) {
          setProducto(null);
          setLoading(false);
          return;
        }

        const ofertaResponse = await fetch(`http://10.0.2.2/CorpFreshhXAMPP/bd/Ofertas/obtenerOfertaActiva.php?id_producto=${id}`);
        let ofertaData = { success: false };

        if (ofertaResponse.ok) {
          ofertaData = await ofertaResponse.json();
        }

        setProducto({
          ...data,
          oferta: ofertaData.success ? ofertaData.data : null
        });

        if (data.stock > 0) {
          setCantidad(1);
        } else {
          setCantidad(0);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
    fetchComentarios();
  }, [id]);

  const handleAddToCart = async () => {
    if (cantidad < 1) {
      Alert.alert('Error', 'La cantidad debe ser al menos 1');
      return;
    }

    if (cantidad > producto.stock) {
      Alert.alert('Error', `No hay suficiente stock. Stock disponible: ${producto.stock}`);
      return;
    }

    try {
      const result = await addToCart({
        id_producto: producto.id_producto,
        nombre: producto.nombre_producto,
        precio: producto.precio_producto,
        imagen: producto.imagen_producto,
        cantidad: cantidad,
        color: producto.color_producto || null,
        talla: producto.talla || null
      });

      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        Alert.alert(
          'Producto agregado',
          'El producto se ha añadido al carrito.',
          [
            {
              text: 'Seguir comprando',
              style: 'cancel',
            },
            {
              text: 'Ver el carrito',
              onPress: () => navigation.navigate('CartPage'),
            },
          ],
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al agregar al carrito');
    }
  };

  const agregarComentario = async () => {
    Alert.alert('Información', 'Debes iniciar sesión para comentar');
    return;

    if (nuevoComentario.trim() === '') {
      Alert.alert('Error', 'El comentario no puede estar vacío.');
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2/corpfresh-php/comentarios.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_producto: id,
          comentario: nuevoComentario,
          puntuacion: nuevaPuntuacion,
          usuario: 'usuario@ejemplo.com'
        })
      });

      const data = await response.json();
      if (data.success) {
        setNuevoComentario('');
        setNuevaPuntuacion(5);
        await fetchComentarios();
        Alert.alert('Éxito', 'Comentario agregado correctamente.');
      } else {
        throw new Error(data.error || 'No se pudo agregar el comentario.');
      }
    } catch (error) {
      console.error("Error al agregar comentario:", error);
      Alert.alert('Error', error.message);
    }
  };

  const eliminarComentario = async (idComentario) => {
    Alert.alert('Información', 'Debes iniciar sesión para eliminar comentarios');
    return;

    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro que deseas eliminar este comentario?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              const response = await fetch('http://10.0.2.2/corpfresh-php/comentarios.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_comentario: idComentario })
              });

              const data = await response.json();
              if (data.success) {
                await fetchComentarios();
                Alert.alert('Éxito', 'Comentario eliminado correctamente.');
              } else {
                throw new Error(data.error || 'No se pudo eliminar el comentario.');
              }
            } catch (error) {
              console.error("Error al eliminar comentario:", error);
              Alert.alert('Error', error.message);
            }
          },
        },
      ],
    );
  };

  const iniciarEdicionComentario = (comentario) => {
    setEditingCommentId(comentario.id_comentario);
    setEditingCommentText(comentario.comentario);
  };

  const cancelarEdicionComentario = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const guardarEdicionComentario = async () => {
    Alert.alert('Información', 'Debes iniciar sesión para editar comentarios');
    return;

    if (editingCommentText.trim() === '') {
      Alert.alert('Error', 'El comentario no puede estar vacío.');
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2/corpfresh-php/comentarios.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_comentario: editingCommentId,
          comentario: editingCommentText
        })
      });

      const data = await response.json();
      if (data.success) {
        await fetchComentarios();
        setEditingCommentId(null);
        setEditingCommentText('');
        Alert.alert('Éxito', 'Comentario actualizado correctamente.');
      } else {
        throw new Error(data.error || 'No se pudo actualizar el comentario.');
      }
    } catch (error) {
      console.error("Error al actualizar comentario:", error);
      Alert.alert('Error', error.message);
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3085d6" />
      <Text style={styles.loadingText}>Cargando...</Text>
    </View>
  );

  if (error) return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Error: {error}</Text>
    </View>
  );

  if (!producto) return (
    <View style={styles.notFoundContainer}>
      <Text style={styles.notFoundText}>No se encontró el producto.</Text>
    </View>
  );

  const hayStock = producto.stock > 0;
  const stockBajo = hayStock && producto.stock <= 5;

  return (
    <SafeAreaView style={styles.mainContainer}>
      <Navbar navigation={navigation} />

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.productContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: getImageSource(producto.imagen_producto) }}
              style={styles.productImage}
              resizeMode="contain"
              onError={() => ({ uri: "http://10.0.2.2/corpfresh-php/imagenes/1.jpg" })}
            />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.productTitle}>{producto.nombre_producto}</Text>

            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Precio: </Text>
              {producto.oferta ? (
                <>
                  <Text style={[styles.priceText, styles.oldPrice]}>
                    {formatPrecio(producto.precio_producto)}
                  </Text>
                  <Text style={[styles.priceText, styles.discountPrice]}>
                    {formatPrecio(producto.precio_producto * (1 - producto.oferta.porcentaje_descuento / 100))}
                  </Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{producto.oferta.porcentaje_descuento}%</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.priceText}>
                  {formatPrecio(producto.precio_producto)}
                </Text>
              )}
            </View>

            <Text style={styles.descriptionText}>
              <Text style={styles.label}>Descripción: </Text>
              {producto.descripcion_producto}
            </Text>

            <Text style={styles.detailText}>
              <Text style={styles.label}>Color: </Text>
              {producto.color_producto}
            </Text>

            <Text style={styles.detailText}>
              <Text style={styles.label}>Marca: </Text>
              {producto.nombre_marca}
            </Text>

            <Text style={styles.detailText}>
              <Text style={styles.label}>Talla: </Text>
              {producto.talla}
            </Text>

            <Text style={[
              styles.stockText,
              !hayStock ? styles.outOfStock : stockBajo ? styles.lowStock : styles.inStock
            ]}>
              <Text style={styles.label}>Stock disponible: </Text>
              {producto.stock}
              {!hayStock && <Text> - Agotado</Text>}
              {stockBajo && hayStock && <Text> - ¡Últimas unidades!</Text>}
            </Text>

            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Cantidad:</Text>
              <TextInput
                style={styles.quantityInput}
                value={cantidad.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 0;
                  if (value <= producto.stock) {
                    setCantidad(value);
                  } else {
                    setCantidad(producto.stock);
                    Alert.alert('Aviso', `Solo hay ${producto.stock} unidades disponibles.`);
                  }
                }}
                keyboardType="numeric"
                editable={hayStock}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.addToCartButton,
                !hayStock || cantidad <= 0 ? styles.disabledButton : null
              ]}
              onPress={handleAddToCart}
              disabled={!hayStock || cantidad <= 0}
            >
              <Text style={styles.addToCartText}>
                {hayStock ? 'Añadir al carrito' : 'Producto agotado'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Comentarios y Reseñas</Text>

          <View style={styles.commentForm}>
            <TextInput
              style={styles.commentInput}
              placeholder="Escribe un comentario"
              value={nuevoComentario}
              onChangeText={setNuevoComentario}
              multiline
              numberOfLines={3}
            />

            <View style={styles.commentActions}>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>Puntuación: </Text>
                <Text style={styles.ratingStars}>{renderStars(nuevaPuntuacion)}</Text>
              </View>

              <TouchableOpacity
                style={styles.submitCommentButton}
                onPress={agregarComentario}
                disabled={nuevoComentario.trim() === ''}
              >
                <Text style={styles.submitCommentText}>Agregar Comentario</Text>
              </TouchableOpacity>
            </View>
          </View>

          {loadingComentarios ? (
            <View style={styles.loadingComments}>
              <ActivityIndicator size="small" color="#3085d6" />
              <Text style={styles.loadingCommentsText}>Cargando comentarios...</Text>
            </View>
          ) : comentarios.length > 0 ? (
            <FlatList
              data={comentarios}
              keyExtractor={(item) => item.id_comentario.toString()}
              renderItem={({ item }) => (
                <View style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View>
                      <Text style={styles.commentUser}>{item.usuario}</Text>
                      <Text style={styles.commentDate}>
                        {new Date(item.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                    <Text style={styles.commentRating}>{renderStars(item.puntuacion)}</Text>
                  </View>

                  {editingCommentId === item.id_comentario ? (
                    <View style={styles.editCommentContainer}>
                      <TextInput
                        style={styles.editCommentInput}
                        value={editingCommentText}
                        onChangeText={setEditingCommentText}
                        multiline
                        numberOfLines={3}
                      />
                      <View style={styles.editButtons}>
                        <TouchableOpacity
                          style={styles.saveEditButton}
                          onPress={guardarEdicionComentario}
                          disabled={editingCommentText.trim() === ''}
                        >
                          <Text style={styles.saveEditText}>Guardar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.cancelEditButton}
                          onPress={cancelarEdicionComentario}
                        >
                          <Text style={styles.cancelEditText}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.commentText}>{item.comentario}</Text>
                  )}

                  <View style={styles.commentButtons}>
                    <TouchableOpacity
                      style={styles.editCommentButton}
                      onPress={() => iniciarEdicionComentario(item)}
                    >
                      <Ionicons name="pencil" size={16} color="#3085d6" />
                      <Text style={styles.editCommentText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteCommentButton}
                      onPress={() => eliminarComentario(item.id_comentario)}
                    >
                      <Ionicons name="trash" size={16} color="#dc3545" />
                      <Text style={styles.deleteCommentText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          ) : (
            <View style={styles.noComments}>
              <Text style={styles.noCommentsText}>No hay comentarios aún. ¡Sé el primero en comentar!</Text>
            </View>
          )}
        </View>
      </ScrollView>

    </SafeAreaView>
  );
};

// Los estilos se mantienen igual que en el código anterior
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    color: '#ffc107',
  },
  productContainer: {
    flexDirection: 'column',
    padding: 15,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
  infoContainer: {
    flex: 1,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
    marginRight: 5,
  },
  discountPrice: {
    color: '#dc3545',
  },
  discountBadge: {
    backgroundColor: '#dc3545',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 5,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  descriptionText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
    lineHeight: 22,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  stockText: {
    fontSize: 16,
    marginBottom: 15,
  },
  inStock: {
    color: '#28a745',
  },
  lowStock: {
    color: '#ffc107',
  },
  outOfStock: {
    color: '#dc3545',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#333',
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
  },
  addToCartButton: {
    backgroundColor: '#3085d6',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentsSection: {
    padding: 15,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  commentForm: {
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 80,
    marginBottom: 10,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 16,
    color: '#333',
  },
  ratingStars: {
    fontSize: 16,
    color: '#ffc107',
  },
  submitCommentButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
  },
  submitCommentText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingComments: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  loadingCommentsText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  commentCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  commentUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
  },
  commentRating: {
    fontSize: 16,
    color: '#ffc107',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  editCommentContainer: {
    marginBottom: 10,
  },
  editCommentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 80,
    marginBottom: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  saveEditButton: {
    backgroundColor: '#3085d6',
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  saveEditText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelEditButton: {
    backgroundColor: '#6c757d',
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelEditText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  editCommentText: {
    marginLeft: 5,
    color: '#3085d6',
    fontSize: 14,
  },
  deleteCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteCommentText: {
    marginLeft: 5,
    color: '#dc3545',
    fontSize: 14,
  },
  noComments: {
    padding: 15,
    alignItems: 'center',
  },
  noCommentsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default VisualizarProducto;