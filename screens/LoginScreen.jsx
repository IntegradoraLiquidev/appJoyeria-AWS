import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { decode as atob } from 'base-64';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [hidePass, setHidePass] = useState(true);
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState(''); // 'success' or 'error'

    const decodeJWT = (token) => {
        try {
            const base64Url = token.split('.')[1]; // Extraer payload
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Normalizar caracteres
            const jsonPayload = atob(base64); // Decodificar Base64
            return JSON.parse(jsonPayload); // Convertir a objeto JSON
        } catch (error) {
            console.error('Error al decodificar el JWT:', error);
            return null;
        }
    };
    
    const handleLogin = async () => {
        try {
            console.log('Iniciando sesión con:', { email, password });
            const response = await axios.post('http://192.168.1.10:3000/api/usuarios/login', { email, password });
            const { token } = response.data;
            console.log('Token recibido:', token);
    
            await AsyncStorage.setItem('token', token);
    
            const decoded = decodeJWT(token);
            console.log('Token decodificado:', decoded);
    
            // Verifica que el token tenga el rol
            if (!decoded || !decoded.role) {
                setAlertMessage('Error al obtener el rol del usuario.');
                setAlertType('error');
                setTimeout(() => setAlertMessage(null), 3000);
                return;
            }
    
            setAlertMessage('Inicio de sesión exitoso');
            setAlertType('success');
    
            setTimeout(() => {
                setAlertMessage(null);
                if (decoded.role === 'Administrador') {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'AdminDashboard' }],
                    });
                } else if (decoded.role === 'Trabajador') {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'WorkerDashboard' }],
                    });
                } else {
                    setAlertMessage('Rol no reconocido');
                    setAlertType('error');
                    setTimeout(() => setAlertMessage(null), 3000);
                }
            }, 2000);
        } catch (error) {
            console.error('Error al iniciar sesión:', error.response ? error.response.data : error.message);
            setAlertMessage('Error al iniciar sesión');
            setAlertType('error');
            setTimeout(() => setAlertMessage(null), 3000);
        }
    };
    
    
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Joyería</Text>
                <Text style={styles.subtitle}>López</Text>
            </View>
            <View style={styles.formContainer}>
                {alertMessage && (
                    <View style={alertType === 'success' ? styles.successAlert : styles.errorAlert}>
                        <Text style={styles.alertText}>{alertMessage}</Text>
                    </View>
                )}
                <Text style={styles.text}>Correo electrónico:</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Correo electrónico:"
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                        placeholderTextColor="#ccc"
                    />
                </View>
                <Text style={styles.text}>Contraseña:</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña:"
                        secureTextEntry={hidePass}
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                        placeholderTextColor="#ccc"
                    />
                    <TouchableOpacity
                        style={styles.icon}
                        onPress={() => setHidePass(!hidePass)}
                    >
                        <Ionicons name={hidePass ? "eye-off" : "eye"} size={20} color="gray" />
                    </TouchableOpacity>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020202', // Fondo negro
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: -90,
    },
    title: {
        fontSize: 48,
        marginRight: 50,
        fontStyle: 'italic',
        color: '#ecdda2', // Cobre
    },
    subtitle: {
        fontSize: 36,
        marginLeft: 50,
        fontStyle: 'italic',
        color: '#ecdda2', // Cobre
    },
    formContainer: {
        width: '85%',
        backgroundColor: '#373739',
        borderRadius: 5,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    text: {
        color: '#ecdda2', // Dorado
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,   
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#d1a980', // Dorado
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 10,
        width: '100%',
        padding: 5,
        backgroundColor: '#19191a', // Verde oliva
    },
    input: {
        flex: 1,
        height: 40,
        paddingHorizontal: 10,
        color: '#d1a980', // Dorado
    },
    icon: {
        padding: 10,
    },
    buttonContainer: {
        width: '100%',
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButton: {
        backgroundColor: '#c9b977', // Cobre
        padding: 14,
        width: '50%',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#FFF', // Blanco
        fontWeight: 'bold',
    },
    successAlert: {
        backgroundColor: '#4caf50',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    errorAlert: {
        backgroundColor: '#f44336',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    alertText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});

export default LoginScreen;
