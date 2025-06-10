import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Linking,
  Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../services/AuthContext';

const MisPedidos = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { authState } = useAuth();
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      if (!authState?.email) {
        navigation.navigate('Login');
        return;
      }
      fetchOrders();
    }, [authState])
  );

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://10.0.2.2/corpfresh-php/pedidos/mis_pedidos.php?usuario=${encodeURIComponent(authState.email)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al cargar los pedidos');
      }

      // Normalizar estados a minúsculas
      const normalizedOrders = (data.data || []).map(order => ({
        ...order,
        estado: order.estado.toLowerCase()
      }));

      setOrders(normalizedOrders);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudieron cargar los pedidos'
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const generateInvoice = async (orderId) => {
    try {
      Alert.alert('Generando factura', 'Por favor espere...');

      const response = await fetch(
        `http://10.0.2.2/corpfresh-php/facturas/generar_factura.php?pedido_id=${orderId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/pdf'
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al generar la factura');
      }

      // Obtener el blob/datos binarios
      const blob = await response.blob();

      // Convertir blob a base64 para React Native
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];

        // Crear archivo temporal
        const fileUri = FileSystem.documentDirectory + `factura_${orderId}.pdf`;

        try {
          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Compartir el archivo
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Factura generada',
              UTI: 'com.adobe.pdf'
            });
          } else {
            Alert.alert(
              'Factura generada',
              'La factura se ha guardado en su dispositivo'
            );
          }
        } catch (fileError) {
          console.error('Error al guardar archivo:', fileError);
          Alert.alert('Error', 'No se pudo guardar la factura');
        }
      };

      reader.onerror = () => {
        Alert.alert('Error', 'No se pudo procesar la factura');
      };

    } catch (error) {
      console.error('Error al generar factura:', error);
      Alert.alert(
        'Error',
        error.message.includes('Failed to fetch')
          ? 'No se pudo conectar al servidor'
          : error.message || 'Error al generar la factura'
      );
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      // Confirmación con Alert nativo
      Alert.alert(
        '¿Estás seguro?',
        'No podrás revertir esta acción',
        [
          {
            text: 'No, mantener pedido',
            style: 'cancel'
          },
          {
            text: 'Sí, cancelar pedido',
            style: 'destructive',
            onPress: async () => {
              try {
                const response = await fetch(
                  `http://10.0.2.2/corpfresh-php/pedidos/cancelar_pedido.php`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      pedido_id: orderId,
                      usuario: authState.email
                    })
                  }
                );

                if (!response.ok) {
                  const errorText = await response.text();
                  throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
                }

                const data = await response.json();

                if (!data.success) {
                  throw new Error(data.error || 'Error al cancelar el pedido');
                }

                // Actualizar lista de pedidos
                fetchOrders();

                Alert.alert(
                  'Pedido cancelado',
                  'Tu pedido ha sido cancelado correctamente'
                );
              } catch (error) {
                console.error('Error al cancelar pedido:', error);
                Alert.alert(
                  'Error',
                  error.message || 'No se pudo cancelar el pedido'
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado');
    }
  };

  const calculateSubtotal = (order) => {
    return (order.total - (order.costo_envio || 0) - (order.impuestos || 0)).toFixed(2);
  };

  // Función para formatear precios en pesos colombianos
  const formatPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completado':
        return '#28a745';
      case 'cancelado':
        return '#dc3545';
      case 'pendiente':
        return '#6c757d';
      case 'procesando':
        return '#17a2b8';
      case 'enviado':
        return '#007bff';
      default:
        return '#ffc107';
    }
  };

  const canGenerateInvoice = (status) => {
    return status === 'completado';
  };

  const canCancelOrder = (status) => {
    return ['pendiente', 'procesando'].includes(status);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Pedidos</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Cargando tus pedidos...</Text>
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
        <Text style={styles.headerTitle}>Mis Pedidos</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.noOrders}>
            <Ionicons name="cube-outline" size={80} color="#ccc" />
            <Text style={styles.noOrdersTitle}>Aún no tienes pedidos</Text>
            <Text style={styles.noOrdersText}>
              Cuando realices un pedido, aparecerá aquí.
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopButtonText}>Ir a la tienda</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map(order => (
              <View key={order.id} style={styles.orderCard}>
                {/* Header del pedido */}
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderTitle}>Pedido #{order.id}</Text>
                    <Text style={styles.orderDate}>
                      {formatDate(order.fecha_pedido)}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.estado) }
                  ]}>
                    <Text style={styles.statusText}>
                      {order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                    </Text>
                  </View>
                </View>

                {/* Detalles del pedido */}
                <View style={styles.orderDetails}>
                  {/* Resumen */}
                  <View style={styles.summarySection}>
                    <Text style={styles.sectionTitle}>
                      <Ionicons name="receipt-outline" size={16} color="#666" /> Resumen
                    </Text>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Subtotal:</Text>
                      <Text style={styles.summaryValue}>
                        {formatPrecio(calculateSubtotal(order))}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Envío:</Text>
                      <Text style={styles.summaryValue}>
                        {formatPrecio(order.costo_envio || 0)}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Impuestos:</Text>
                      <Text style={styles.summaryValue}>
                        {formatPrecio(order.impuestos || 0)}
                      </Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                      <Text style={styles.totalLabel}>Total:</Text>
                      <Text style={styles.totalValue}>
                        {formatPrecio(order.total)}
                      </Text>
                    </View>
                  </View>

                  {/* Información */}
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>
                      <Ionicons name="information-circle-outline" size={16} color="#666" /> Información
                    </Text>
                    <View style={styles.infoRow}>
                      <Ionicons name="card-outline" size={16} color="#666" />
                      <Text style={styles.infoText}>
                        <Text style={styles.infoLabel}>Método de pago:</Text> {order.metodo_pago}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="location-outline" size={16} color="#666" />
                      <Text style={styles.infoText}>
                        <Text style={styles.infoLabel}>Dirección:</Text> {order.direccion_entrega}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="cube-outline" size={16} color="#666" />
                      <Text style={styles.infoText}>
                        <Text style={styles.infoLabel}>Productos:</Text> {order.total_productos}
                      </Text>
                    </View>
                  </View>

                  {/* Acciones */}
                  <View style={styles.actionsSection}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => navigation.navigate('DetallePedido', { orderId: order.id })}
                    >
                      <Ionicons name="eye-outline" size={16} color="#007bff" />
                      <Text style={styles.actionButtonText}>Ver detalles</Text>
                    </TouchableOpacity>

                    {canCancelOrder(order.estado) && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => cancelOrder(order.id)}
                      >
                        <Ionicons name="close-circle-outline" size={16} color="#dc3545" />
                        <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                          Cancelar
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        !canGenerateInvoice(order.estado) && styles.disabledButton
                      ]}
                      onPress={() => generateInvoice(order.id)}
                      disabled={!canGenerateInvoice(order.estado)}
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={16}
                        color={canGenerateInvoice(order.estado) ? '#28a745' : '#ccc'}
                      />
                      <Text style={[
                        styles.actionButtonText,
                        styles.invoiceButtonText,
                        !canGenerateInvoice(order.estado) && styles.disabledButtonText
                      ]}>
                        Factura
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  noOrders: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  noOrdersTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  noOrdersText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ordersList: {
    paddingVertical: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 15,
  },
  summarySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
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
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  infoLabel: {
    fontWeight: '600',
    color: '#333',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007bff',
    margin: 4,
  },
  actionButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  cancelButton: {
    borderColor: '#dc3545',
  },
  cancelButtonText: {
    color: '#dc3545',
  },
  invoiceButtonText: {
    color: '#28a745',
  },
  disabledButton: {
    borderColor: '#ccc',
  },
  disabledButtonText: {
    color: '#ccc',
  },
});

export default MisPedidos;