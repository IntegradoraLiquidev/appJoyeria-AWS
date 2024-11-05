import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, FlatList, StyleSheet, TextInput, Text, TouchableOpacity, Animated } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import ClienteCard from '../components/ClienteCard';
import { Ionicons } from '@expo/vector-icons';

const WorkerDashboard = ({ navigation }) => {
    const [clientes, setClientes] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const isFocused = useIsFocused();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const response = await axios.get('http://192.168.1.21:3000/api/clientes', {
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

        Animated.timing(rotateAnim, {
            toValue: isAccordionOpen ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const rotateIcon = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const today = new Date().toLocaleDateString('es-ES');

    const clientesConPagoHoy = filteredClientes.filter((cliente) => {
        const proximoPago = new Date(cliente.fecha_proximo_pago).toLocaleDateString('es-ES');
        return proximoPago === today || new Date(cliente.fecha_proximo_pago) < new Date();
    });

    const clientesSinPagoHoy = filteredClientes.filter((cliente) => {
        const proximoPago = new Date(cliente.fecha_proximo_pago).toLocaleDateString('es-ES');
        return proximoPago !== today && new Date(cliente.fecha_proximo_pago) >= new Date();
    });

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
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

            <Animated.View style={[styles.searchInputContainer, { transform: [{ scale: fadeAnim }] }]}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar cliente"
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholderTextColor="#d1a980"
                />
            </Animated.View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {clientesConPagoHoy.length === 0 ? (
                    <Text style={styles.emptyMessage}>No hay clientes con pago hoy</Text>
                ) : (
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <FlatList
                            data={clientesConPagoHoy}
                            keyExtractor={(item) => item.id_cliente?.toString()}
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
            </ScrollView>

            <TouchableOpacity style={styles.accordionHeader} onPress={toggleAccordion}>
                <Text style={styles.accordionTitle}>Clientes sin pago hoy</Text>
                <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
                    <Ionicons name="chevron-down" size={18} color="#fff" />
                </Animated.View>
            </TouchableOpacity>

            {isAccordionOpen && (
                clientesSinPagoHoy.length === 0 ? (
                    <Text style={styles.emptyMessage}>No hay clientes sin pago hoy</Text>
                ) : (
                    <FlatList
                        style={styles.accordionContent}
                        data={clientesSinPagoHoy}
                        keyExtractor={(item) => item.id_cliente?.toString()}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f5c469',
        letterSpacing: 0.8,
    },
    logoutIcon: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#282828',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 7,
    },
    searchInputContainer: {
        marginBottom: 20,
    },
    searchInput: {
        height: 45,
        borderColor: '#707070',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        color: '#d1a980',
        backgroundColor: '#1e1e1e',
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
        elevation: 3,
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
    accordionContent: {
        backgroundColor: '#2e2e2e',
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginTop: 20,
        backgroundColor: '#484848',
    },
    accordionTitle: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default WorkerDashboard;
