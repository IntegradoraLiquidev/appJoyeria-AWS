import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
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
        // Simulación de validación local
        const users = [
            { email: 'admin', password: '1234', role: 'admin' },
            { email: 'worker', password: '1234', role: 'worker' },
        ];

        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Simular token JWT
            const token = btoa(JSON.stringify({ email: user.email, role: user.role }));
            console.log('Token generado:', token);

            // Guardar token en AsyncStorage
            await AsyncStorage.setItem('token', token);

            // Simular la decodificación del token
            const decoded = decodeJWT(token);
            console.log('Token decodificado:', decoded);

            setAlertMessage('Inicio de sesión exitoso');
            setAlertType('success');

            // Redirigir según el rol
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
        } else {
            setAlertMessage('Correo o contraseña incorrectos');
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
