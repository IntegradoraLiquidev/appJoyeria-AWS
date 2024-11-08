import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrabajadorCard from '../components/TrabajadorCard';
import { Ionicons } from '@expo/vector-icons';

const AdminDashboard = ({ navigation }) => {
    const [trabajadores, setTrabajadores] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredTrabajadores, setFilteredTrabajadores] = useState([]);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const fetchTrabajadores = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const response = await axios.get('http://192.168.1.21:3000/api/trabajadores/', {
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

                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            }
        } catch (error) {
            console.error('Error al obtener trabajadores:', error);
        }
    };

    useEffect(() => {
        fetchTrabajadores();
    }, []);

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

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <Ionicons name="exit-outline" size={24} color="#ff6347" />
                    </Animated.View>
                </TouchableOpacity>
            ),
        });
    }, [navigation, scaleAnim]);

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
            <View style={styles.header}>
                <Text style={styles.title}>Lista de trabajadores</Text>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <Ionicons name="exit-outline" size={24} color="#ff6347" />
                    </Animated.View>
                </TouchableOpacity>
            </View>

            <Animated.View style={[styles.searchInputContainer, { opacity: fadeAnim }]}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por nombre"
                    value={searchText}
                    onChangeText={handleSearch}
                    placeholderTextColor="#d1a980"
                />
            </Animated.View>

            <Animated.View style={{ opacity: fadeAnim }}>
                <FlatList
                    data={filteredTrabajadores.length > 0 ? filteredTrabajadores : []}
                    keyExtractor={item => item.id_usuario?.toString() || item.id.toString()}
                    renderItem={({ item }) => (
                        <TrabajadorCard trabajador={item} navigation={navigation} />
                    )}
                    contentContainerStyle={styles.listContent}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1c1c1e',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f5c469',
    },
    searchInputContainer: {
        marginBottom: 20,
    },
    searchInput: {
        height: 40,
        borderColor: '#707070',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: '#1e1e1e',
        color: '#d1a980',
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
        padding: 5,
        borderRadius: 10,
        backgroundColor: '#282828',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 7,
    },
});

export default AdminDashboard;
