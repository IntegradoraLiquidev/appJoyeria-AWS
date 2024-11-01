import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TextInput, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import ClienteCard from '../components/ClienteCard';
import { Ionicons } from '@expo/vector-icons';

const WorkerDashboard = ({ navigation }) => {
    const [clientes, setClientes] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const isFocused = useIsFocused();

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }
                const response = await axios.get('http://192.168.1.10:3000/api/clientes', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const clientesPendientes = response.data.filter(
                    (cliente) => cliente.monto_actual > 0
                );

                setClientes(clientesPendientes);
                setFilteredClientes(clientesPendientes);
            } catch (error) {
                console.error(error);
            }
        };

        if (isFocused) {
            fetchClientes();
        }
    }, [isFocused]);

    useEffect(() => {
        const filtered = clientes.filter((cliente) =>
            cliente.nombre.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredClientes(filtered);
    }, [searchText, clientes]);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
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

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Clientes</Text>
                <Ionicons
                    name={'exit-outline'}
                    size={32}
                    color={'#ff6347'}
                    onPress={handleLogout}
                    style={styles.logoutIcon}
                />
            </View>

            <TextInput
                style={styles.searchInput}
                placeholder="Buscar cliente"
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#d1a980"
            />

            {/* Clientes con pago hoy */}
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

            {/* Acordeón para clientes sin pago hoy */}
            <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setIsAccordionOpen(!isAccordionOpen)}
            >
                <Text style={styles.accordionTitle}>Clientes sin pago hoy</Text>
                <Ionicons
                    name={isAccordionOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#fff"
                />
            </TouchableOpacity>

            {isAccordionOpen && (
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
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginTop: 15,
    },
    accordionTitle: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default WorkerDashboard;
