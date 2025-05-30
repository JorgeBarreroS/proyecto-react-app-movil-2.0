import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ImageBackground,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

const InicioScreen = ({ navigation }) => {
    return (
        <Animatable.View animation="pulse" iterationCount="infinite" duration={10000} style={{ flex: 1 }}>
            <ImageBackground source={require('../../assets/ROPA.jpg')} style={styles.background}>
                <SafeAreaView style={styles.container}>
                    <Animatable.View animation="fadeIn" duration={1500} style={styles.overlay}>
                        {/* Logo */}
                        <Animatable.Text animation="bounceInDown" duration={1500} style={styles.logo}>
                            Corpfresh
                        </Animatable.Text>

                        {/* Slogan */}
                        <Animatable.Text animation="fadeIn" delay={600} style={styles.slogan}>
                            Donde tu estilo cobra vida
                        </Animatable.Text>

                        {/* Botón con animación continua */}
                        <Animatable.View animation="fadeInUp" delay={1000}>
                            <Animatable.View animation="pulse" iterationCount="infinite" easing="ease-out" duration={2000}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => navigation.navigate('Login')}
                                >
                                    <Text style={styles.buttonText}>Iniciar sesión</Text>
                                </TouchableOpacity>
                            </Animatable.View>
                        </Animatable.View>
                    </Animatable.View>
                </SafeAreaView>
            </ImageBackground>
        </Animatable.View>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    logo: {
        fontSize: 44,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
        textShadowColor: '#000',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 8,
        textTransform: 'uppercase',
        letterSpacing: 4,
    },
    slogan: {
        fontSize: 18,
        color: '#ffffffcc',
        fontStyle: 'italic',
        marginBottom: 50,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#ff4e50',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 35,
        shadowColor: '#ff4e50',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});

export default InicioScreen;
