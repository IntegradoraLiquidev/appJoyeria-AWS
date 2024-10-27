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

                const response = await axios.get('http://192.168.1.10:3000/api/clientes', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log(response.data); // Verificar la estructura de los datos

                setClientes(response.data);
                setFilteredClientes(response.data);
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
                keyExtractor={item => item.id_cliente ? item.id_cliente.toString() : Math.random().toString()}
                renderItem={({ item }) => (
                    <ClienteCard
                        cliente={item}
                        onPress={() => navigation.navigate('Detalles del cliente', { id: item.id_cliente })}
                    />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
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
        color: '#c9b977',
        marginBottom: 10,
    },
    searchInput: {
        height: 40,
        borderColor: '#ecdda2',
        borderWidth: 1,
        paddingHorizontal: 8,
        borderRadius: 4,
        color: '#d1a980',
        marginBottom: 10,
        backgroundColor: '#1c1c1e',
    },
});

export default WorkerDashboard;
