import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, StatusBar, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { decode as atob } from 'base-64';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [hidePass, setHidePass] = useState(true);
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState('');
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [userName, setUserName] = useState(''); // Nuevo estado para el nombre del usuario

    const buttonScale = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const lockAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    const decodeJWT = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = atob(base64);
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error al decodificar el JWT:', error);
            return null;
        }
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://192.168.1.21:3000/api/usuarios/login', { email, password });
            const { token } = response.data;
            await AsyncStorage.setItem('token', token);

            const decoded = decodeJWT(token);
            console.log('Decoded JWT:', decoded); // Agrega este log
            if (!decoded || !decoded.role) {
                setAlertMessage('Error al obtener el rol del usuario.');
                setAlertType('error');
                setTimeout(() => setAlertMessage(null), 3000);
                return;
            }

            // Almacenar el nombre del usuario en el estado
            setUserName(decoded.nombre || "Usuario"); // Cambia 'nombre' según cómo lo tengas en el JWT

            setLoginSuccess(true);
            Animated.timing(lockAnim, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }).start(() => {
                setIsUnlocked(true);
                setTimeout(() => {
                    if (decoded.role === 'Administrador') {
                        navigation.reset({ index: 0, routes: [{ name: 'AdminDashboard' }] });
                    } else if (decoded.role === 'Trabajador') {
                        navigation.reset({ index: 0, routes: [{ name: 'WorkerDashboard' }] });
                    }
                }, 1500);
            });
        } catch (error) {
            setAlertMessage('Error al iniciar sesión');
            setAlertType('error');
            setTimeout(() => setAlertMessage(null), 3000);
        }
    };

    const handlePressIn = () => {
        Animated.spring(buttonScale, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(buttonScale, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
                <Text style={styles.title}>Joyería</Text>
                <Text style={styles.subtitle}>López</Text>
            </Animated.View>

            {loginSuccess ? (
                <View style={styles.lockContainer}>
                    <Animated.View style={{
                        transform: [
                            {
                                translateY: lockAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -20]
                                })
                            },
                        ],
                    }}>
                        <Ionicons name={isUnlocked ? "lock-open" : "lock-closed"} size={40} color="#d4af37" />
                    </Animated.View>
                    <Text style={styles.welcomeText}>Bienvenido, {userName}</Text>
                </View>
            ) : (
                <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
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
                        <TouchableOpacity style={styles.icon} onPress={() => setHidePass(!hidePass)}>
                            <Ionicons name={hidePass ? "eye-off" : "eye"} size={20} color="gray" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                            <TouchableOpacity
                                style={styles.loginButton}
                                onPressIn={handlePressIn}
                                onPressOut={handlePressOut}
                                onPress={handleLogin}
                            >
                                <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </Animated.View>
            )}
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d0d0d',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 60, // Se eleva el título más arriba en la pantalla
        marginTop: -120,  // Ajuste adicional para mayor altura
    },
    title: {
        fontSize: 54,  // Tamaño más grande para el título
        marginRight: 50,
        fontStyle: 'italic',
        color: '#f5c469',
    },
    subtitle: {
        fontSize: 42,  // Tamaño más grande para el subtítulo
        marginLeft: 50,
        fontStyle: 'italic',
        color: '#f5c469',
    },
    lockContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        marginBottom: 20,
    },
    welcomeText: {
        color: '#d4af37',
        fontSize: 22,
        marginTop: 10,
        textAlign: 'center',
    },
    formContainer: {
        width: '85%',
        backgroundColor: '#1a1a1a',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 12,
    },
    text: {
        color: '#f5c469',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#444',
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 10,
        width: '100%',
        padding: 5,
        backgroundColor: '#1a1a1a',
    },
    input: {
        flex: 1,
        height: 40,
        paddingHorizontal: 10,
        color: '#d9d9d9',
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
        backgroundColor: '#d4af37',
        padding: 14,
        width: '50%',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#ff6347',
        shadowOpacity: 1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 2,
    },
    loginButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    successAlert: {
        backgroundColor: '#1db954',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    errorAlert: {
        backgroundColor: '#ff4c4c',
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
