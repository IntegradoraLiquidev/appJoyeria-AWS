import React, { useState, useLayoutEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrabajadorCard from '../components/TrabajadorCard';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';


const AdminDashboard = ({ navigation }) => {
    const [trabajadores, setTrabajadores] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredTrabajadores, setFilteredTrabajadores] = useState([]);

    const fetchTrabajadores = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const response = await axios.get('http://192.168.1.16:3000/api/trabajadores/conteo', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (Array.isArray(response.data)) {
                    setTrabajadores(response.data);
                    setFilteredTrabajadores(response.data);
                } else {
                    console.error("Los datos devueltos no son un array:", response.data);
                    setTrabajadores([]);
                    setFilteredTrabajadores([]);
                }
            }
        } catch (error) {
            console.error('Error al obtener trabajadores:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTrabajadores();
        }, [])
    );

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

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

    const handleEditTrabajador = (updatedTrabajador) => {
        setTrabajadores((prevTrabajadores) =>
            prevTrabajadores.map((trabajador) =>
                trabajador.id_usuario === updatedTrabajador.id_usuario ? updatedTrabajador : trabajador
            )
        );
    };

    const handleDeleteTrabajador = (id) => {
        setTrabajadores(trabajadores.filter(trabajador => trabajador.id_usuario !== id));
        setFilteredTrabajadores(filteredTrabajadores.filter(trabajador => trabajador.id_usuario !== id));
    };

    return (
        <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Lista de trabajadores</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="exit-outline" size={24} color="#ff6347" />
            </TouchableOpacity>
        </View>
        <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#d1a980"
        />
        <FlatList
            data={trabajadores.filter(trabajador =>
                trabajador.nombre.toLowerCase().includes(searchText.toLowerCase())
            )}
            keyExtractor={(item) => item.id_usuario.toString()}
            renderItem={({ item }) => (
                <TrabajadorCard
                    trabajador={item}
                    navigation={navigation}
                    onDelete={handleDeleteTrabajador}
                    onEdit={handleEditTrabajador}
                />
            )}
            contentContainerStyle={styles.listContent}
        />
    </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f5c469',
        letterSpacing: 0.8,
    },
    searchInput: {
        height: 45,
        borderColor: '#707070',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 20,
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
    logoutButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#2e2e2e',
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
        elevation: 3,
    },
    logoutButtonText: {
        color: '#ff6347',
        fontWeight: 'bold',
    },
});

export default AdminDashboard;
