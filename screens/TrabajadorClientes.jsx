import React, { useEffect, useState, useRef } from 'react';
import { View, FlatList, StyleSheet, Animated, TextInput, Text, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import ClienteCard from '../components/ClienteCard';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const TrabajadorClientes = ({ route }) => {
    const { id } = route.params;
    const [clientes, setClientes] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);

    const navigation = useNavigation();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const fetchClientes = async () => {
        try {
            const response = await axios.get(`http://192.168.1.65:3000/api/clientes/clientes/${id}`);
            const clientesPendientes = response.data
                .filter(cliente => cliente.monto_actual > 0)
                .sort((a, b) => new Date(a.fecha_proximo_pago) - new Date(b.fecha_proximo_pago));

            setClientes(clientesPendientes);
            setFilteredClientes(clientesPendientes);

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        } catch (error) {
            console.error('Error al obtener los clientes:', error);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, [id]);

    useEffect(() => {
        const filtered = clientes.filter((cliente) =>
            cliente.nombre.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredClientes(filtered);
    }, [searchText, clientes]);

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

    const handleEdit = (cliente) => {
        navigation.navigate('EditarClientes', { cliente, refreshClientes: fetchClientes });
    };


    const handleDelete = async (clienteId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const response = await axios.delete(`http://192.168.1.65:3000/api/clientes/${clienteId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    setClientes((prevClientes) => prevClientes.filter((cliente) => cliente.id_cliente !== clienteId));
                    alert('Cliente eliminado correctamente');
                } else {
                    alert('Error al eliminar el cliente');
                }
            }
        } catch (error) {
            console.error('Error al eliminar el cliente:', error);
            alert('Error al eliminar el cliente');
        }
    };

    const handleExport = (cliente) => {
        console.log(`Exportando datos de cliente: ${cliente.nombre}`);
        // Implementar la lógica para exportar los datos del cliente
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.searchInputContainer, { opacity: fadeAnim }]}>
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
                    <FlatList
                        data={clientesConPagoHoy}
                        keyExtractor={(item) => item.id_cliente.toString()}
                        renderItem={({ item }) => (
                            <ClienteCard
                                cliente={item}
                                onPress={() =>
                                    navigation.navigate('Detalles del cliente', { id: item.id_cliente })
                                }
                                isAdmin={true}
                                onEdit={() => handleEdit(item)}
                                onDelete={handleDelete}
                                onExport={(cliente) => console.log(`Exportando cliente: ${cliente.nombre}`)}
                            />
                        )}
                        contentContainerStyle={styles.listContent}
                    />
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
                        keyExtractor={(item) => item.id_cliente.toString()}
                        renderItem={({ item }) => (
                            <ClienteCard
                                cliente={item}
                                onPress={() =>
                                    navigation.navigate('Detalles del cliente', { id: item.id_cliente })
                                }
                                isAdmin={true}
                                onEdit={() => handleEdit(item)}
                                onDelete={handleDelete}
                                onExport={() => handleExport(item)}
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
    container: { flex: 1, padding: 20, backgroundColor: '#121212' },
    scrollContent: { paddingBottom: 20 },
    searchInputContainer: { marginBottom: 20 },
    searchInput: {
        height: 45,
        borderColor: '#707070',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        color: '#d1a980',
        backgroundColor: '#1e1e1e',
        fontSize: 16,
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#d1a980',
        fontSize: 16,
        marginVertical: 20,
    },
    listContent: { paddingBottom: 20 },
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
    accordionTitle: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
    accordionContent: {
        backgroundColor: '#2e2e2e',
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
    },
});

export default TrabajadorClientes;
