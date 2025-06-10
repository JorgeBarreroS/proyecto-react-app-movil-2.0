import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Linking
} from "react-native";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ContactPage = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });

  const handleSubmit = async (formData) => {
    try {
      const response = await fetch('http://10.0.2.2/corpfresh-php/guardarContacto.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Mensaje enviado con éxito');
        setFormData({ nombre: "", email: "", mensaje: "" });
      } else {
        Alert.alert('Error', 'Error al enviar el mensaje: ' + (data.message || ''));
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Error de conexión');
    }
  };

  const handleWhatsAppClick = async () => {
    Alert.alert(
      "Redirigiendo a WhatsApp",
      "Serás redirigido a WhatsApp para enviar tu mensaje.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Continuar", onPress: () => Linking.openURL("https://wa.me/3208706701") }
      ]
    );
  };

  const handleFormChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async () => {
    const { nombre, email, mensaje } = formData;

    if (!nombre || !email || !mensaje) {
      Alert.alert(
        "Campos incompletos",
        "Por favor, completa todos los campos antes de enviar.",
        [{ text: "OK" }]
      );
    } else {
      try {
        await handleSubmit(formData);
      } catch (error) {
        Alert.alert(
          "Error de red",
          "No se pudo enviar el mensaje. Verifica tu conexión o inténtalo más tarde.",
          [{ text: "OK" }]
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Navbar navigation={navigation} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>¡Contáctanos!</Text>

          <View style={styles.whatsappContainer}>
            <Image
              source={require('../assets/images/whatsapp.png')}
              style={styles.whatsappImage}
            />
            <Text style={styles.whatsappTitle}>¿Necesitas ayuda rápida?</Text>
            <Text style={styles.whatsappText}>Contacta con nosotros a través de WhatsApp:</Text>
            <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsAppClick}>
              <Text style={styles.buttonText}>Enviar mensaje por WhatsApp</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>O envíanos un mensaje:</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre:</Text>
              <TextInput
                style={styles.input}
                value={formData.nombre}
                onChangeText={(text) => handleFormChange("nombre", text)}
                placeholder="Ingresa tu nombre"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo electrónico:</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => handleFormChange("email", text)}
                placeholder="Ingresa tu correo electrónico"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mensaje:</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.mensaje}
                onChangeText={(text) => handleFormChange("mensaje", text)}
                placeholder="Escribe tu mensaje"
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleFormSubmit}>
              <Text style={styles.buttonText}>Enviar mensaje</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  whatsappContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  whatsappImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  whatsappTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  whatsappText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#555',
    textAlign: 'center',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  formContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ContactPage;
