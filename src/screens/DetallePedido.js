import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { useRoute } from '@react-navigation/native';

const DetalleOrden = () => {
    const route = useRoute();
    // CAMBIO PRINCIPAL: Leer orderId en lugar de id
    const { orderId } = route.params;
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPedido = async () => {
            try {
                // CAMBIO: Usar orderId
                const response = await fetch(`http://10.0.2.2/corpfresh-php/pedidos/detalle_pedido.php?pedido_id=${orderId}`);
                const data = await response.json();
                if (response.ok) {
                    // Asegurarnos que total es un número
                    const pedidoConTotalNumerico = {
                        ...data,
                        total: parseFloat(data.total) || 0
                    };
                    setPedido(pedidoConTotalNumerico);
                } else {
                    throw new Error(data.error || 'Error al cargar el pedido');
                }
            } catch (error) {
                console.error('Error:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPedido();
    }, [orderId]); // CAMBIO: orderId en las dependencias

    // Función para formatear precios en pesos colombianos
    const formatPrecio = (precio) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(precio);
    };

    // Función para formatear fecha
    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#28a745" />
                    <Text style={styles.loadingText}>Cargando detalles del pedido...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !pedido) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        {error || 'No se pudo cargar la información del pedido'}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Detalles del Pedido #{pedido.id}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Información del Pedido</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Fecha:</Text>
                        <Text style={styles.value}>{formatFecha(pedido.fecha_pedido)}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Total:</Text>
                        <Text style={[styles.value, styles.totalValue]}>{formatPrecio(pedido.total)}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Estado:</Text>
                        <Text style={[styles.value, styles.estadoValue]}>{pedido.estado}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Método de Pago:</Text>
                        <Text style={styles.value}>{pedido.metodo_pago}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Productos</Text>
                    {pedido.items && pedido.items.map((item, index) => (
                        <View key={item.id || index} style={styles.productItem}>
                            <Text style={styles.productName}>{item.nombre_producto}</Text>
                            <View style={styles.productDetails}>
                                <Text style={styles.productPrice}>
                                    {formatPrecio(parseFloat(item.precio_unitario) || 0)}
                                </Text>
                                <Text style={styles.productQuantity}>x {item.cantidad}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6c757d',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#dc3545',
        textAlign: 'center',
        backgroundColor: '#f8d7da',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f5c6cb',
    },
    header: {
        paddingVertical: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212529',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#495057',
        flex: 1,
    },
    value: {
        fontSize: 16,
        color: '#212529',
        flex: 1,
        textAlign: 'right',
    },
    totalValue: {
        fontWeight: 'bold',
        color: '#28a745',
        fontSize: 18,
    },
    estadoValue: {
        fontWeight: '600',
        color: '#007bff',
    },
    productItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    productName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#212529',
        marginBottom: 4,
    },
    productDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 14,
        color: '#28a745',
        fontWeight: '600',
    },
    productQuantity: {
        fontSize: 14,
        color: '#6c757d',
        fontWeight: '500',
    },
});

export default DetalleOrden;