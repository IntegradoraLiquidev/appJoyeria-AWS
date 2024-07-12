// NuevoTrabajador.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const NuevoTrabajador = ({ navigation }) => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('trabajador');
    const [token, setToken] = useState(null);

    useEffect(() => {
        const getToken = async () => {
            const token = await AsyncStorage.getItem('token');
            setToken(token);
        };
        
        getToken();
    }, []);

    const handleAddTrabajador = async () => {
        if (!token) {
            console.error('No token found');
            return;
        }

        try {
            const response = await axios.post('http://192.168.1.13:3000/trabajadores', {
                nombre,
                email,
                password,
                role,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Trabajador agregado:', response.data);
            navigation.goBack(); // Volver a la pantalla anterior
        } catch (error) {
            console.error('Error al agregar trabajador:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Nombre:</Text>
            <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
            <Text style={styles.label}>Email:</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} />
            <Text style={styles.label}>Contraseña:</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
            <Text style={styles.label}>Rol:</Text>
            <Picker selectedValue={role} onValueChange={(itemValue) => setRole(itemValue)} style={styles.picker}>
                <Picker.Item label="Trabajador" value="trabajador" />
                <Picker.Item label="Admin" value="admin" />
            </Picker>
            <Button title="Agregar Trabajador" onPress={handleAddTrabajador} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    label: {
        fontSize: 16,
        marginBottom: 4,
        color: '#333'
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        borderRadius: 4
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 12,
    }
});

export default NuevoTrabajador;
