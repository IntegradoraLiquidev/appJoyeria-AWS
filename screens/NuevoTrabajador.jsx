import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import FloatingLabelInput from '../components/FloatingLabelInput'; // Importa el componente reutilizable

const NuevoTrabajador = ({ navigation }) => {
    const [nombre, setNombre] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('trabajador');
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const token = useRef(null);

    useEffect(() => {
        const getToken = async () => {
            token.current = await AsyncStorage.getItem('token');
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
            const config = { headers: { Authorization: `Bearer ${token.current}` } };
            const data = { nombre, apellidos, email, password, role };
            const response = await axios.post('http://192.168.1.65:3000/api/trabajadores/agregar', data, config);

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
