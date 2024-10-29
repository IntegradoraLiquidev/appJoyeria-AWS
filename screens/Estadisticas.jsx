import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

const EstadisticasScreen = () => {
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    const fetchEstadisticas = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) throw new Error('No token found');
            
            const response = await axios.get('http://192.168.1.17:3000/estadisticas/general', {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Datos recibidos:', response.data);
            setEstadisticas(response.data);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error.message);
            console.error('Detalles del error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEstadisticas();
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        );
    }

    const totalClientes = estadisticas ? estadisticas.length : 0;
    const totalPrestamosActivos = estadisticas ? estadisticas.filter(item => item.estado === 'pendiente').length : 0;
    const totalPrestamosCompletados = estadisticas ? estadisticas.filter(item => item.estado === 'completado').length : 0;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Estadísticas Generales</Text>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Total Clientes</Text>
                <Text style={styles.cardValue}>{totalClientes}</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Total clientes completados</Text>
                <Text style={styles.cardValue}>{totalPrestamosCompletados}</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Total clientes pendientes</Text>
                <Text style={styles.cardValue}>{totalPrestamosActivos}</Text>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EstadisticasTablas')}>
                    <Image source={require('../assets/table_icon.png')} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EstadisticasGraficas', { estadisticas })}>
                    <Image source={require('../assets/chart_icon.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    card: { backgroundColor: '#f8f9fa', borderRadius: 8, padding: 16, marginVertical: 8 },
    cardTitle: { fontSize: 18, fontWeight: 'bold' },
    cardValue: { fontSize: 16 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
    button: { width: 150, height: 150, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: '#007BFF', padding: 16 },
    icon: { width: '100%', height: '100%', resizeMode: 'contain' }
});

export default EstadisticasScreen;
