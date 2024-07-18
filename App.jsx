import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
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

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function WorkerTabs() {
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
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#2e5c74',
                tabBarInactiveTintColor: '#ccc',
                tabBarStyle: {
                    backgroundColor: '#1c1c1e',
                },
            })}
        >
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
                tabBarActiveTintColor: '#2e5c74',
                tabBarInactiveTintColor: '#ccc',
                tabBarStyle: {
                    backgroundColor: '#1c1c1e',
                },
            })}
        >
            <Tab.Screen name="Inicio" component={AdminDashboard} />
            <Tab.Screen name="Agregar Trabajador" component={NuevoTrabajador} />
            <Tab.Screen name="Estadisticas" component={EstadisticasScreen} />
        </Tab.Navigator>
    );
}

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
                    name="ClienteDetails" 
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
            </Stack.Navigator>
        </NavigationContainer>
    );
}
