import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AbonoForm = ({ clienteId, onAddAbono }) => {
    const [monto, setMonto] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddAbono = async () => {
        if (loading) return;

        const parsedMonto = parseFloat(monto);
        if (isNaN(parsedMonto) || parsedMonto <= 0) {
            Alert.alert('Error', 'Por favor ingresa un monto válido.');
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                setLoading(false);
                return;
            }

            const fecha = new Date().toISOString().split('T')[0];

            const response = await axios.post(
                `http://192.168.1.10:3000/api/clientes/${clienteId}/abonos`,
                { monto: parsedMonto, fecha },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 201) {
                console.log('Abono added successfully:', response.data);
                onAddAbono();
                setMonto(''); // Limpiar el campo del monto
            } else {
                console.error('Error al agregar abono:', response.data);
            }


        } catch (error) {
            console.error('Error en la solicitud de agregar abono:', error);
        } finally {
            setLoading(false);
        }


    };

    return (
        <View >
            <Text style={styles.label}>Agregar Monto</Text>
            <TextInput
                style={styles.input}
                value={monto}
                placeholder="Ingrese el monto..."
                placeholderTextColor="#888"
                onChangeText={(text) => setMonto(text.replace(/[^0-9.]/g, ''))}
                keyboardType="numeric"
            />
            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleAddAbono}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Abonar</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#0d0d0d',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#fff', // Dorado elegante
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#d1a980',
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 15,
        color: '#d1a980',
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#d4af37',
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#b8944f',
    },
    buttonText: {
        color: '#0d0d0d',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AbonoForm;
