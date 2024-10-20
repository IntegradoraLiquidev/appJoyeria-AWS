import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TextInput, Text } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import ClienteCard from '../components/ClienteCard';
import { Ionicons } from '@expo/vector-icons';

const WorkerDashboard = ({ navigation }) => {
    const [clientes, setClientes] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredClientes, setFilteredClientes] = useState([]);
    const isFocused = useIsFocused();

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }

                const response = await axios.get('https://prestamos-back-production.up.railway.app/clientes', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const uniqueClientes = response.data.filter((cliente, index, self) =>
                    index === self.findIndex((c) => (
                        c.id === cliente.id
                    ))
                );

                setClientes(uniqueClientes);
                setFilteredClientes(uniqueClientes);
            } catch (error) {
                console.error(error);
            }
        };

        if (isFocused) {
            fetchClientes();
        }
    }, [isFocused]);

    useEffect(() => {
        const filtered = clientes.filter(cliente =>
            (cliente.estado !== 'completado' || cliente.monto_actual === 0) &&
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

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Lista de clientes</Text>
                <Ionicons name={'exit'} size={40} color={"#ecdda2"} onPress={handleLogout} />
            </View>
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar cliente por nombre"
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#d1a980"
            />
            <FlatList
                data={filteredClientes}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <ClienteCard
                        cliente={{
                            ...item,
                            total_multas: item.total_multas !== undefined ? item.total_multas : 0
                        }}
                        onPress={() => navigation.navigate('ClienteDetails', { id: item.id })}
                    />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Fondo negro
        padding: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#c9b977', // Texto dorado
        marginBottom: 10,
    },
    searchInput: {
        height: 40,
        borderColor: '#ecdda2', // Verde oliva
        borderWidth: 1,
        paddingHorizontal: 8,
        borderRadius: 4,
        color: '#d1a980', // Texto dorado
        marginBottom: 10,
        backgroundColor: '#1c1c1e', // Fondo más oscuro
    },
});

export default WorkerDashboard;