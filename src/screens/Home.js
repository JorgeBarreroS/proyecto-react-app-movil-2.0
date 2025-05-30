import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const { width } = Dimensions.get('window');

// Función para mostrar un Dato Curioso aleatorio
const showFunFact = () => {
  const funFacts = [
    "¿Sabías que las camisetas de algodón se hicieron populares a principios del siglo XX?",
    "Los jeans originalmente fueron creados para los mineros debido a su durabilidad.",
    "El término 'polo' para camisas proviene del deporte del mismo nombre.",
    "La chaqueta de cuero fue popularizada por los pilotos de la Primera Guerra Mundial.",
    "El 'little black dress' fue introducido por Coco Chanel en los años 20.",
    "El color púrpura era tan caro de producir que solo la realeza podía permitirse vestirlo.",
    "Las zapatillas deportivas modernas comenzaron como simples zapatos de lona en el siglo XIX.",
    "La primera tienda de zapatillas exclusivas se abrió en Nueva York en 1986."
  ];
  Alert.alert(
    'Dato Curioso',
    funFacts[Math.floor(Math.random() * funFacts.length)],
    [{ text: '¡Genial!' }]
  );
};

// Función para mostrar una oferta aleatoria
const showRandomOffer = () => {
  const offers = [
    "¡50% de descuento en camisetas de algodón premium!",
    "Compra 2 y lleva 3 en todos nuestros jeans de diseñador.",
    "¡Envío gratis en compras superiores a $50 en ropa de temporada!",
    "¡20% de descuento en tu primera compra de chaquetas exclusivas!",
    "¡Oferta flash! 30% de descuento en toda la colección de verano durante las próximas 24 horas.",
    "¡Exclusivo online! 40% en calzado premium hasta agotar existencias.",
    "Colección limitada: Compra hoy y recibe un accesorio de regalo."
  ];
  Alert.alert(
    'Oferta Especial',
    offers[Math.floor(Math.random() * offers.length)],
    [{ text: '¡Aprovechar ahora!' }]
  );
};

// Función para mostrar un tip de estilo aleatorio
const showRandomStyleTip = () => {
  const tips = [
    "Combina tus jeans con una camisa blanca para un look casual clásico.",
    "Usa capas para añadir profundidad y estilo a tu atuendo en climas más fríos.",
    "Los colores neutros son fáciles de combinar con cualquier prenda.",
    "Los accesorios adecuados pueden transformar un look sencillo en uno elegante.",
    "El contraste entre texturas crea outfits más interesantes visualmente.",
    "Un par de zapatillas premium puede elevar cualquier conjunto casual.",
    "Invierte en piezas atemporales para construir un armario duradero.",
    "Las zapatillas blancas combinan con prácticamente todo tu guardarropa."
  ];
  Alert.alert(
    'Tip de Estilo',
    "Consejo de estilo: " + tips[Math.floor(Math.random() * tips.length)],
    [{ text: '¡Gracias!' }]
  );
};

// Componente ProductCard
const ProductCard = ({ imgSrc, title, description, price, onPress }) => (
  <TouchableOpacity style={styles.productCard} onPress={onPress}>
    <Image source={imgSrc} style={styles.productImage} resizeMode="cover" />
    <View style={styles.productInfo}>
      <Text style={styles.productTitle}>{title}</Text>
      <Text style={styles.productDescription}>{description}</Text>
      <Text style={styles.productPrice}>{price}</Text>
    </View>
  </TouchableOpacity>
);

