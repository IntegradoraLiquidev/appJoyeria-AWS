import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MultaForm = ({ clienteId, onMultaAdded }) => {
    const handleAddMulta = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            if (!clienteId) {
                console.error('clienteId is not defined');
                return;
            }

            const fechaActual = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD

            const response = await axios.post(`http://192.168.1.13:3000/clientes/${clienteId}/multas`, { fecha: fechaActual }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 201) {
                console.log('Multa added successfully:', response.data);
                onMultaAdded();
            } else {
                console.error('Error al agregar multa:', response.data);
            }
        } catch (error) {
            console.error('Error en la solicitud de agregar multa:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Button title="Agregar Multa" onPress={handleAddMulta} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    }
});

export default MultaForm;
