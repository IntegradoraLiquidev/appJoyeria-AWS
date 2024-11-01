import React, { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import WorkerDashboard from './screens/WorkerDashboard';
import NuevoCliente from './screens/NuevoCliente';
import ClienteDetails from './screens/ClienteDetails';
import EstadisticasScreen from './screens/Estadisticas';
import AdminDashboard from './screens/AdminDashboard';
import TrabajadoresDetails from './screens/TrabajadorClientes';
import NuevoTrabajador from './screens/NuevoTrabajador';
import EditarTrabajador from './components/EditarTrabajador';
import EliminarTrabajador from './components/EliminarTrabajador';
import EditarClientes from './components/EditarClientes';
import EstadisticasGraficas from './components/EstadisticasGraficas';
import EstadisticasTablas from './components/EstadisticasTablas';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, color, size, animatedValue }) {
    const scale = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.5],
    });

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name={name} size={size} color={color} />
        </Animated.View>
    );
}

function WorkerTabs() {
    const animatedValues = useRef({
        Inicio: new Animated.Value(0),
        'Agregar Cliente': new Animated.Value(0),
    }).current;

    const handleTabPress = (routeName) => {
        Object.keys(animatedValues).forEach((key) => {
            Animated.timing(animatedValues[key], {
                toValue: routeName === key ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        });
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Inicio') {
                        iconName = 'home';
                    } else if (route.name === 'Agregar Cliente') {
                        iconName = 'add-circle';
                    }
                    return <TabIcon name={iconName} color={color} size={size} animatedValue={animatedValues[route.name]} />;
                },
                tabBarActiveTintColor: '#FFD700', // Color dorado
                tabBarInactiveTintColor: '#B0C4DE', // Color de texto inactivo
                tabBarStyle: styles.tabBar,
                tabBarButton: (props) => (
                    <TouchableOpacity
                        {...props}
                        onPress={() => {
                            handleTabPress(route.name);
                            props.onPress();
                        }}
                        style={styles.tabButton} // Estilo para el botón de la pestaña
                    />
                ),
            })}>
            <Tab.Screen name="Inicio" component={WorkerDashboard} />
            <Tab.Screen name="Agregar Cliente" component={NuevoCliente} />
        </Tab.Navigator>
    );
}

function AdminTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Inicio') {
                        iconName = 'home';
                    } else if (route.name === 'Agregar Trabajador') {
                        iconName = 'add-circle';
                    } else if (route.name === 'Estadisticas') {
                        iconName = 'stats-chart';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#FFD700', // Color dorado
                tabBarInactiveTintColor: '#B0C4DE', // Color de texto inactivo
                tabBarStyle: styles.tabBar,
            })}>
            <Tab.Screen name="Inicio" component={AdminDashboard} />
            <Tab.Screen name="Agregar Trabajador" component={NuevoTrabajador} />
            <Tab.Screen name="Estadisticas" component={EstadisticasScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#1c1c1e',
        height: 60,
        borderTopWidth: 0, // Eliminar el borde superior
        elevation: 5, // Sombra
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
    },
});

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="AdminDashboard"
                    component={AdminTabs}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="WorkerDashboard"
                    component={WorkerTabs}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Detalles del cliente"
                    component={ClienteDetails}
                    options={{ headerShown: true }}
                />
                <Stack.Screen
                    name="TrabajadorClientes"
                    component={TrabajadoresDetails}
                    options={{ headerShown: true }}
                />
                <Stack.Screen
                    name="EditarTrabajador"
                    component={EditarTrabajador}
                    options={{ headerShown: true }}
                />
                <Stack.Screen
                    name="EliminarTrabajador"
                    component={EliminarTrabajador}
                    options={{ headerShown: true }}
                />
                <Stack.Screen
                    name="EditarClientes"
                    component={EditarClientes}
                    options={{ headerShown: true }}
                />
                <Stack.Screen name="EstadisticasTablas" component={EstadisticasTablas} options={{ title: 'Estadísticas en Tablas' }} />
                <Stack.Screen name="EstadisticasGraficas" component={EstadisticasGraficas} options={{ title: 'Estadísticas en Gráficas' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
