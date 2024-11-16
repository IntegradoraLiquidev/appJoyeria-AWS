import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Animated, Platform, ScrollView, KeyboardAvoidingView
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker'; // Importa el Dropdown Picker

const NuevoTrabajador = ({ navigation }) => {
    const [nombre, setNombre] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('trabajador');
    const [token, setToken] = useState(null);
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const getToken = async () => {
            const token = await AsyncStorage.getItem('token');
            setToken(token);
        };
        getToken();
    }, []);

    const handleAddTrabajador = async () => {
        if (!nombre || !apellidos || !email || !password) {
            Alert.alert("Error", "Por favor, complete todos los campos");
            return;
        }
        setIsLoading(true);

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const data = { nombre, apellidos, email, password, role };
            const response = await axios.post('http://192.168.1.73:3000/api/trabajadores/agregar', data, config);

            if (response.status === 201) {
                Alert.alert('Éxito', 'Trabajador agregado exitosamente');
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Error al agregar el trabajador');
            }
        } catch (error) {
            const errorMessage = error.response?.status === 400 ? 'Correo ya registrado' : 'Ocurrió un error';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePressIn = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start(() => handleAddTrabajador());
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
                <View style={{ paddingBottom: 20 }}>
                    <Text style={styles.header}>Agregar Nuevo Trabajador</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Nombre"
                        value={nombre}
                        onChangeText={setNombre}
                        placeholderTextColor="#999"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Apellidos"
                        value={apellidos}
                        onChangeText={setApellidos}
                        placeholderTextColor="#999"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Correo Electrónico"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        placeholderTextColor="#999"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor="#999"
                    />

                    <View style={{ zIndex: 100 }}>
                        <DropDownPicker
                            open={open}
                            value={role}
                            items={[
                                { label: 'Trabajador', value: 'trabajador' },
                                { label: 'Admin', value: 'admin' },
                            ]}
                            setOpen={setOpen}
                            setValue={setRole}
                            placeholder="Rol"
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropdownContainer}
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#0f0" />
                        ) : (
                            <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPressIn={handlePressIn}
                                    onPressOut={handlePressOut}
                                >
                                    <Text style={styles.buttonText}>Agregar Trabajador</Text>
                                </TouchableOpacity>
                            </Animated.View>
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
    input: {
        backgroundColor: '#1c1c1e',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        color: '#fff',
    },
    dropdown: {
        marginBottom: 15,
        borderRadius: 10,
    },
    dropdownContainer: {
        borderRadius: 10,
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
