import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Alert,
  RefreshControl
} from 'react-native';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function ProductosCRUD() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState(null);
  const [editingProductoId, setEditingProductoId] = useState(null);
  const [editedProducto, setEditedProducto] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProducto, setNewProducto] = useState({
    nombre_producto: "",
    descripcion_producto: "",
    color_producto: "",
    precio_producto: "",
    imagen_producto: "",
    nombre_marca: "",
    talla: "",
    stock: "",
    id_categoria: ""
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchProductos = async () => {
    try {
      const response = await fetch("http://10.0.2.2/CorpFreshhXAMPP/bd/obtenerProductos.php");
      if (!response.ok) {
        throw new Error("Error al obtener productos");
      }
      const data = await response.json();
      setProductos(data);
    } catch (err) {
      setError(err.message);
      Alert.alert("Error", err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await fetch("http://10.0.2.2/CorpFreshhXAMPP/bd/obtenerCategorias.php");
      if (!response.ok) {
        throw new Error("Error al obtener categorías");
      }
      const data = await response.json();
      setCategorias(data);
    } catch (err) {
      setError(err.message);
      Alert.alert("Error", err.message);
    }
  };

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProductos();
    fetchCategorias();
  };

  const handleEdit = (producto) => {
    setEditingProductoId(producto.id_producto);
    setEditedProducto(producto);
  };

  const handleSave = async () => {
    try {
      const response = await fetch("http://10.0.2.2/CorpFreshhXAMPP/bd/actualizarProducto.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedProducto),
      });

      const data = await response.json();

      if (data.success) {
        setProductos(prevProductos =>
          prevProductos.map(producto =>
            producto.id_producto === editedProducto.id_producto ? editedProducto : producto
          )
        );
        setEditingProductoId(null);
        setEditedProducto({});
        Alert.alert("Éxito", "Producto actualizado correctamente");
      } else {
        Alert.alert("Error", "Error al actualizar el producto");
      }
    } catch (error) {
      Alert.alert("Error", "Error al procesar la solicitud: " + error.message);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Eliminar Producto",
      "¿Estás seguro de que deseas eliminar este producto?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          onPress: () => confirmDelete(id)
        }
      ]
    );
  };

  const confirmDelete = async (id) => {
    try {
      const response = await fetch("http://10.0.2.2/CorpFreshhXAMPP/bd/eliminarProducto.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_producto: id }),
      });

      const data = await response.json();

      if (data.success) {
        setProductos(prevProductos =>
          prevProductos.filter(producto => producto.id_producto !== id)
        );
        Alert.alert("Eliminado", "El producto ha sido eliminado correctamente");
      } else {
        Alert.alert("Error", "Error al eliminar el producto: " + (data.message || ""));
      }
    } catch (error) {
      Alert.alert("Error", "Error al procesar la solicitud: " + error.message);
    }
  };

  const handleChange = (name, value) => {
    setEditedProducto(prev => ({ ...prev, [name]: value }));
  };

  const handleAddFormChange = (name, value) => {
    setNewProducto(prev => ({ ...prev, [name]: value }));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      handleAddFormChange('imagen_producto', result.assets[0].uri);
    }
  };

  const handleAddProduct = async () => {
    // Validar campos requeridos
    if (!newProducto.nombre_producto || !newProducto.precio_producto) {
      Alert.alert("Campos requeridos", "El nombre y precio del producto son obligatorios");
      return;
    }

    try {
      const response = await fetch("http://10.0.2.2/CorpFreshhXAMPP/bd/agregarProducto.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProducto),
      });

      const data = await response.json();

      if (data.success) {
        const productoConId = { ...newProducto, id_producto: data.id_producto };
        setProductos(prevProductos => [...prevProductos, productoConId]);

        setNewProducto({
          nombre_producto: "",
          descripcion_producto: "",
          color_producto: "",
          precio_producto: "",
          imagen_producto: "",
          nombre_marca: "",
          talla: "",
          stock: "",
          id_categoria: ""
        });

        setSelectedImage(null);
        setShowAddForm(false);

        Alert.alert("Éxito", "Producto agregado correctamente");
      } else {
        Alert.alert("Error", "Error al agregar el producto: " + (data.message || ""));
      }
    } catch (error) {
      Alert.alert("Error", "Error al procesar la solicitud: " + error.message);
    }
  };

  const getNombreCategoria = (id_categoria) => {
    const categoria = categorias.find(cat => cat.id_categoria === id_categoria);
    return categoria ? categoria.nombre_categoria : "Sin categoría";
  };

  const filteredProductos = productos.filter(producto =>
    producto.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.productoCard}>
      {editingProductoId === item.id_producto ? (
        <View style={styles.editForm}>
          <TextInput
            style={styles.editInput}
            value={editedProducto.nombre_producto}
            onChangeText={(text) => handleChange('nombre_producto', text)}
            placeholder="Nombre"
          />
          <TextInput
            style={styles.editInput}
            value={editedProducto.descripcion_producto}
            onChangeText={(text) => handleChange('descripcion_producto', text)}
            placeholder="Descripción"
          />
          <TextInput
            style={styles.editInput}
            value={editedProducto.precio_producto}
            onChangeText={(text) => handleChange('precio_producto', text)}
            placeholder="Precio"
            keyboardType="numeric"
          />
          <View style={styles.editButtons}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditingProductoId(null)}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          {item.imagen_producto && (
            <Image
              source={{ uri: item.imagen_producto }}
              style={styles.productImage}
            />
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.nombre_producto}</Text>
            <Text style={styles.productPrice}>${item.precio_producto}</Text>
            <Text style={styles.productStock}>Stock: {item.stock}</Text>
            <Text style={styles.productCategory}>{getNombreCategoria(item.id_categoria)}</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => handleEdit(item)}
              style={styles.editButton}
            >
              <Feather name="edit" size={20} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item.id_producto)}
              style={styles.deleteButton}
            >
              <Feather name="trash-2" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Productos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <AntDesign name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
      </View>

      <FlatList
        data={filteredProductos}
        renderItem={renderItem}
        keyExtractor={item => item.id_producto.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="error-outline" size={50} color="#888" />
            <Text style={styles.emptyText}>No se encontraron productos</Text>
          </View>
        }
      />

      {/* Modal para agregar producto */}
      <Modal
        visible={showAddForm}
        animationType="slide"
        transparent={false}
      >
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Agregar Nuevo Producto</Text>
            <TouchableOpacity
              onPress={() => setShowAddForm(false)}
              style={styles.closeButton}
            >
              <AntDesign name="close" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              value={newProducto.nombre_producto}
              onChangeText={(text) => handleAddFormChange('nombre_producto', text)}
              placeholder="Nombre del producto"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={styles.input}
              value={newProducto.descripcion_producto}
              onChangeText={(text) => handleAddFormChange('descripcion_producto', text)}
              placeholder="Descripción del producto"
              multiline
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Precio *</Text>
            <TextInput
              style={styles.input}
              value={newProducto.precio_producto}
              onChangeText={(text) => handleAddFormChange('precio_producto', text)}
              placeholder="Precio"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Stock</Text>
            <TextInput
              style={styles.input}
              value={newProducto.stock}
              onChangeText={(text) => handleAddFormChange('stock', text)}
              placeholder="Cantidad en stock"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Imagen</Text>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={pickImage}
            >
              <Text style={styles.imagePickerText}>
                {selectedImage ? "Cambiar imagen" : "Seleccionar imagen"}
              </Text>
            </TouchableOpacity>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.selectedImage}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Categoría</Text>
            <View style={styles.pickerContainer}>
              {categorias.length > 0 ? (
                <ScrollView style={styles.pickerScroll}>
                  {categorias.map(categoria => (
                    <TouchableOpacity
                      key={categoria.id_categoria}
                      style={[
                        styles.pickerOption,
                        newProducto.id_categoria === categoria.id_categoria && styles.pickerOptionSelected
                      ]}
                      onPress={() => handleAddFormChange('id_categoria', categoria.id_categoria)}
                    >
                      <Text>{categoria.nombre_categoria}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.noCategories}>No hay categorías disponibles</Text>
              )}
            </View>
          </View>

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={styles.cancelFormButton}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.cancelFormButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddProduct}
            >
              <Text style={styles.submitButtonText}>Guardar Producto</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2196F3',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 8,
    paddingHorizontal: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  searchIcon: {
    marginLeft: 10,
  },
  listContent: {
    padding: 10,
  },
  productoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    color: '#2196F3',
    marginBottom: 3,
  },
  productStock: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  productCategory: {
    fontSize: 12,
    color: '#888',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  editButton: {
    marginRight: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  imagePickerButton: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerText: {
    color: '#2196F3',
    fontSize: 16,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    maxHeight: 150,
  },
  pickerScroll: {
    padding: 5,
  },
  pickerOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  noCategories: {
    padding: 15,
    color: '#888',
    textAlign: 'center',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelFormButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelFormButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editForm: {
    flex: 1,
  },
  editInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});