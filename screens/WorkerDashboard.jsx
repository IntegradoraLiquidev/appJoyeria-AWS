import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, TextInput, Text, TouchableOpacity, Animated } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import ClienteCard from '../components/ClienteCard';
import { Ionicons } from '@expo/vector-icons';

const PlaceholderCard = () => (
    <View style={styles.placeholderCard}>
        <View style={styles.placeholderImage} />
        <View style={styles.placeholderTextContainer}>
            <View style={styles.placeholderText} />
            <View style={[styles.placeholderText, { width: '100%' }]} />
        </View>
    </View>
);

const WorkerDashboard = ({ navigation }) => {
    const [clientes, setClientes] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [loading, setLoading] = useState(true); // Estado para la carga de datos
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const isFocused = useIsFocused();
    
    // Animated values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const response = await axios.get('http://192.168.1.10:3000/api/clientes', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const clientesPendientes = response.data.filter(
                    (cliente) => cliente.monto_actual > 0
                );

                setClientes(clientesPendientes);
                setFilteredClientes(clientesPendientes);
                setLoading(false); // Finaliza la carga de datos
                
                // Fade in the list of clients
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
            setLoading(true); // Activa el estado de carga
            fetchClientes();
        }
    }, [isFocused, fadeAnim]);

    useEffect(() => {
        const filtered = clientes.filter((cliente) =>
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

    const toggleAccordion = () => {
        setIsAccordionOpen(!isAccordionOpen);

        // Rotate the icon
        Animated.timing(rotateAnim, {
            toValue: isAccordionOpen ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const today = new Date().toLocaleDateString('es-ES');
    const clientesConPagoHoy = filteredClientes.filter(
        (cliente) =>
            cliente.fecha_proximo_pago &&
            new Date(cliente.fecha_proximo_pago).toLocaleDateString('es-ES') === today
    );
    const clientesSinPagoHoy = filteredClientes.filter(
        (cliente) =>
            !cliente.fecha_proximo_pago ||
            new Date(cliente.fecha_proximo_pago).toLocaleDateString('es-ES') !== today
    );

    // Rotation interpolation
    const rotateIcon = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Clientes</Text>
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <Ionicons
                        name={'exit-outline'}
                        size={32}
                        color={'#ff6347'}
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

            {loading ? (
                // Mostrar placeholders mientras se cargan los datos
                <FlatList
                    data={[1, 2, 3, 4, 5]} // Datos ficticios para mostrar las tarjetas de plantilla
                    keyExtractor={(item) => item.toString()}
                    renderItem={() => <PlaceholderCard />}
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <>
                    {/* Clientes con pago hoy */}
                    {clientesConPagoHoy.length === 0 ? (
                        <Text style={styles.emptyMessage}>No hay clientes con pago hoy</Text>
                    ) : (
                        <Animated.View style={{ opacity: fadeAnim }}>
                            <FlatList
                                data={clientesConPagoHoy}
                                keyExtractor={(item) =>
                                    item.id_cliente ? item.id_cliente.toString() : Math.random().toString()
                                }
                                renderItem={({ item }) => (
                                    <ClienteCard
                                        cliente={item}
                                        onPress={() =>
                                            navigation.navigate('Detalles del cliente', { id: item.id_cliente })
                                        }
                                    />
                                )}
                                contentContainerStyle={styles.listContent}
                            />
                        </Animated.View>
                    )}

                    {/* Acordeón para clientes sin pago hoy */}
                    <TouchableOpacity
                        style={styles.accordionHeader}
                        onPress={toggleAccordion}
                    >
                        <Text style={styles.accordionTitle}>Clientes sin pago hoy</Text>
                        <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
                            <Ionicons
                                name={'chevron-down'}
                                size={18}
                                color="#fff"
                            />
                        </Animated.View>
                    </TouchableOpacity>

                    {isAccordionOpen && (
                        clientesSinPagoHoy.length === 0 ? (
                            <Text style={styles.emptyMessage}>No hay clientes sin pago hoy</Text>
                        ) : (
                            <FlatList
                                data={clientesSinPagoHoy}
                                keyExtractor={(item) =>
                                    item.id_cliente ? item.id_cliente.toString() : Math.random().toString()
                                }
                                renderItem={({ item }) => (
                                    <ClienteCard
                                        cliente={item}
                                        onPress={() =>
                                            navigation.navigate('Detalles del cliente', { id: item.id_cliente })
                                        }
                                    />
                                )}
                                contentContainerStyle={styles.listContent}
                            />
                        )
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f0f',
        padding: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#f5c469',
        letterSpacing: 0.5,
    },
    logoutIcon: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#1c1c1e',
    },
    searchInput: {
        height: 45,
        borderColor: '#707070',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        color: '#d1a980',
        backgroundColor: '#1c1c1e',
        marginBottom: 15,
        fontSize: 16,
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#d1a980',
        fontSize: 16,
        marginVertical: 20,
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginTop: 15,
        backgroundColor: '#3a3a3c',
    },
    accordionTitle: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    placeholderCard: {
        height: 80,
        backgroundColor: '#1c1c1e',
        borderRadius: 8,
        marginBottom: 15,
        flexDirection: 'row',
        padding: 10,
    },
    placeholderImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#2a2a2a',
    },
    placeholderTextContainer: {
        marginLeft: 10,
        justifyContent: 'center',
        flex: 1,
    },
    placeholderText: {
        height: 20,
        backgroundColor: '#2a2a2a',
        borderRadius: 4,
        marginBottom: 5,
    },
});

export default WorkerDashboard;
