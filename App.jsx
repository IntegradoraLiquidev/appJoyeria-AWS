import React, { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Animated, TouchableOpacity, StyleSheet, Text } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import WorkerDashboard from './screens/WorkerDashboard';
import NuevoCliente from './screens/NuevoCliente';
import ClienteDetails from './screens/ClienteDetails';
import EstadisticasScreen from './screens/Estadisticas';
import AdminDashboard from './screens/AdminDashboard';
import TrabajadoresDetails from './screens/TrabajadorClientes';
import NuevoTrabajador from './screens/NuevoTrabajador';
import EliminarTrabajador from './components/EliminarTrabajador';
import EditarTrabajador from './components/EditarTrabajador';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, color, size, animatedValue }) {
    const scale = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.3],
    });

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name={name} size={size} color={color} />
        </Animated.View>
    );
}

function WorkerTabs() {
    const animatedValues = useRef({
        Home: new Animated.Value(0),
        'Add Client': new Animated.Value(0),
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
                    if (route.name === 'Home') {
                        iconName = 'home';
                    } else if (route.name === 'Add Client') {
                        iconName = 'person-add';
                    }
                    return <TabIcon name={iconName} color={color} size={size} animatedValue={animatedValues[route.name]} />;
                },
                tabBarLabel: ({ focused, color }) => (
                    <Text style={{ color, fontSize: focused ? 12 : 10 }}>
                        {route.name === 'Home' ? 'Inicio' : 'Nuevo Cliente'}
                    </Text>
                ),
                tabBarActiveTintColor: '#FFD700',
                tabBarInactiveTintColor: '#B0C4DE',
                tabBarStyle: styles.tabBar,
                tabBarButton: (props) => (
                    <TouchableOpacity
                        {...props}
                        onPress={() => {
                            handleTabPress(route.name);
                            props.onPress();
                        }}
                        style={styles.tabButton}
                    />
                ),
            })}
        >
            <Tab.Screen name="Home" component={WorkerDashboard} options={{ headerShown: false }} />
            <Tab.Screen name="Add Client" component={NuevoCliente} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
}

function AdminTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = 'home';
                    } else if (route.name === 'Add Worker') {
                        iconName = 'person-add';
                    } else if (route.name === 'Statistics') {
                        iconName = 'bar-chart';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarLabel: ({ focused, color }) => (
                    <Text style={{ color, fontSize: focused ? 12 : 10 }}>
                        {route.name === 'Home' ? 'Inicio' : route.name === 'Add Worker' ? 'Nuevo Trabajador' : 'Estadísticas'}
                    </Text>
                ),
                tabBarActiveTintColor: '#FFD700',
                tabBarInactiveTintColor: '#B0C4DE',
                tabBarStyle: styles.tabBar,
            })}
        >
            <Tab.Screen name="Home" component={AdminDashboard} options={{ headerShown: false }} />
            <Tab.Screen name="Add Worker" component={NuevoTrabajador} options={{ headerShown: false }} />
            <Tab.Screen name="Statistics" component={EstadisticasScreen} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#1c1c1e',
        height: 65,
        paddingTop: 5,
        borderTopWidth: 0,
        elevation: 5,
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
    },
});

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="AdminDashboard" component={AdminTabs} options={{ headerShown: false }} />
                <Stack.Screen name="WorkerDashboard" component={WorkerTabs} options={{ headerShown: false }} />
                <Stack.Screen name="Detalles del cliente" component={ClienteDetails} options={{
                    headerStyle: { backgroundColor: '#0d0d0d' },
                    headerTintColor: '#fff',
                }} />
                <Stack.Screen name="TrabajadorClientes" component={TrabajadoresDetails} options={{ headerShown: true }} />
                <Stack.Screen name="EstadisticasTablas" component={EstadisticasScreen} options={{ title: 'Estadísticas' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
