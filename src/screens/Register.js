import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Register = () => {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    direccion1: "",
    direccion2: "",
    ciudad: "",
    pais: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const showAlert = (title, message, type = 'default') => {
    Alert.alert(title, message);
  };

  const handleSubmit = async () => {
    const requiredFields = ["nombre", "apellido", "telefono", "email", "password", "confirmPassword"];

    // Validar campos obligatorios
    for (let field of requiredFields) {
      if (!formData[field]) {
        showAlert("Error", "Por favor, completa los campos obligatorios");
        return;
      }
    }

    // Validar email
    if (!formData.email.includes("@")) {
      showAlert("Correo inválido", "Incluye un signo '@' en la dirección de correo electrónico.");
      return;
    }

    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      showAlert("Error", "Las contraseñas no coinciden");
      return;
    }

    const dataToSend = {
      nombre_usuario: formData.nombre,
      apellido_usuario: formData.apellido,
      telefono_usuario: formData.telefono,
      correo_usuario: formData.email,
      direccion1_usuario: formData.direccion1 || "",
      direccion2_usuario: formData.direccion2 || "",
      ciudad_usuario: formData.ciudad || "",
      pais_usuario: formData.pais || "",
      contraseña: formData.password,
      id_rol: "2"
    };

    try {
      const response = await fetch("http://10.0.2.2/corpfresh-php/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const responseText = await response.text();
      console.log("Respuesta del servidor:", responseText);

      try {
        const data = JSON.parse(responseText);
        if (data.success) {
          Alert.alert(
            "¡Éxito!",
            "Registro exitoso. Inicia sesión",
            [
              {
                text: "OK",
                onPress: () => navigation.navigate('Login')
              }
            ]
          );
        } else {
          showAlert("Error", data.message);
        }
      } catch (jsonError) {
        console.error("Error al procesar la respuesta JSON:", jsonError);
        showAlert(
          "Error del servidor",
          "Respuesta no válida del servidor. Verifica la consola para más detalles.\nPor favor, contacta al administrador"
        );
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      showAlert(
        "Error de conexión",
        "Hubo un problema con la conexión al servidor"
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.registerContainer}>
          {/* Header con logo */}
          <View style={styles.header}>
            <Image
              source={require('../assets/images/Corp.png')} // Asegúrate de que la ruta sea correcta
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Registro</Text>

          {/* Datos Personales */}
          <Text style={styles.sectionTitle}>Datos Personales</Text>

          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                value={formData.nombre}
                onChangeText={(value) => handleChange('nombre', value)}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Apellido *</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu apellido"
                value={formData.apellido}
                onChangeText={(value) => handleChange('apellido', value)}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Teléfono *</Text>
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                value={formData.telefono}
                onChangeText={(value) => handleChange('telefono', value)}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Correo Electrónico *</Text>
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>


          <View style={styles.formRow}>
                      <View style={styles.formGroup}>
                        <Text style={styles.label}>Ciudad</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Ciudad"
                          value={formData.ciudad}
                          onChangeText={(value) => handleChange('ciudad', value)}
                        />
                      </View>
                      <View style={styles.formGroup}>
                        <Text style={styles.label}>País</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="País"
                          value={formData.pais}
                          onChangeText={(value) => handleChange('pais', value)}
                        />
                      </View>
                    </View>

          {/* Contraseñas */}
          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Contraseña *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={formData.password}
                onChangeText={(value) => handleChange('password', value)}
                secureTextEntry
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirmar Contraseña *</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                value={formData.confirmPassword}
                onChangeText={(value) => handleChange('confirmPassword', value)}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Registrarme</Text>
          </TouchableOpacity>

          <Text style={styles.requiredText}>* Campos obligatorios</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  registerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
    color: '#555',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  formGroup: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  requiredText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default Register;