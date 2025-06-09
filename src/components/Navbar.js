import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions, SafeAreaView, StatusBar, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Navbar = ({ navigation, currentUser = null, onLogout }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [cartCount] = useState(3);
  const slideAnim = useState(new Animated.Value(width * 0.7))[0];

  const handleNavigation = (screenName) => {
    closeMenu();
    navigation.navigate(screenName);
  };

  const handleLogout = () => {
    closeMenu();
    if (onLogout) onLogout();
    navigation.navigate('Login');
  };

  const openMenu = () => {
    setMenuVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  };

  const closeMenu = () => {
    Animated.spring(slideAnim, {
      toValue: width * 0.7,
      useNativeDriver: true,
      bounciness: 0,
    }).start(() => setMenuVisible(false));
  };

  const menuItems = [
    { screen: 'Home', icon: 'home-outline', label: 'Inicio' },
    { screen: 'SearchBar', icon: 'search-outline', label: 'Buscar' }, // Nueva opción de búsqueda en el menú
    { screen: 'Products', icon: 'shirt-outline', label: 'Productos' },
    { screen: 'Orders', icon: 'receipt-outline', label: 'Mis Pedidos' },
    { screen: 'Profile', icon: 'settings-outline', label: 'Mi Perfil' },
  ];

  return (
    <>
      <StatusBar backgroundColor="#000000" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => handleNavigation('Home')} style={styles.brandContainer}>
            <Text style={styles.brandText}>CORPFRESH</Text>
          </TouchableOpacity>

          <View style={styles.iconsContainer}>
            {/* Botón de búsqueda */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleNavigation('SearchBar')}
            >
              <Ionicons name="search-outline" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Botón del carrito */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleNavigation('CartPage')}
            >
              <Ionicons name="cart-outline" size={24} color="#fff" />
              {currentUser && cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Botón de usuario */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={openMenu}
            >
              <Ionicons name={currentUser ? "person" : "person-outline"} size={24} color="#fff" />
              {currentUser && <View style={styles.activeDot} />}
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={closeMenu}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={closeMenu}
          >
            <Animated.View
              style={[
                styles.menuContainer,
                { transform: [{ translateX: slideAnim }] }
              ]}
            >
              {currentUser ? (
                <>
                  <View style={styles.userInfo}>
                    <View style={styles.avatarContainer}>
                      <Ionicons name="person-circle" size={50} color="#3085d6" />
                    </View>
                    <Text style={styles.userName}>Bienvenido</Text>
                    <Text style={styles.userEmail}>{currentUser.email || ''}</Text>
                  </View>

                  {menuItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.menuItem}
                      onPress={() => handleNavigation(item.screen)}
                    >
                      <Ionicons name={item.icon} size={22} color="#3085d6" />
                      <Text style={styles.menuText}>{item.label}</Text>
                      <Ionicons
                        name="chevron-forward-outline"
                        size={18}
                        color="#aaa"
                        style={styles.menuArrow}
                      />
                    </TouchableOpacity>
                  ))}

                  <View style={styles.separator} />

                  <TouchableOpacity
                    style={[styles.menuItem, styles.logoutItem]}
                    onPress={handleLogout}
                  >
                    <Ionicons name="log-out-outline" size={22} color="#dc3545" />
                    <Text style={[styles.menuText, styles.logoutText]}>Cerrar Sesión</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.guestHeader}>
                    <Text style={styles.guestTitle}>Bienvenido invitado</Text>
                    <Text style={styles.guestSubtitle}>Inicia sesión para más opciones</Text>
                  </View>

                  {menuItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.menuItem}
                      onPress={() => handleNavigation(item.screen)}
                    >
                      <Ionicons name={item.icon} size={22} color="#3085d6" />
                      <Text style={styles.menuText}>{item.label}</Text>
                      <Ionicons
                        name="chevron-forward-outline"
                        size={18}
                        color="#aaa"
                        style={styles.menuArrow}
                      />
                    </TouchableOpacity>
                  ))}

                  <View style={styles.separator} />

                  <TouchableOpacity
                    style={[styles.menuItem, styles.loginItem]}
                    onPress={() => handleNavigation('Login')}
                  >
                    <Ionicons name="log-in-outline" size={22} color="#3085d6" />
                    <Text style={[styles.menuText, styles.loginText]}>Iniciar Sesión</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.menuItem, styles.registerItem]}
                    onPress={() => handleNavigation('Register')}
                  >
                    <Ionicons name="person-add-outline" size={22} color="#28a745" />
                    <Text style={[styles.menuText, styles.registerText]}>Registrarse</Text>
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </>
  );
};

// Los estilos se mantienen igual que en la versión anterior
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3085d6',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#000000',
    height: 60,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 20,
    padding: 5,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#dc3545',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#28a745',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: width * 0.7,
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: 20,
    elevation: 10,
  },
  userInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  avatarContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 30,
    padding: 5,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  guestHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  menuArrow: {
    marginLeft: 'auto',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
  },
  logoutItem: {
    backgroundColor: 'rgba(220, 53, 69, 0.05)',
  },
  loginItem: {
    backgroundColor: 'rgba(48, 133, 214, 0.05)',
  },
  registerItem: {
    backgroundColor: 'rgba(40, 167, 69, 0.05)',
  },
  logoutText: {
    color: '#dc3545',
    fontWeight: '600',
  },
  loginText: {
    color: '#3085d6',
    fontWeight: '600',
  },
  registerText: {
    color: '#28a745',
    fontWeight: '600',
  },
});

export default Navbar;