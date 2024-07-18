import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NuevoCliente = ({ navigation }) => {
    const [nombre, setNombre] = useState('');
    const [ocupacion, setOcupacion] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaTermino, setFechaTermino] = useState('');
    const [montoInicial, setMontoInicial] = useState('');
    const [token, setToken] = useState(null);

    useEffect(() => {
        const getToken = async () => {
            const token = await AsyncStorage.getItem('token');
            setToken(token);
        };

        getToken();
    }, []);

    const handleAddCliente = async () => {
        if (!token) {
            console.error('No token found');
            return;
        }

        try {
            const response = await axios.post('http://172.20.104.17:3000/clientes', {
                nombre,
                ocupacion,
                direccion,
                telefono,
                fecha_inicio: fechaInicio,
                fecha_termino: fechaTermino,
                monto_inicial: montoInicial
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setNombre('');
            setOcupacion('');
            setDireccion('');
            setTelefono('');
            setFechaInicio('');
            setFechaTermino('');
            setMontoInicial('');
            Alert.alert('Éxito', 'Cliente agregado exitosamente');
        } catch (error) {
            console.error('Error al agregar cliente:', error);
            Alert.alert('Error', 'Hubo un error al agregar el cliente');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Nombre:</Text>
            <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
            <Text style={styles.label}>Ocupación:</Text>
            <TextInput style={styles.input} value={ocupacion} onChangeText={setOcupacion} />
            <Text style={styles.label}>Dirección:</Text>
            <TextInput style={styles.input} value={direccion} onChangeText={setDireccion} />
            <Text style={styles.label}>Teléfono:</Text>
            <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} />
            <Text style={styles.label}>Fecha de Inicio:</Text>
            <TextInput style={styles.input} value={fechaInicio} onChangeText={setFechaInicio} />
            <Text style={styles.label}>Fecha de Término:</Text>
            <TextInput style={styles.input} value={fechaTermino} onChangeText={setFechaTermino} />
            <Text style={styles.label}>Monto Inicial:</Text>
            <TextInput style={styles.input} value={montoInicial} onChangeText={setMontoInicial} keyboardType="numeric" />
            <View style={styles.buttonContainer}>
                <Button title="Agregar Cliente" onPress={handleAddCliente} color="#2e5c74" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#1c1c1e', // Fondo oscuro
    },
    label: {
        fontSize: 16,
        marginBottom: 4,
        color: '#fff', // Color de texto blanco
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        borderRadius: 4,
        backgroundColor: '#444', // Fondo de input
        color: '#fff', // Color de texto
    },
    buttonContainer: {
        marginTop: 12,
    },
});

export default NuevoCliente;
