import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../services/AuthContext";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';

const Perfil = () => {
  const { authState, logout, updateEmail } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    direccion1: "",
    direccion2: "",
    ciudad: "",
    pais: ""
  });
  const [originalEmail, setOriginalEmail] = useState("");
  const [avatar, setAvatar] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    if (!authState || !authState.email) {
      setLoading(false);
      return;
    }

    setOriginalEmail(authState.email);

    // Si es un usuario de Google sin datos completos
    if (authState.isGoogleUser) {
      setUserData({
        correo: authState.email,
        nombre: authState.name || 'Usuario',
        apellido: 'Google',
        telefono: '',
        direccion1: '',
        direccion2: '',
        ciudad: '',
        pais: ''
      });
      setFormData({
        nombre: authState.name || 'Usuario',
        apellido: 'Google',
        telefono: '',
        correo: authState.email,
        direccion1: '',
        direccion2: '',
        ciudad: '',
        pais: ''
      });
      setLoading(false);
      return;
    }

    // Para usuarios normales
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://10.0.2.2/corpfresh-php/getUserData.php', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authState.email }),
        });

        if (!response.ok) throw new Error("Error al obtener datos del usuario");

        const data = await response.json();

        if (data.success) {
          setUserData(data.user);
          setFormData({
            nombre: data.user.nombre || authState.name || "",
            apellido: data.user.apellido || "",
            telefono: data.user.telefono || "",
            correo: data.user.correo || authState.email,
            direccion1: data.user.direccion1 || "",
            direccion2: data.user.direccion2 || "",
            ciudad: data.user.ciudad || "",
            pais: data.user.pais || ""
          });
        } else {
          throw new Error(data.message || "Error al cargar datos");
        }
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authState]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    Alert.alert(
      '¿Guardar cambios?',
      'Estás a punto de actualizar tus datos.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sí, guardar',
          onPress: async () => {
            try {
              const emailChanged = formData.correo !== originalEmail;

              const response = await fetch('http://10.0.2.2/corpfresh-php/updateUserData.php', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: originalEmail,
                  newEmail: emailChanged ? formData.correo : null,
                  isGoogleUser: authState.isGoogleUser || false,
                  ...formData
                }),
              });

              const data = await response.json();

              if (data.success) {
                Alert.alert('¡Actualizado!', 'Tus datos fueron actualizados.');
                setEditMode(false);
                setUserData(prev => ({ ...prev, ...formData }));

                if (emailChanged && updateEmail) {
                  updateEmail(formData.correo);
                  setOriginalEmail(formData.correo);

                  Alert.alert(
                    'Correo actualizado',
                    'Se cerrará tu sesión para completar el proceso.',
                    [],
                    { cancelable: false }
                  );

                  setTimeout(() => {
                    logout();
                    navigation.navigate("Login");
                  }, 3000);
                }
              } else {
                Alert.alert('Error', data.message || 'No se pudo actualizar.');
              }
            } catch (error) {
              Alert.alert('Error', 'Error en la solicitud');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleLogout = () => {
    Alert.alert(
      '¿Cerrar sesión?',
      '',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sí, salir',
          onPress: () => {
            logout();
            navigation.navigate("Login");
          },
        },
      ],
      { cancelable: false }
    );
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!authState || !authState.email) {
    return (
      <View style={styles.container}>
        <View style={styles.alert}>
          <Text style={styles.alertTitle}>No hay usuario autenticado</Text>
          <Text style={styles.alertText}>Debes iniciar sesión para ver tu perfil</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.buttonText}>Ir a Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Perfil de Usuario</Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.avatarContainer}>
            {authState.avatar ? (
              <Image
                source={{ uri: authState.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {userData?.nombre ? userData.nombre.charAt(0).toUpperCase() : "U"}
                </Text>
              </View>
            )}
            {editMode && (
              <TouchableOpacity style={styles.changeAvatarButton} onPress={pickImage}>
                <Text style={styles.changeAvatarText}>Cambiar</Text>
              </TouchableOpacity>
            )}
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {userData && (
            <View style={styles.userDetails}>
              <Text style={styles.sectionTitle}>Datos Personales</Text>

              {editMode ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Correo electrónico:</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.correo}
                      onChangeText={(text) => handleChange('correo', text)}
                      keyboardType="email-address"
                    />
                    {formData.correo !== originalEmail && (
                      <Text style={styles.warningText}>
                        ⚠️ Cambiar tu correo requerirá que inicies sesión nuevamente
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nombre:</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.nombre}
                      onChangeText={(text) => handleChange('nombre', text)}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Apellido:</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.apellido}
                      onChangeText={(text) => handleChange('apellido', text)}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Teléfono:</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.telefono}
                      onChangeText={(text) => handleChange('telefono', text)}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Dirección Principal:</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.direccion1}
                      onChangeText={(text) => handleChange('direccion1', text)}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Dirección Secundaria:</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.direccion2}
                      onChangeText={(text) => handleChange('direccion2', text)}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ciudad:</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.ciudad}
                      onChangeText={(text) => handleChange('ciudad', text)}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>País:</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.pais}
                      onChangeText={(text) => handleChange('pais', text)}
                    />
                  </View>

                  <View style={styles.buttonGroup}>
                    <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                      <Text style={styles.buttonText}>Guardar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setEditMode(false)}>
                      <Text style={styles.buttonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Correo:</Text>
                    <Text style={styles.detailValue}>{userData.correo}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Nombre:</Text>
                    <Text style={styles.detailValue}>{userData.nombre}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Apellido:</Text>
                    <Text style={styles.detailValue}>{userData.apellido}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Teléfono:</Text>
                    <Text style={styles.detailValue}>{userData.telefono}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Dirección Principal:</Text>
                    <Text style={styles.detailValue}>{userData.direccion1}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Dirección Secundaria:</Text>
                    <Text style={styles.detailValue}>{userData.direccion2}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ciudad:</Text>
                    <Text style={styles.detailValue}>{userData.ciudad}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>País:</Text>
                    <Text style={styles.detailValue}>{userData.pais}</Text>
                  </View>

                  <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => setEditMode(true)}>
                    <Text style={styles.buttonText}>Editar Información</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          <View style={styles.navigationButtons}>
            <TouchableOpacity style={[styles.button, styles.homeButton]} onPress={() => navigation.navigate("Home")}>
              <Text style={styles.buttonText}>Ir al Inicio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
              <Text style={styles.buttonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alert: {
    backgroundColor: '#fff3cd',
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#856404',
  },
  alertText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#856404',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  avatarPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  changeAvatarButton: {
    marginTop: 10,
    padding: 5,
  },
  changeAvatarText: {
    color: '#007bff',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  errorText: {
    color: '#721c24',
    textAlign: 'center',
  },
  userDetails: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  warningText: {
    color: '#ffc107',
    fontSize: 12,
    marginTop: 5,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#28a745',
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    flex: 1,
  },
  editButton: {
    backgroundColor: '#ffc107',
    marginTop: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  detailValue: {
    color: '#333',
  },
  navigationButtons: {
    marginTop: 20,
  },
  homeButton: {
    backgroundColor: '#007bff',
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
});

export default Perfil;