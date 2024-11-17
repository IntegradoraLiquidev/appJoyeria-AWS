import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, Dimensions, FlatList, Text, Animated } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';

import ClienteCard from '../components/ClienteCard';
import { Ionicons } from '@expo/vector-icons';

const WorkerDashboard = ({ navigation }) => {
    const [clientes, setClientes] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused();

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'pagosHoy', title: 'Con Pago Hoy' },
        { key: 'sinPagosHoy', title: 'Sin Pago Hoy' },
    ]);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const response = await axios.get('http://192.168.1.65:3000/api/clientes', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const clientesPendientes = response.data
                    .filter(cliente => cliente.monto_actual > 0)
                    .sort((a, b) => new Date(a.fecha_proximo_pago) - new Date(b.fecha_proximo_pago));

                setClientes(clientesPendientes);
                setFilteredClientes(clientesPendientes);
                setLoading(false);

                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            } catch (error) {
                console.error(error);
            }
        };

        if (isFocused) {
            setLoading(true);
            fetchClientes();
        }
    }, [isFocused, fadeAnim]);



    useEffect(() => {
        const filtered = clientes.filter(cliente =>
            cliente.nombre.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredClientes(filtered);
    }, [searchText, clientes]);

    const handleLogout = async () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => {
            AsyncStorage.removeItem('token');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        });
    };

    const today = new Date().toLocaleDateString('es-ES');

    const clientesConPagoHoy = filteredClientes.filter(cliente => {
        const proximoPago = new Date(cliente.fecha_proximo_pago).toLocaleDateString('es-ES');
        return proximoPago === today || new Date(cliente.fecha_proximo_pago) < new Date();
    });

    const clientesSinPagoHoy = filteredClientes.filter(cliente => {
        const proximoPago = new Date(cliente.fecha_proximo_pago).toLocaleDateString('es-ES');
        return proximoPago !== today && new Date(cliente.fecha_proximo_pago) >= new Date();
    });

    const renderClienteList = clientes => (
        <FlatList
            data={clientes}
            keyExtractor={item => item.id_cliente.toString()}
            renderItem={({ item }) => (
                <ClienteCard
                    cliente={item}
                    onPress={() =>
                        navigation.navigate('Detalles del cliente', { id: item.id_cliente })
                    }
                />
            )}
            ListEmptyComponent={
                <Text style={styles.emptyMessage}>No hay clientes disponibles.</Text>
            }
            contentContainerStyle={styles.listContent}
        />
    );

    const renderScene = SceneMap({
        pagosHoy: () => renderClienteList(clientesConPagoHoy),
        sinPagosHoy: () => renderClienteList(clientesSinPagoHoy),
    });

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.title}>Clientes</Text>
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <Ionicons
                        name="exit-outline"
                        size={32}
                        color="#ff6347"
                        onPress={handleLogout}
                        style={styles.logoutIcon}
                    />
                </Animated.View>
            </View>
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar cliente"
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#d1a980"
            />
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: Dimensions.get('window').width }}
                renderTabBar={props => (
                    <TabBar
                        {...props}
                        indicatorStyle={styles.tabIndicator}
                        style={styles.tabBar}
                        labelStyle={styles.tabLabel}
                    />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 2, backgroundColor: '#121212' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginVertical: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f5c469',
        letterSpacing: 0.8,
    },
    logoutIcon: {
        padding: 5,
        borderRadius: 12,
        backgroundColor: '#282828',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 7,
    },
    searchInput: {
        height: 45,
        margin: 15,
        borderColor: '#707070',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        color: '#d1a980',
        backgroundColor: '#1e1e1e',
        fontSize: 16,
    },
    listContent: { paddingBottom: 20 },
    tabBar: { backgroundColor: '#1c1c1e' },
    tabIndicator: { backgroundColor: '#FFD700' },
    tabLabel: { color: '#fff', fontWeight: 'bold' },
    emptyMessage: {
        textAlign: 'center',
        color: '#fff',
        marginTop: 20,
        fontSize: 16,
    },
});

export default WorkerDashboard;
