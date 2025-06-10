import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Alert } from "react-native";
import * as SecureStore from 'expo-secure-store';

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevo, setNuevo] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [etapa, setEtapa] = useState(1);

  const showAlert = (title, message, type = "default") => {
    Alert.alert(title, message, [{ text: "OK" }], { type });
  };

  const enviarCodigo = async () => {
    try {
      const res = await fetch('http://10.0.2.2/corpfresh-php/sendCode.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const text = await res.text();
      const data = JSON.parse(text);
      if (data.success) {
        showAlert("Código enviado", data.message);
        setEtapa(2);
      } else {
        showAlert("Error", data.message);
      }
    } catch (err) {
      console.error('Error al enviar código:', err);
      showAlert("Error", "No se pudo enviar el código");
    }
  };

  const verificarCodigo = async () => {
    try {
      const res = await fetch("http://10.0.2.2/corpfresh-php/verifyCode.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo_usuario: email, codigo }),
      });

      const text = await res.text();
      const data = JSON.parse(text);
      if (data.success) {
        setEtapa(3);
      } else {
        showAlert("Código inválido", data.message);
      }
    } catch (err) {
      console.error('Error al verificar código:', err);
      showAlert("Error", "No se pudo verificar el código");
    }
  };

  const cambiarContrasena = async () => {
    if (nuevo !== confirmar) {
      showAlert("Error", "Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch("http://10.0.2.2/corpfresh-php/updatePassword.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo_usuario: email, nueva_contrasena: nuevo, codigo }),
      });

      const text = await res.text();
      const data = JSON.parse(text);
      if (data.success) {
        showAlert("Éxito", "Contraseña actualizada");
        // You would navigate to login here, for example:
        // navigation.navigate('Login');
      } else {
        showAlert("Error", data.message);
      }
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      showAlert("Error", "No se pudo actualizar la contraseña");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Recuperar Contraseña</Text>

        {etapa === 1 && (
          <>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              value={email}
              placeholder="Ingresa tu correo"
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={enviarCodigo}>
              <Text style={styles.buttonText}>Enviar código</Text>
            </TouchableOpacity>
          </>
        )}

        {etapa === 2 && (
          <>
            <Text style={styles.label}>Código de verificación</Text>
            <TextInput
              style={styles.input}
              value={codigo}
              placeholder="Ingresa el código"
              onChangeText={setCodigo}
            />
            <TouchableOpacity style={styles.button} onPress={verificarCodigo}>
              <Text style={styles.buttonText}>Verificar código</Text>
            </TouchableOpacity>
          </>
        )}

        {etapa === 3 && (
          <>
            <Text style={styles.label}>Nueva contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña"
              value={nuevo}
              onChangeText={setNuevo}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              value={confirmar}
              onChangeText={setConfirmar}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={cambiarContrasena}>
              <Text style={styles.buttonText}>Cambiar contraseña</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ResetPassword;