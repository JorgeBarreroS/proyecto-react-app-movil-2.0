import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importación del AuthProvider
import { AuthProvider } from './src/services/AuthContext';

// Importación de pantallas
import InicioScreen from './src/screens/InicioScreen';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import Home from './src/screens/Home';
import ProductsPage from './src/screens/Productos';
import VisualizarProducto from './src/screens/VisualizarProducto';
import CartPage from './src/screens/CartPage';
import SearchBar from './src/screens/Buscador';

const Stack = createStackNavigator();

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Inicio"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Inicio" component={InicioScreen} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Products" component={ProductsPage} />
          <Stack.Screen name="VisualizarProducto" component={VisualizarProducto} />
          <Stack.Screen name="CartPage" component={CartPage} />
          <Stack.Screen name="SearchBar" component={SearchBar} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;