import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Footer = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleEmailChange = (text) => {
    setEmail(text);
  };

  const handleSubscribe = () => {
    const trimmedEmail = email.trim();

    if (trimmedEmail === "") {
      Alert.alert(
        'Campo vacío',
        'Por favor, ingresa tu correo electrónico',
        [{ text: 'OK' }]
      );
    } else if (!isValidEmail(trimmedEmail)) {
      Alert.alert(
        'Email inválido',
        'Por favor, ingresa un correo electrónico válido',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        '¡Suscripción completada!',
        'Gracias por suscribirte a nuestro boletín',
        [{ text: 'OK' }]
      );
      setEmail('');
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+573208706701');
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:CorpFreshh@gmail.com');
  };

  const handleSocialPress = (platform) => {
    Alert.alert(
      'Redes Sociales',
      `Abriendo ${platform}...`,
      [{ text: 'OK' }]
    );
  };

  const handleNavigation = (screenName) => {
    if (navigation) {
      navigation.navigate(screenName);
    }
  };

  return (
    <View style={styles.footer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Enlaces útiles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enlaces útiles</Text>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleNavigation('Home')}
          >
            <Ionicons name="home-outline" size={16} color="#666" />
            <Text style={styles.linkText}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleNavigation('About')}
          >
            <Ionicons name="information-circle-outline" size={16} color="#666" />
            <Text style={styles.linkText}>Acerca de nosotros</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleNavigation('Contact')}
          >
            <Ionicons name="mail-outline" size={16} color="#666" />
            <Text style={styles.linkText}>Contacto</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleNavigation('Products')}
          >
            <Ionicons name="shirt-outline" size={16} color="#666" />
            <Text style={styles.linkText}>Productos</Text>
          </TouchableOpacity>
        </View>

        {/* Contacto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacto</Text>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={handlePhonePress}
          >
            <Ionicons name="call-outline" size={16} color="#3085d6" />
            <Text style={styles.contactText}>+57 3208706701</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={handleEmailPress}
          >
            <Ionicons name="mail-outline" size={16} color="#3085d6" />
            <Text style={styles.contactText}>CorpFreshh@gmail.com</Text>
          </TouchableOpacity>
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.contactText}>Calle 56, Bosa Porvenir</Text>
          </View>
        </View>

        {/* Redes sociales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redes sociales</Text>
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialPress('Facebook')}
            >
              <Ionicons name="logo-facebook" size={24} color="#1877f2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialPress('Twitter')}
            >
              <Ionicons name="logo-twitter" size={24} color="#1da1f2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialPress('Instagram')}
            >
              <Ionicons name="logo-instagram" size={24} color="#e4405f" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Newsletter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CorpFreshh</Text>
          <Text style={styles.newsletterDescription}>
            Suscríbete a nuestro boletín informativo para recibir las últimas noticias y ofertas especiales.
          </Text>

          <View style={styles.subscriptionContainer}>
            <TextInput
              style={styles.emailInput}
              placeholder="Tu correo electrónico"
              placeholderTextColor="#999"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={handleSubscribe}
            >
              <Text style={styles.subscribeButtonText}>Suscribirse</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>
            © 2024 CorpFreshh. Todos los derechos reservados.
          </Text>
          <Text style={styles.versionText}>Versión móvil 1.0</Text>
        </View>

        {/* Información adicional */}
        <View style={styles.additionalInfo}>
          <TouchableOpacity style={styles.infoItem}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#28a745" />
            <Text style={styles.infoText}>Pagos seguros</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoItem}>
            <Ionicons name="car-outline" size={16} color="#28a745" />
            <Text style={styles.infoText}>Envío gratis +$100</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoItem}>
            <Ionicons name="refresh-outline" size={16} color="#28a745" />
            <Text style={styles.infoText}>Devoluciones gratis</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#f8f9fa',
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  socialButton: {
    marginRight: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  newsletterDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  subscriptionContainer: {
    flexDirection: 'column',
  },
  emailInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  subscribeButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  copyrightSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  copyrightText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#666',
  },
});

export default Footer;