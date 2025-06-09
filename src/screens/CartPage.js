import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../services/AuthContext';
import { getCart, updateCartItemQuantity, removeFromCart, clearCart } from '../services/carritoService';

const CartPage = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [stockLimits, setStockLimits] = useState({});
    const { authState } = useAuth();
    const navigation = useNavigation();
    const MAX_PRODUCTO_CANTIDAD = 10;

    const getImageSource = (imagePath) => {
        if (!imagePath) {
            return "http://10.0.2.2/corpfresh-php/imagenes/1.jpg";
        }

        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        return `http://10.0.2.2/corpfresh-php/${imagePath}`;
    };

    const formatPrecio = (precio) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(precio);
    };

    const fetchProductStock = async (id_producto) => {
        try {
            const response = await fetch(`http://10.0.2.2/corpfresh-php/visualizarProducto.php?id=${id_producto}`);
            if (!response.ok) throw new Error("No se pudo cargar el producto.");
            const data = await response.json();
            if (data.error) {
                return null;
            }
            return data.stock;
        } catch (err) {
            console.error("Error al obtener stock:", err);
            return null;
        }
    };

    const fetchOfertaActiva = async (id_producto) => {
        try {
            const response = await fetch(`http://10.0.2.2/CorpFreshhXAMPP/bd/Ofertas/obtenerOfertaActiva.php?id_producto=${id_producto}`);
            if (!response.ok) return null;
            const data = await response.json();
            return data.success ? data.data : null;
        } catch (err) {
            console.error("Error al verificar oferta:", err);
            return null;
        }
    };

    const fetchCarrito = async () => {
      try {
        if (!authState || !authState.email) {
          setProductos([]);
          setLoading(false);
          return;
        }

        const result = await getCart();

        if (result.error) {
          setError(result.error);
          setProductos([]);
        } else {
          const productosConOfertas = await Promise.all(result.map(async (producto) => {
            const oferta = await fetchOfertaActiva(producto.id_producto);
            return {
              ...producto,
              ofertaActual: oferta,
              precioMostrado: oferta
                ? producto.precio * (1 - oferta.porcentaje_descuento / 100)
                : producto.precio
            };
          })); // Aquí faltaba el paréntesis de cierre

          setProductos(productosConOfertas);
          calcularTotal(productosConOfertas);

          const stockData = {};
          for (const producto of result) {
            const stock = await fetchProductStock(producto.id_producto);
            stockData[producto.id_producto] = stock !== null ? stock : MAX_PRODUCTO_CANTIDAD;
          }
          setStockLimits(stockData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const calcularTotal = (items) => {
        const sum = items.reduce((acc, item) => acc + (parseFloat(item.precioMostrado || item.precio) * item.cantidad), 0);
        setTotal(sum);
    };

    useEffect(() => {
        fetchCarrito();

        const interval = setInterval(() => {
            if (authState?.email && productos.length > 0) {
                fetchCarrito();
            }
        }, 300000);

        return () => clearInterval(interval);
    }, [authState]);

    const actualizarCantidad = async (id_carrito, nuevaCantidad, id_producto) => {
      if (nuevaCantidad < 1) {
        Alert.alert('Error', 'La cantidad debe ser al menos 1');
        return;
      }

      const stockLimit = stockLimits[id_producto] || MAX_PRODUCTO_CANTIDAD;
      if (nuevaCantidad > stockLimit) {
        Alert.alert('Error', `No hay suficiente stock. Máximo disponible: ${stockLimit}`);
        nuevaCantidad = stockLimit;
      }

      try {
        const result = await updateCartItemQuantity(id_carrito, nuevaCantidad);

        if (result.error) {
          Alert.alert('Error', result.error);
        } else {
          const nuevosProductos = productos.map(prod =>
            prod.id_carrito === id_carrito ? { ...prod, cantidad: nuevaCantidad } : prod
          );
          setProductos(nuevosProductos);
          calcularTotal(nuevosProductos);
        }
      } catch (err) {
        Alert.alert('Error', err.message || 'Hubo un problema al actualizar el carrito');
      }
    };


    const eliminarProducto = async (id_carrito, productoNombre) => {
      Alert.alert(
        '¿Eliminar producto?',
        `¿Estás seguro de eliminar ${productoNombre} de tu carrito?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Sí, eliminar',
            onPress: async () => {
              try {
                const result = await removeFromCart(id_carrito);

                if (result.error) {
                  Alert.alert('Error', result.error);
                } else {
                  const nuevosProductos = productos.filter(prod => prod.id_carrito !== id_carrito);
                  setProductos(nuevosProductos);
                  const productoEliminado = productos.find(p => p.id_carrito === id_carrito);
                  const nuevoTotal = total - ((productoEliminado.precioMostrado || productoEliminado.precio) * productoEliminado.cantidad);
                  setTotal(nuevoTotal);
                  Alert.alert('¡Eliminado!', 'El producto ha sido eliminado del carrito');
                }
              } catch (err) {
                Alert.alert('Error', err.message || 'Hubo un problema al eliminar el producto del carrito');
              }
            },
          },
        ]
      );
    };

    const vaciarCarrito = async () => {
      Alert.alert(
        '¿Vaciar carrito?',
        "Se eliminarán todos los productos del carrito",
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Sí, vaciar',
            onPress: async () => {
              try {
                const result = await clearCart();

                if (result.error) {
                  Alert.alert('Error', result.error);
                } else {
                  setProductos([]);
                  setTotal(0);
                  Alert.alert('Carrito vaciado', 'Se han eliminado todos los productos');
                }
              } catch (err) {
                Alert.alert('Error', err.message || 'Hubo un problema al vaciar el carrito');
              }
            },
          },
        ]
      );
    };

    const procederPago = () => {
        if (!authState || !authState.email) {
            Alert.alert(
                'Inicia sesión',
                'Debes iniciar sesión para continuar con la compra',
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel',
                    },
                    {
                        text: 'Ir a login',
                        onPress: () => navigation.navigate('Login', { returnUrl: '/carrito' }),
                    },
                ]
            );
            return;
        }

        if (productos.length === 0) {
            Alert.alert('Carrito vacío', 'Agrega productos antes de continuar');
            return;
        }

        navigation.navigate('Checkout');
    };

    if (loading) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3085d6" />
            <Text style={styles.loadingText}>Cargando carrito...</Text>
        </View>
    );

    if (error) return (
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
        </View>
    );

    const renderItem = ({ item: producto }) => {
        const stockLimit = stockLimits[producto.id_producto] || MAX_PRODUCTO_CANTIDAD;
        const stockWarning = producto.cantidad >= stockLimit;

        return (
            <View style={styles.cartItem}>
                <Image
                    source={{ uri: getImageSource(producto.imagen) }}
                    style={styles.cartItemImage}
                    onError={() => ({ uri: "http://10.0.2.2/corpfresh-php/imagenes/1.jpg" })}
                />

                <View style={styles.cartItemDetails}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Product', { id: producto.id_producto })}
                    >
                        <Text style={styles.cartItemName}>{producto.nombre}</Text>
                    </TouchableOpacity>

                    <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemPrice}>
                            {producto.ofertaActual ? (
                                <>
                                    <Text style={styles.oldPrice}>
                                        {formatPrecio(producto.precio)}
                                    </Text>
                                    <Text style={styles.discountPrice}>
                                        {' '}{formatPrecio(producto.precioMostrado)}
                                    </Text>
                                    <Text style={styles.discountBadge}>
                                        {' '}-{producto.ofertaActual.porcentaje_descuento}%
                                    </Text>
                                </>
                            ) : (
                                formatPrecio(producto.precio)
                            )}
                        </Text>
                        {stockWarning && (
                            <Text style={styles.stockWarning}>
                                <Ionicons name="warning" size={14} color="#ffc107" /> Máx: {stockLimit}
                            </Text>
                        )}
                        {producto.talla && <Text style={styles.cartItemSize}>Talla: {producto.talla}</Text>}
                        {producto.color && <Text style={styles.cartItemColor}>Color: {producto.color}</Text>}
                    </View>
                </View>

                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => actualizarCantidad(producto.id_carrito, producto.cantidad - 1, producto.id_producto)}
                        disabled={producto.cantidad <= 1}
                    >
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>

                    <TextInput
                        style={styles.quantityInput}
                        value={producto.cantidad.toString()}
                        onChangeText={(text) => {
                            const newValue = parseInt(text) || 0;
                            if (!isNaN(newValue)) {
                                actualizarCantidad(producto.id_carrito, newValue, producto.id_producto);
                            }
                        }}
                        keyboardType="numeric"
                    />

                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => actualizarCantidad(producto.id_carrito, producto.cantidad + 1, producto.id_producto)}
                        disabled={producto.cantidad >= (stockLimits[producto.id_producto] || MAX_PRODUCTO_CANTIDAD)}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.subtotalText}>
                    {formatPrecio(producto.precioMostrado * producto.cantidad)}
                </Text>

                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => eliminarProducto(producto.id_carrito, producto.nombre, producto.imagen)}
                >
                    <Ionicons name="trash" size={20} color="#dc3545" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Navbar navigation={navigation} />

            <ScrollView style={styles.scrollContainer}>
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>Mi Carrito de Compras</Text>

                    {!authState || !authState.email ? (
                        <View style={styles.emptyCartContainer}>
                            <Ionicons name="cart" size={50} color="#ccc" />
                            <Text style={styles.emptyCartTitle}>Inicia sesión para ver tu carrito</Text>
                            <Text style={styles.emptyCartText}>Para ver tus productos y realizar compras, debes iniciar sesión primero.</Text>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.primaryButton}
                                    onPress={() => navigation.navigate('Login')}
                                >
                                    <Text style={styles.buttonText}>Iniciar Sesión</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.secondaryButton}
                                    onPress={() => navigation.navigate('Home')}
                                >
                                    <Text style={styles.secondaryButtonText}>Seguir Comprando</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : productos.length === 0 ? (
                        <View style={styles.emptyCartContainer}>
                            <Ionicons name="cart" size={50} color="#ccc" />
                            <Text style={styles.emptyCartTitle}>Tu carrito está vacío</Text>
                            <Text style={styles.emptyCartText}>¡Encuentra productos increíbles en nuestra tienda!</Text>

                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => navigation.navigate('Home')}
                            >
                                <Text style={styles.buttonText}>Explorar Tienda</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <FlatList
                                data={productos}
                                renderItem={renderItem}
                                keyExtractor={item => item.id_carrito.toString()}
                                scrollEnabled={false}
                            />

                            <View style={styles.cartActions}>
                                <TouchableOpacity
                                    style={styles.secondaryButton}
                                    onPress={() => navigation.navigate('Products')}
                                >
                                    <Text style={styles.secondaryButtonText}>
                                        <Ionicons name="arrow-back" size={16} /> Seguir comprando
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.dangerButton}
                                    onPress={vaciarCarrito}
                                >
                                    <Text style={styles.buttonText}>
                                        <Ionicons name="trash" size={16} /> Vaciar carrito
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.summaryContainer}>
                                <Text style={styles.summaryTitle}>Resumen del Pedido</Text>

                                <View style={styles.summaryItem}>
                                    <Text>Subtotal</Text>
                                    <Text>{formatPrecio(total)}</Text>
                                </View>

                                <View style={styles.summaryItem}>
                                    <Text>Envío</Text>
                                    <Text>Calculado en el checkout</Text>
                                </View>

                                <View style={styles.summaryItem}>
                                    <Text>Impuestos</Text>
                                    <Text>Calculado en el checkout</Text>
                                </View>

                                <View style={styles.summaryTotal}>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalAmount}>{formatPrecio(total)}</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.checkoutButton}
                                    onPress={procederPago}
                                >
                                    <Text style={styles.checkoutButtonText}>
                                        Proceder al pago <Ionicons name="arrow-forward" size={16} />
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        flex: 1,
    },
    contentContainer: {
        padding: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 17,
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
        color: '#d32f2f',
        textAlign: 'center',
        lineHeight: 22,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
        textAlign: 'center',
    },
    emptyCartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginTop: 10,
        marginHorizontal: 10,
    },
    emptyCartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        color: '#333',
        textAlign: 'center',
    },
    emptyCartText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'column',
        gap: 10,
        paddingHorizontal: 20,
    },
    primaryButton: {
        backgroundColor: '#1976D2',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#1976D2',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    dangerButton: {
        backgroundColor: '#d32f2f',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    secondaryButtonText: {
        color: '#1976D2',
        fontSize: 16,
        fontWeight: '500',
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        alignItems: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
    },
    cartItemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    cartItemDetails: {
        flex: 1,
        marginRight: 8,
    },
    cartItemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1976D2',
        marginBottom: 4,
    },
    cartItemInfo: {
        marginBottom: 4,
    },
    cartItemPrice: {
        fontSize: 14,
    },
    oldPrice: {
        textDecorationLine: 'line-through',
        color: '#999',
        fontSize: 12,
    },
    discountPrice: {
        color: '#d32f2f',
        fontWeight: '600',
        fontSize: 14,
    },
    discountBadge: {
        color: '#fff',
        backgroundColor: '#d32f2f',
        borderRadius: 3,
        paddingHorizontal: 4,
        fontSize: 11,
        marginLeft: 4,
    },
    stockWarning: {
        color: '#ff9800',
        fontSize: 11,
        marginTop: 2,
    },
    cartItemSize: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
    },
    cartItemColor: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    quantityButton: {
        backgroundColor: '#f0f0f0',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    quantityInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        width: 40,
        height: 40,
        textAlign: 'center',
        marginHorizontal: 4,
        backgroundColor: '#fff',
    },
    subtotalText: {
        fontWeight: '600',
        minWidth: 70,
        textAlign: 'right',
        color: '#333',
        fontSize: 14,
        marginRight: 8,
    },
    removeButton: {
        padding: 6,
    },
    cartActions: {
        flexDirection: 'column',
        gap: 10,
        marginTop: 16,
        marginBottom: 20,
    },
    summaryContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
    },
    summaryTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
        textAlign: 'center',
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    summaryTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    totalLabel: {
        fontWeight: '600',
        fontSize: 16,
        color: '#333',
    },
    totalAmount: {
        fontWeight: '600',
        fontSize: 16,
        color: '#1976D2',
    },
    checkoutButton: {
        backgroundColor: '#388E3C',
        padding: 16,
        borderRadius: 8,
        marginTop: 16,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default CartPage;