import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import ClienteCard from '../components/ClienteCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditarClientes from '../components/EditarClientes'; // Importa el componente EditarClientes

const TrabajadorClientes = ({ route }) => {
    const { id, clienteActualizado, isFromEdit } = route.params || {};
    const [clientes, setClientes] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const decodeToken = (token) => {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    };

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const token = await AsyncStorage.getItem('token');

                if (!token) {
                    throw new Error('No se encontró el token');
                }

                const decodedToken = decodeToken(token);
                setIsAdmin(decodedToken.role === 'admin');

                const response = await axios.get(`http://192.168.1.13:3000/trabajadores/${id}/clientes`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setClientes(response.data);
                setFilteredClientes(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchClientes();
    }, [id]);

    useEffect(() => {
        if (isFromEdit && clienteActualizado) {
            const updatedClientes = clientes.map((cliente) =>
                cliente.id === clienteActualizado.id ? clienteActualizado : cliente
            );
            setClientes(updatedClientes);
            setFilteredClientes(updatedClientes);
        }
    }, [clienteActualizado, isFromEdit]);

    const handleSearch = (text) => {
        setSearchText(text);
        if (text === '') {
            setFilteredClientes(clientes);
        } else {
            const filtered = clientes.filter(cliente =>
                cliente.nombre.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredClientes(filtered);
        }
    };

    const handleEdit = (cliente) => {
        setClienteSeleccionado(cliente);
        setModalVisible(true);
    };

    const handleGuardar = (clienteActualizado) => {
        const updatedClientes = clientes.map((cliente) =>
            cliente.id === clienteActualizado.id ? clienteActualizado : cliente
        );
        setClientes(updatedClientes);
        setFilteredClientes(updatedClientes);
        setModalVisible(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Lista de clientes</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre"
                value={searchText}
                onChangeText={handleSearch}
            />
            <FlatList
                data={filteredClientes}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <ClienteCard 
                        cliente={item} 
                        onPress={() => navigation.navigate('ClienteDetails', { id: item.id })} 
                        isAdmin={isAdmin} 
                        onEdit={() => handleEdit(item)}
                    />
                )}
            />
            {clienteSeleccionado && (
                <EditarClientes
                    cliente={clienteSeleccionado}
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onGuardar={handleGuardar}
                />
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    searchInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
});

export default TrabajadorClientes;
