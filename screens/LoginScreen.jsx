import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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
            const response = await axios.post('http://192.168.1.13:3000/login', { email, password });
            const { token } = response.data;
            console.log('Token recibido:', token);

            await AsyncStorage.setItem('token', token);

            const decoded = decodeJWT(token);
            console.log('Token decodificado:', decoded);

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
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            Alert.alert('Error', 'Error al iniciar sesión');
        }
    };

    return (
        <View>
            <Text>Email:</Text>
            <TextInput value={email} onChangeText={setEmail} />
            <Text>Password:</Text>
            <TextInput value={password} onChangeText={setPassword} secureTextEntry />
            <Button title="Login" onPress={handleLogin} />
        </View>
    );
};

export default LoginScreen;

