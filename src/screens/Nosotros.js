import React from 'react';
import {
  View,
  ScrollView,
  Text,
  Image,
  StyleSheet,
  Dimensions
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Usando require() para las imágenes (más compatible con Expo)
const imagen3 = require("../assets/images/Corp.png");
const imagen1 = require("../assets/images/perfil1.jpg");
const imagen2 = require("../assets/images/perfil2.jpg");
const imagen3Team = require("../assets/images/perfil3.jpg");
const imagen4 = require("../assets/images/perfil5.jpg");

const { width } = Dimensions.get('window');

// Componente StorySection
const StorySection = () => {
  return (
    <View style={styles.section}>
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.textColumn}>
            <Text style={styles.title}>Nuestra historia</Text>
            <Text style={styles.leadText}>
              CorpFreshh surgió de una pasión compartida por la moda y la sostenibilidad. Nuestros cuatro cofundadores
              se unieron con la visión de crear una marca de ropa que no solo se vea bien sino que se sienta bien,
              tanto para quien la usa como para el planeta.
            </Text>
            <Text style={styles.bodyText}>
              En CorpFreshh creemos que el estilo y la responsabilidad pueden ir de la mano. Nuestras colecciones
              están cuidadosamente seleccionadas para ofrecerle las últimas tendencias y al mismo tiempo mantener
              nuestro compromiso con la producción ética y los materiales sostenibles.
            </Text>
          </View>
          <View style={styles.imageColumn}>
            <Image
              source={imagen3}
              style={styles.storyImage}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

// Componente MissionSection
const MissionSection = () => {
  const missionItems = [
    {
      title: "Artesanía de calidad",
      text: "Estamos comprometidos a ofrecer prendas duraderas y de alta calidad que resistan el paso del tiempo.",
    },
    {
      title: "Moda Sostenible",
      text: "Nuestro objetivo es minimizar nuestro impacto ambiental mediante el uso de materiales y procesos ecológicos.",
    },
    {
      title: "Estilo empoderador",
      text: "Nuestro objetivo es inspirar confianza a través de una moda que sea a la vez moderna y expresiva individualmente.",
    },
  ];

  return (
    <View style={styles.missionSection}>
      <View style={styles.container}>
        <Text style={styles.centerTitle}>Nuestra Misión</Text>
        <View style={styles.missionGrid}>
          {missionItems.map((item, index) => (
            <View key={index} style={styles.missionCard}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// Componente TeamSection
const TeamSection = () => {
  const teamMembers = [
    {
      name: "Jorge B",
      role: "CEO y director creativo",
      imgSrc: imagen1,
    },
    {
      name: "Arteaga",
      role: "CEO y diseñador",
      imgSrc: imagen2,
    },
    {
      name: "Nelson Avellaneda",
      role: "CEO y diseñador",
      imgSrc: imagen3Team,
    },
    {
      name: "Diego Pirazan",
      role: "CEO y diseñador",
      imgSrc: imagen4,
    },
  ];

  return (
    <View style={styles.section}>
      <View style={styles.container}>
        <Text style={styles.centerTitle}>Conoce a nuestras cofundadores</Text>
        <View style={styles.teamGrid}>
          {teamMembers.map((member, index) => (
            <View key={index} style={styles.teamCard}>
              <Image source={member.imgSrc} style={styles.teamImage} />
              <View style={styles.teamCardBody}>
                <Text style={styles.teamName}>{member.name}</Text>
                <Text style={styles.teamRole}>{member.role}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// Componente principal AboutPage
const AboutPage = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.mainContainer}>
      <Navbar navigation={navigation} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <StorySection />
        <MissionSection />
        <TeamSection />
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  missionSection: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  container: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  row: {
    flexDirection: width > 768 ? 'row' : 'column',
    alignItems: 'center',
  },
  textColumn: {
    flex: 1,
    paddingRight: width > 768 ? 20 : 0,
    marginBottom: width > 768 ? 0 : 20,
  },
  imageColumn: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  centerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#333',
  },
  leadText: {
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 16,
    color: '#666',
    fontWeight: '500',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  storyImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  missionGrid: {
    flexDirection: width > 768 ? 'row' : 'column',
    justifyContent: 'space-between',
  },
  missionCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    marginBottom: 20,
    flex: width > 768 ? 1 : 0,
    marginHorizontal: width > 768 ? 8 : 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#666',
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  teamCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    width: width > 768 ? '23%' : width > 480 ? '48%' : '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  teamImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  teamCardBody: {
    padding: 16,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  teamRole: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default AboutPage;