// Componente Carousel
const SimpleCarousel = ({ showFunFact, showRandomOffer, showRandomStyleTip }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Bienvenido a CorpFreshh",
      subtitle: "Tu tienda de moda premium",
      action: showFunFact,
      actionText: "Dato Curioso",
      background: '#3085d6',
      image: require('../assets/images/jean.jpg') // Added image
    },
    {
      title: "Ofertas Especiales",
      subtitle: "Descuentos increíbles te esperan",
      action: showRandomOffer,
      actionText: "Ver Ofertas",
      background: '#dc3545',
      image: require('../assets/images/zapatosP.png') // Added image
    },
    {
      title: "Tips de Estilo",
      subtitle: "Consejos para lucir increíble",
      action: showRandomStyleTip,
      actionText: "Ver Consejos",
      background: '#28a745',
      image: require('../assets/images/42631_10.webp') // Added image
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const currentSlideData = slides[currentSlide];

  return (
    <View style={[styles.carousel, { backgroundColor: currentSlideData.background }]}>
      <Image source={currentSlideData.image} style={styles.carouselImage} resizeMode="cover" />
      <View style={styles.carouselContent}>
        <Text style={styles.carouselTitle}>{currentSlideData.title}</Text>
        <Text style={styles.carouselSubtitle}>{currentSlideData.subtitle}</Text>
        <TouchableOpacity
          style={styles.carouselButton}
          onPress={currentSlideData.action}
        >
          <Text style={styles.carouselButtonText}>{currentSlideData.actionText}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.indicators}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentSlide === index && styles.activeIndicator
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const Home = ({ navigation }) => {
  const [ofertaActiva, setOfertaActiva] = useState(null);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Productos de ejemplo
  const productos = [
    {
      id: 1,
      imgSrc: require('../assets/images/tenis12.jpg'),
      title: "Louis Vuitton Skate Black",
      description: "Están hechos con materiales exóticos y exclusivos para el máximo confort.",
      price: "$10.736.439"
    },
    {
      id: 2,
      imgSrc: require('../assets/images/zapatosP.png'),
      title: "Jordan 4 Retro White Thunder",
      description: "Un toque elegante y moderno para tu colección premium.",
      price: "$1.228.693"
    },
    {
      id: 3,
      imgSrc: require('../assets/images/zapatosPPP.png'),
      title: "Jordan 4 Retro Military Blue",
      description: "Combinación histórica y elegante para un estilo inconfundible.",
      price: "$568.375"
    }
  ];

  const categorias = [
    {
      id: 1,
      imgSrc: require('../assets/images/42631_10.webp'),
      title: "Camisas Exclusivas"
    },
    {
      id: 2,
      imgSrc: require('../assets/images/zapatosP.png'),
      title: "Sneakers Exclusivos"
    },
    {
      id: 3,
      imgSrc: require('../assets/images/jean.jpg'),
      title: "Edición Limitada"
    }
  ];

  // Función para obtener ofertas desde tu API REAL
  const fetchOfertaActiva = async () => {
    try {
      setLoading(true);

      // URL de tu API - Actualizada con el endpoint correcto
      const apiUrl = 'http://10.0.2.2/CorpFreshhXAMPP/bd/Ofertas/obtenerOfertasGenerales.php';

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setOfertaActiva(result.data);

        // Calcular cuenta regresiva con fecha real de la API
        const endDate = new Date(result.data.fecha_fin);
        const now = new Date();
        const diff = endDate - now;

        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          setCountdown({ days, hours, minutes, seconds });
        }
      } else {
        throw new Error(result.message || 'No se encontraron ofertas activas');
      }
    } catch (error) {
      console.error("Error al obtener oferta:", error);
      Alert.alert(
        'Error',
        'No se pudo cargar la información de ofertas: ' + error.message
      );
      setOfertaActiva(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOfertaActiva();
  }, []);

  // Efecto para la cuenta regresiva
  useEffect(() => {
    if (!ofertaActiva) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.days === 0 && prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
          clearInterval(timer);
          return prev;
        }

        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [ofertaActiva]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOfertaActiva();
  };

  const handleProductPress = (product) => {
    Alert.alert(
      product.title,
      `Precio: ${product.price}\n\n${product.description}`,
      [
        { text: 'Cerrar', style: 'cancel' },
        { text: 'Ver Detalles', onPress: () => navigation.navigate('ProductDetail', { product }) }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* Navbar */}
      <Navbar navigation={navigation} currentUser={currentUser} onLogout={() => setCurrentUser(null)} />

      {/* Contenido principal */}
      <ScrollView
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Carousel */}
        <SimpleCarousel
          showFunFact={showFunFact}
          showRandomOffer={showRandomOffer}
          showRandomStyleTip={showRandomStyleTip}
        />

        {/* Banner promocional */}
        <View style={styles.promoBanner}>
          <View style={styles.promoItem}>
            <Ionicons name="car-outline" size={20} color="#fff" />
            <Text style={styles.promoText}>Envío gratis +$100</Text>
          </View>
          <View style={styles.promoItem}>
            <Ionicons name="refresh-outline" size={20} color="#fff" />
            <Text style={styles.promoText}>Devoluciones gratis</Text>
          </View>
          <View style={styles.promoItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
            <Text style={styles.promoText}>Pagos seguros</Text>
          </View>
        </View>

        {/* Productos Destacados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productos Destacados</Text>
          <Text style={styles.sectionSubtitle}>Descubre nuestra selección premium de calzado exclusivo</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {productos.map((producto) => (
              <ProductCard
                key={producto.id}
                imgSrc={producto.imgSrc}
                title={producto.title}
                description={producto.description}
                price={producto.price}
                onPress={() => handleProductPress(producto)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Banner de oferta especial CON DATOS REALES DE LA API */}
        {loading ? (
          <View style={styles.offerBanner}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.offerLoadingText}>Cargando ofertas especiales...</Text>
          </View>
        ) : ofertaActiva ? (
          <View style={styles.offerBanner}>
            <Text style={styles.offerTitle}>{ofertaActiva.titulo}</Text>
            <Text style={styles.offerDescription}>
              {ofertaActiva.descripcion || "Oferta exclusiva por tiempo limitado"}
            </Text>

            <View style={styles.countdownContainer}>
              <View style={styles.countdownItem}>
                <Text style={styles.countdownNumber}>{countdown.days}</Text>
                <Text style={styles.countdownLabel}>Días</Text>
              </View>
              <View style={styles.countdownItem}>
                <Text style={styles.countdownNumber}>{countdown.hours}</Text>
                <Text style={styles.countdownLabel}>Horas</Text>
              </View>
              <View style={styles.countdownItem}>
                <Text style={styles.countdownNumber}>{countdown.minutes}</Text>
                <Text style={styles.countdownLabel}>Min</Text>
              </View>
              <View style={styles.countdownItem}>
                <Text style={styles.countdownNumber}>{countdown.seconds}</Text>
                <Text style={styles.countdownLabel}>Seg</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.offerButton}
              onPress={() => navigation.navigate('Products')}
            >
              <Text style={styles.offerButtonText}>
                {ofertaActiva.porcentaje_descuento ?
                  `-${ofertaActiva.porcentaje_descuento}% DESCUENTO – ${ofertaActiva.texto_boton}` :
                  ofertaActiva.texto_boton}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.offerBanner}>
            <Text style={styles.offerTitle}>Sin ofertas activas actualmente</Text>
            <Text style={styles.offerDescription}>¡No te pierdas nuestras próximas promociones!</Text>
            <TouchableOpacity
              style={[styles.offerButton, { backgroundColor: '#fff' }]}
              onPress={() => navigation.navigate('Products')}
            >
              <Text style={[styles.offerButtonText, { color: '#333' }]}>Ver Productos</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Categorías */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nuestras Categorías</Text>

          {categorias.map((categoria) => (
            <TouchableOpacity
              key={categoria.id}
              style={styles.categoryCard}
              onPress={() => navigation.navigate('Products')}
            >
              <Image source={categoria.imgSrc} style={styles.categoryImage} resizeMode="contain" />
              <Text style={styles.categoryTitle}>{categoria.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <Footer navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
  },
  carousel: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.7,
  },
  carouselContent: {
    zIndex: 1,
    alignItems: 'center',
  },
  carouselTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  carouselSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  carouselButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#fff',
  },
  carouselButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  indicators: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    zIndex: 2,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#fff',
  },
  promoBanner: {
    backgroundColor: '#000',
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  promoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  promoText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  productCard: {
    width: 250,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  productInfo: {
    padding: 15,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3085d6',
  },
  offerBanner: {
    backgroundColor: '#333',
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  offerDescription: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  offerLoadingText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 16,
  },
  countdownContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
  },
  countdownItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    minWidth: 60,
  },
  countdownNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  countdownLabel: {
    fontSize: 12,
    color: '#fff',
    textTransform: 'uppercase',
    marginTop: 5,
  },
  offerButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  offerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default Home;