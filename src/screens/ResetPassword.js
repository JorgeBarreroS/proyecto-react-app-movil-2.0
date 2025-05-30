import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Register = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion1: '',
    direccion2: '',
    ciudad: '',
    pais: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const requiredFields = ['nombre', 'apellido', 'telefono', 'email', 'password', 'confirmPassword'];

    for (let field of requiredFields) {
      if (!formData[field]) {
        Alert.alert('Error', 'Por favor, completa los campos obligatorios');
        return;
      }
    }

    if (!formData.email.includes('@')) {
      Alert.alert('Correo inválido', 'Incluye un signo "@" en la dirección de correo electrónico.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    const dataToSend = {
      nombre_usuario: formData.nombre,
      apellido_usuario: formData.apellido,
      telefono_usuario: formData.telefono,
      correo_usuario: formData.email,
      direccion1_usuario: formData.direccion1 || '',
      direccion2_usuario: formData.direccion2 || '',
      ciudad_usuario: formData.ciudad || '',
      pais_usuario: formData.pais || '',
      contraseña: formData.password,
      id_rol: '2'
    };

    // Simulación para demo (comentar cuando tengas el backend)
    Alert.alert(
      '¡Éxito!',
      'Registro exitoso (Demo). Inicia sesión',
      [
        {
          text: 'Ir a Login',
          onPress: () => navigation.navigate('Login'),
        },
      ]
    );
    return;

    /*
    // Código original comentado temporalmente
    try {
      setLoading(true);

      const response = await fetch('http://localhost/corpfresh-php/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const responseText = await response.text();
      console.log('Respuesta del servidor:', responseText);

      try {
        const data = JSON.parse(responseText);
        if (data.success) {
          Alert.alert(
            '¡Éxito!',
            'Registro exitoso. Inicia sesión',
            [
              {
                text: 'Ir a Login',
                onPress: () => navigation.navigate('Login'),
              },
            ]
          );
        } else {
          Alert.alert('Error', data.message);
        }
      } catch (jsonError) {
        console.error('Error al procesar la respuesta JSON:', jsonError);
        Alert.alert(
          'Error del servidor',
          'Respuesta no válida del servidor. Por favor, contacta al administrador'
        );
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      Alert.alert('Error de conexión', 'Hubo un problema con la conexión al servidor');
    } finally {
      setLoading(false);
    }
    */
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.registerContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#3085d6" />
            </TouchableOpacity>
            <Text style={styles.logoText}>Corpfresh</Text>
            <Text style={styles.title}>Registro</Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Datos Personales</Text>

            {/* Nombre y Apellido */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nombre}
                  onChangeText={(value) => handleChange('nombre', value)}
                  placeholder="Tu nombre"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Apellido *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.apellido}
                  onChangeText={(value) => handleChange('apellido', value)}
                  placeholder="Tu apellido"
                />
              </View>
            </View>

            {/* Teléfono y Email */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Teléfono *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.telefono}
                  onChangeText={(value) => handleChange('telefono', value)}
                  placeholder="Teléfono"
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Correo Electrónico *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleChange('email', value)}
                  placeholder="Correo electrónico"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Direcciones (opcionales) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Dirección 1</Text>
              <TextInput
                style={styles.input}
                value={formData.direccion1}
                onChangeText={(value) => handleChange('direccion1', value)}
                placeholder="Dirección principal (opcional)"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Dirección 2</Text>
              <TextInput
                style={styles.input}
                value={formData.direccion2}
                onChangeText={(value) => handleChange('direccion2', value)}
                placeholder="Dirección secundaria (opcional)"
              />
            </View>

            {/* Ciudad y País */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Ciudad</Text>
                <TextInput
                  style={styles.input}
                  value={formData.ciudad}
                  onChangeText={(value) => handleChange('ciudad', value)}
                  placeholder="Tu ciudad"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>País</Text>
                <TextInput
                  style={styles.input}
                  value={formData.pais}
                  onChangeText={(value) => handleChange('pais', value)}
                  placeholder="Tu país"
                />
              </View>
            </View>

            {/* Contraseñas */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Contraseña *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(value) => handleChange('password', value)}
                  placeholder="Contraseña"
                  secureTextEntry
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Confirmar Contraseña *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleChange('confirmPassword', value)}
                  placeholder="Confirmar contraseña"
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Registrando...' : 'Registrarme'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.required}>* Campos obligatorios</Text>
          </View>

          {/* Enlaces */}
          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>
                ¿Ya tienes cuenta? <Text style={styles.linkBold}>Iniciar Sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  registerContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3085d6',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfInput: {
    flex: 0.48,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#3085d6',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  required: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  linksContainer: {
    alignItems: 'center',
  },
  link: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  linkBold: {
    color: '#3085d6',
    fontWeight: '600',
  },
});

export default Register;