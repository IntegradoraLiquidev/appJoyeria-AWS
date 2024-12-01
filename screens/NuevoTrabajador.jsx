import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import FloatingLabelInput from '../components/FloatingLabelInput'; // Importa el componente reutilizable

const NuevoTrabajador = ({ navigation }) => {
    const [nombre, setNombre] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const token = useRef(null);

    useEffect(() => {
        const getToken = async () => {
            token.current = await AsyncStorage.getItem('token');
        };
        getToken();
    }, []);

    const handleAddTrabajador = async () => {
        if (!nombre || !apellidos || !email || !password || !role) {
            Alert.alert("Error", "Por favor, complete todos los campos");
            return;
        }
        setIsLoading(true);
    
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token.current}`,
                    'Content-Type': 'application/json'
                }
            };
    
            const data = {
                nombre,
                apellidos,
                email,
                password,
                rol: role // Asegúrate de usar "rol" si así lo requiere tu backend.
            };
    
            const response = await axios.post(
                'https://8oj4qmf2y4.execute-api.us-east-1.amazonaws.com/trabajadores/agregar',
                data,
                config
            );
    
            if (response.status === 201) {
                Alert.alert('Éxito', 'Trabajador agregado exitosamente');
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Error al agregar el trabajador');
            }
        } catch (error) {
            const errorMessage = error.response?.status === 400 
                ? 'Correo ya registrado' 
                : 'Ocurrió un error inesperado';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={{ paddingBottom: 20 }}>
                <Text style={styles.header}>Agregar Nuevo Trabajador</Text>

                <FloatingLabelInput
                    label="Nombre"
                    value={nombre}
                    onChangeText={setNombre}
                />
                <FloatingLabelInput
                    label="Apellidos"
                    value={apellidos}
                    onChangeText={setApellidos}
                />
                <FloatingLabelInput
                    label="Correo Electrónico"
                    value={email}
                    onChangeText={setEmail}
                />
                <FloatingLabelInput
                    label="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <View style={styles.pickerContainer}>
                    <Text style={{color: '#fff'}}>Rol</Text>
                    <Picker
                        selectedValue={role}
                        onValueChange={(itemValue) => setRole(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Trabajador" value="trabajador" />
                        <Picker.Item label="Administrador" value="Administrador" />
                    </Picker>
                </View>

                <View style={styles.buttonContainer}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#0f0" />
                    ) : (
                        <TouchableOpacity style={styles.button} onPress={handleAddTrabajador}>
                            <Text style={styles.buttonText}>Agregar Trabajador</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#101010',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f5c469',
        textAlign: 'center',
        marginBottom: 20,
    },
    pickerContainer: {
        marginBottom: 15,
        backgroundColor: '#1a1a1a',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    pickerLabel: {
        color: '#fff',
        marginBottom: 5,
    },
    picker: {
        backgroundColor: '#fff',
        color: '#000',
    },
    buttonContainer: {
        marginTop: 20,
    },
    button: {
        backgroundColor: '#d4af37',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default NuevoTrabajador;
