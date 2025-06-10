import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../services/AuthContext';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [taxes, setTaxes] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const { authState } = useAuth();
  const navigation = useNavigation();

  // Función para formatear precios en pesos colombianos
  const formatPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  // Función para verificar ofertas activas
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

  useEffect(() => {
    if (!authState || !authState.email) {
      navigation.navigate('Login');
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await fetch(`http://10.0.2.2/corpfresh-php/carrito/carrito.php?usuario=${encodeURIComponent(authState.email)}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Error al cargar el carrito');
        }

        const data = await response.json();

        // Verificar ofertas para cada producto
        const itemsConOfertas = await Promise.all(data.map(async (item) => {
          const oferta = await fetchOfertaActiva(item.id_producto);
          return {
            ...item,
            ofertaActual: oferta,
            precioMostrado: oferta
              ? item.precio * (1 - oferta.porcentaje_descuento / 100)
              : item.precio
          };
        }));

        setCartItems(itemsConOfertas);
        calculateTotals(itemsConOfertas);
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', 'No se pudo cargar el carrito');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [authState, navigation]);

  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.precioMostrado || item.precio) * parseInt(item.cantidad)), 0);
    const shippingCost = subtotal > 100 ? 0 : 10;
    const taxRate = 0.08;
    const taxes = Math.round(subtotal * taxRate);

    const calculatedTotal = subtotal + shippingCost + taxes;

    console.log('Cálculo de totales:', {
      subtotal,
      shippingCost,
      taxes,
      calculatedTotal
    });

    setTotal(calculatedTotal);
    setShipping(shippingCost);
    setTaxes(taxes);
  };

  const handlePayment = async (method) => {
    if (!address || !phone) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    setPaymentMethod(method);

    try {
      // Validar y formatear los datos correctamente
      const paymentData = {
        correo_usuario: authState.email,
        items: cartItems.map(item => ({
          id_producto: parseInt(item.id_producto),
          nombre: String(item.nombre),
          precio: parseFloat(item.precioMostrado || item.precio),
          precio_original: parseFloat(item.precio),
          oferta: item.ofertaActual ? {
            porcentaje_descuento: parseFloat(item.ofertaActual.porcentaje_descuento),
            fecha_fin: item.ofertaActual.fecha_fin
          } : null,
          cantidad: parseInt(item.cantidad),
          color: item.color || null,
          talla: item.talla || null
        })),
        total: parseFloat(total.toFixed(0)),
        metodo_pago: method,
        direccion: String(address),
        telefono: String(phone),
        envio: parseFloat(shipping.toFixed(0)),
        impuestos: parseFloat(taxes.toFixed(0))
      };

      console.log('Datos a enviar al servidor:', JSON.stringify(paymentData, null, 2));

      const response = await fetch('http://10.0.2.2/corpfresh-php/checkout/process_payment.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const responseText = await response.text();
      console.log('Respuesta del servidor:', responseText);

      // Verificar si la respuesta es HTML (error del servidor)
      if (responseText.trim().startsWith('<')) {
        throw new Error('El servidor respondió con una página de error HTML');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Error parseando JSON:', e);
        throw new Error(`El servidor respondió con formato inválido: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error ${response.status} al procesar el pago`);
      }

      // Vaciar el carrito después del pago exitoso
      const deleteResponse = await fetch('http://10.0.2.2/corpfresh-php/carrito/carrito.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: authState.email,
          vaciar: true
        })
      });

      if (!deleteResponse.ok) {
        throw new Error('No se pudo vaciar el carrito');
      }

      Alert.alert(
        '¡Pago exitoso!',
        `Tu pedido #${data.data.orderId} ha sido procesado.`,
        [
          {
            text: 'Ver mis pedidos',
            onPress: () => navigation.navigate('MisPedidos')
          }
        ]
      );
    } catch (error) {
      console.error('Error en el pago:', error);
      Alert.alert(
        'Error en el pago',
        `Ocurrió un error al procesar tu pago:\n\n${error.message}\n\nPor favor verifica los datos e intenta nuevamente.`
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Cargando información de pago...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finalizar Compra</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información de Envío */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Envío</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Dirección de entrega</Text>
            <TextInput
              style={styles.textInput}
              value={address}
              onChangeText={setAddress}
              placeholder="Ingresa tu dirección completa"
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Teléfono de contacto</Text>
            <TextInput
              style={styles.textInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="Ingresa tu número de teléfono"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Método de Pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de Pago</Text>

          <TouchableOpacity
            style={[
              styles.paymentMethod,
              paymentMethod === 'casa' && styles.paymentMethodSelected
            ]}
            onPress={() => setPaymentMethod('casa')}
          >
            <Ionicons name="home" size={24} color={paymentMethod === 'casa' ? '#007bff' : '#666'} />
            <Text style={[
              styles.paymentMethodText,
              paymentMethod === 'casa' && styles.paymentMethodTextSelected
            ]}>
              Pago en Casa
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethod,
              paymentMethod === 'nequi' && styles.paymentMethodSelected
            ]}
            onPress={() => setPaymentMethod('nequi')}
          >
            <Ionicons name="phone-portrait" size={24} color={paymentMethod === 'nequi' ? '#007bff' : '#666'} />
            <Text style={[
              styles.paymentMethodText,
              paymentMethod === 'nequi' && styles.paymentMethodTextSelected
            ]}>
              Pago con Nequi
            </Text>
          </TouchableOpacity>

          {paymentMethod === 'nequi' && (
            <View style={styles.nequiInfo}>
              <Text style={styles.nequiText}>
                Por favor realiza el pago a nuestro número de Nequi: <Text style={styles.bold}>320 8706701</Text>
              </Text>
              <Text style={styles.nequiText}>
                Envía el comprobante de pago al WhatsApp: <Text style={styles.bold}>320 8706701</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Resumen del Pedido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del Pedido</Text>

          <View style={styles.orderSummary}>
            {cartItems.map(item => (
              <View key={item.id_carrito} style={styles.summaryItem}>
                <View style={styles.summaryItemLeft}>
                  <Text style={styles.summaryItemName}>
                    {item.nombre} x {item.cantidad}
                  </Text>
                  {item.ofertaActual && (
                    <View style={styles.offerInfo}>
                      <Text style={styles.originalPrice}>
                        {formatPrecio(item.precio * item.cantidad)}
                      </Text>
                      <Text style={styles.discount}>
                        -{item.ofertaActual.porcentaje_descuento}%
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.summaryItemPrice}>
                  {formatPrecio((item.precioMostrado || item.precio) * parseInt(item.cantidad))}
                </Text>
              </View>
            ))}

            <View style={styles.summaryTotals}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatPrecio(total - shipping - taxes)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Envío</Text>
                <Text style={styles.summaryValue}>{formatPrecio(shipping)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Impuestos</Text>
                <Text style={styles.summaryValue}>{formatPrecio(taxes)}</Text>
              </View>

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrecio(total)}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botón de Confirmar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            !paymentMethod && styles.confirmButtonDisabled
          ]}
          onPress={() => handlePayment(paymentMethod)}
          disabled={!paymentMethod}
        >
          <Text style={styles.confirmButtonText}>Confirmar Pedido</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  paymentMethodSelected: {
    borderColor: '#007bff',
    backgroundColor: '#f0f8ff',
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  paymentMethodTextSelected: {
    color: '#007bff',
    fontWeight: '500',
  },
  nequiInfo: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  nequiText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  orderSummary: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 15,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  summaryItemLeft: {
    flex: 1,
  },
  summaryItemName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  offerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discount: {
    fontSize: 12,
    color: '#dc3545',
    fontWeight: '500',
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryTotals: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginTop: 10,
    paddingTop: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  confirmButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Checkout;