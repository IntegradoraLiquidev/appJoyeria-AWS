import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrabajadorCard from '../components/TrabajadorCard';

const AdminDashboard = ({ navigation }) => {
    const [trabajadores, setTrabajadores] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredTrabajadores, setFilteredTrabajadores] = useState([]);

    const fetchTrabajadores = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('Token no encontrado');
            }

            const response = await axios.get('http://192.168.1.74:3000/trabajadores', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTrabajadores(response.data);
            setFilteredTrabajadores(response.data);
        } catch (error) {
            console.error('Error al obtener trabajadores:', error);
        }
    };

    useEffect(() => {
        fetchTrabajadores();
        const interval = setInterval(fetchTrabajadores, 5000); // Polling cada 5 segundos
        return () => clearInterval(interval); // Limpiar el intervalo cuando el componente se desmonte
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const handleSearch = (text) => {
        setSearchText(text);
        if (text === '') {
            setFilteredTrabajadores(trabajadores);
        } else {
            const filtered = trabajadores.filter(trabajador =>
                trabajador.nombre.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredTrabajadores(filtered);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lista de trabajadores</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre"
                value={searchText}
                onChangeText={handleSearch}
            />
            <FlatList
                data={filteredTrabajadores}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <TrabajadorCard trabajador={item} navigation={navigation} />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1c1c1e', // Fondo oscuro
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    searchInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 20,
        paddingHorizontal: 10,
        backgroundColor: '#444', // Fondo de entrada
        color: '#fff', // Color de texto
    },
    logoutButton: {
        marginRight: 15,
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#2e5c74', // Color de fondo
        borderRadius: 5,
    },
    logoutButtonText: {
        color: '#fff', // Color del texto
        fontWeight: 'bold',
    },
});

export default AdminDashboard;
