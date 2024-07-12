// screens/WorkerDashboard.js
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, FlatList, Button, StyleSheet, TextInput,Text } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import ClienteCard from '../components/ClienteCard';

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

                const response = await axios.get('http://192.168.1.13:3000/clientes', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const uniqueClientes = response.data.filter((cliente, index, self) =>
                    index === self.findIndex((c) => (
                        c.id === cliente.id
                    ))
                );

                console.log('Clientes recibidos:', uniqueClientes);
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

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Button
                    onPress={handleLogout}
                    title="Cerrar sesión"
                    color="#000"
                />
            ),
        });
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lista de clientes</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar cliente por nombre"
                value={searchText}
                onChangeText={setSearchText}
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
        backgroundColor: '#f0f0f0',
        padding: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    searchInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 8,
        borderRadius: 4,
        marginBottom: 10,
    },
});

export default WorkerDashboard;
