import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import * as Google from 'expo-auth-session/providers/google';
// import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../services/AuthContext';

// Configuración para Google OAuth
// WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

const Login = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Configuración de Google OAuth (comentado temporalmente)
  /*
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '590045182886-8jfebo35qqi7mpc4dtldu48m3skpu6ne.apps.googleusercontent.com',
    iosClientId: 'TU_IOS_CLIENT_ID', // Reemplaza con tu iOS client ID
    androidClientId: 'TU_ANDROID_CLIENT_ID', // Reemplaza con tu Android client ID
  });

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response);
    }
  }, [response]);
  */

  // Función de Google (comentada temporalmente)
  /*
  const handleGoogleResponse = async (response) => {
    try {
      setLoading(true);

      // Obtener información del usuario de Google
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.authentication.accessToken}`
      );
      const userInfo = await userInfoResponse.json();

      const googleUser = {
        name: userInfo.name,
        email: userInfo.email,
        avatar: userInfo.picture,
      };

      const serverResponse = await fetch('http://10.0.2.2/corpfresh-php/authenticateGoogle.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.avatar,
        }),
      });

      const data = await serverResponse.json();

      if (!serverResponse.ok) {
        throw new Error(data.message || 'Error en el servidor');
      }

      if (data.success) {
        await login({
          id: data.user.id,
          name: data.user.name || googleUser.name,
          email: data.user.email,
          rol: data.user.rol,
          avatar: googleUser.avatar,
          isGoogleUser: data.isGoogleUser || false,
        });

        Alert.alert(
          '¡Bienvenido!',
          'Inicio de sesión con Google exitoso',
          [
            {
              text: 'Continuar',
              onPress: () => {
                console.log('Navegando a Home desde Google...');
                navigation.replace('Home');
              },
            },
          ]
        );
      } else {
        throw new Error(data.message || 'Error al autenticar usuario de Google');
      }
    } catch (error) {
      console.error('Error en autenticación Google:', error);
      Alert.alert('Error', error.message || 'No se pudo iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };
  */

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Campos vacíos', 'Por favor, ingresa tus credenciales.');
      return;
    }

    try {
      setLoading(true);
      console.log('Iniciando proceso de login...');

      const response = await fetch('http://10.0.2.2/corpfresh-php/authenticate.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('Respuesta del servidor recibida');
      const data = await response.json();
      console.log('Datos del servidor:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error en el servidor');
      }

      if (data.success) {
        console.log('Login exitoso, guardando datos del usuario...');

        // Guardar datos del usuario en el contexto
        await login({
          name: data.user.name || data.user.email,
          email: data.user.email,
          rol: data.user.rol,
          id: data.user.id,
          isGoogleUser: false,
        });

        console.log('Datos guardados, mostrando alerta...');

        Alert.alert(
          '¡Éxito!',
          'Inicio de sesión exitoso',
          [
            {
              text: 'Continuar',
              onPress: () => {
                console.log('Usuario presionó Continuar');
                const userRole = Number(data.user.rol);
                console.log('Rol del usuario:', userRole);

                if (userRole === 1) {
                  console.log('Navegando a Crud (admin)...');
                  navigation.replace('FetchProductos');
                } else {
                  console.log('Navegando a Home (usuario normal)...');
                  navigation.replace('Home');
                }
              },
            },
          ]
        );
      } else {
        console.log('Login fallido:', data.message);
        Alert.alert(
          'Inicio no válido',
          data.message || 'Usuario o contraseña incorrectos'
        );
      }
    } catch (error) {
      console.error('Error completo:', error);
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor. Error: ' + error.message);
    } finally {
      setLoading(false);
      console.log('Proceso de login terminado');
    }
  };

  // Función de prueba para debugging
  const handleTestNavigation = () => {
    console.log('Probando navegación directa...');
    navigation.replace('Home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.loginContainer}>
          {/* Header con logo */}
          <View style={styles.header}>
            {/* <Image
              source={require('../imagenes/Corp.png')} // Asegúrate de que la ruta sea correcta
              style={styles.logo}
              resizeMode="contain"
            /> */}
            <Text style={styles.logoText}>Corpfresh</Text>
            <Text style={styles.title}>¡Bienvenido a CorpFreshh!</Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Ingresa tu correo"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Ingresa tu contraseña"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={togglePasswordVisibility}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={togglePasswordVisibility}
            >
              <View style={[styles.checkbox, showPassword && styles.checkboxChecked]}>
                {showPassword && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <Text style={styles.checkboxLabel}>Mostrar contraseña</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Text>
            </TouchableOpacity>

          </View>

          {/* Enlaces */}
          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>
                No tienes cuenta? <Text style={styles.linkBold}>Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Google Login - Comentado temporalmente */}
          {/*
          <View style={styles.socialLogin}>
            <Text style={styles.socialText}>O inicia sesión con:</Text>
            <TouchableOpacity
              style={[styles.googleButton, loading && styles.buttonDisabled]}
              onPress={() => promptAsync()}
              disabled={!request || loading}
            >
              <Ionicons name="logo-google" size={20} color="white" style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            </TouchableOpacity>
          </View>
          */}
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
    justifyContent: 'center',
    padding: 20,
  },
  loginContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
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
    textAlign: 'center',
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#3085d6',
    borderRadius: 3,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3085d6',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#3085d6',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  testButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linksContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  link: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  linkBold: {
    color: '#3085d6',
    fontWeight: '600',
  },
  socialLogin: {
    alignItems: 'center',
  },
  socialText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  googleButton: {
    backgroundColor: '#db4437',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Login;