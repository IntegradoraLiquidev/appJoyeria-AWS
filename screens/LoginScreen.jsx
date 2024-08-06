import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [hidePass, setHidePass] = useState(true);
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState(''); // 'success' or 'error'

    const decodeJWT = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error al decodificar el JWT:', error);
            return null;
        }
    };

    const handleLogin = async () => {
        try {
            console.log('Iniciando sesión con:', { email, password });
            const response = await axios.post('http://192.168.1.74:3000/login', { email, password });
            const { token } = response.data;
            console.log('Token recibido:', token);

            await AsyncStorage.setItem('token', token);

            const decoded = decodeJWT(token);
            console.log('Token decodificado:', decoded);

            setAlertMessage('Inicio de sesión exitoso');
            setAlertType('success');

            setTimeout(() => {
                setAlertMessage(null);
                if (decoded && decoded.role === 'admin') {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'AdminDashboard' }],
                    });
                } else {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'WorkerDashboard' }],
                    });
                }
            }, 2000);
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            setAlertMessage('Error al iniciar sesión');
            setAlertType('error');
            setTimeout(() => setAlertMessage(null), 3000);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>PRESTAMOS DIARIOS</Text>
            </View>
            <View style={styles.formContainer}>
                {alertMessage && (
                    <View style={alertType === 'success' ? styles.successAlert : styles.errorAlert}>
                        <Text style={styles.alertText}>{alertMessage}</Text>
                    </View>
                )}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Correo electrónico:"
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                        placeholderTextColor="#ccc"
                    />
                </View>
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
                <View style={styles.forgotpwdContainer}>
                    <Text style={styles.forgotpwdText}>¿Olvidaste tu contraseña?</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
    },
    headerContainer: {
        backgroundColor: '#2e5c74',
        width: '100%',
        alignItems: 'center',
        paddingVertical: 15,
        marginBottom: 50,
    },
    headerText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#fff',
    },
    formContainer: {
        alignItems: 'center',
        width: '90%',
        justifyContent: 'center', // Centra el contenido verticalmente
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#2e5c74',
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 10,
        width: '100%',
        backgroundColor: '#333',
    },
    input: {
        flex: 1,
        height: 40,
        paddingHorizontal: 10,
        color: '#fff',
    },
    icon: {
        padding: 10,
    },
    buttonContainer: {
        width: '100%',
        marginTop: 20,
    },
    loginButton: {
        backgroundColor: '#2e5c74',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    forgotpwdContainer: {
        marginTop: 20,
    },
    forgotpwdText: {
        color: '#fff',
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
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default LoginScreen;
