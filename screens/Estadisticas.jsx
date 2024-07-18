// EstadisticasScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EstadisticasScreen = () => {
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEstadisticas = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }

                const response = await axios.get('http://172.20.104.17:3000/estadisticas', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setEstadisticas(response.data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchEstadisticas();
    }, []);

    if (loading) {
        return <Text>Loading...</Text>;
    }

    if (error) {
        return <Text>Error: {error.message}</Text>;
    }

    return (
        <View>
            <Text>Estadísticas:</Text>
            {/* Aquí podrías renderizar tus estadísticas */}
            <Text>{JSON.stringify(estadisticas, null, 2)}</Text>
        </View>
    );
};

export default EstadisticasScreen;
