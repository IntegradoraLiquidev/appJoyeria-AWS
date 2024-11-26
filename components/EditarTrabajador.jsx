import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';

const EditarTrabajador = ({ route, navigation }) => {
    const { trabajador, onEdit } = route.params;
    const [editedTrabajador, setEditedTrabajador] = useState({ ...trabajador });
    const [role, setRole] = useState(editedTrabajador.rol);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([
        { label: 'Administrador', value: 'Administrador' },
        { label: 'Trabajador', value: 'Trabajador' }
    ]);

    const handleSaveChanges = () => {
        axios.put(`http://192.168.1.15:3000/api/trabajadores/editar/${trabajador.id_usuario}`, {
            ...editedTrabajador,
            rol: role
        })
            .then(response => {
                if (response.status === 200) {
                    Alert.alert("Éxito", "Trabajador actualizado correctamente");
                    onEdit({ ...editedTrabajador, rol: role });
                    navigation.goBack();
                }
            })
            .catch(error => {
                const errorMessage = error.response?.data?.message || 'Error desconocido al actualizar el trabajador';
                Alert.alert("Error", errorMessage);
            });
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={editedTrabajador.nombre}
                onChangeText={(text) => setEditedTrabajador({ ...editedTrabajador, nombre: text })}
                placeholderTextColor="#999"
            />
            <TextInput
                style={styles.input}
                placeholder="Apellidos"
                value={editedTrabajador.apellidos}
                onChangeText={(text) => setEditedTrabajador({ ...editedTrabajador, apellidos: text })}
                placeholderTextColor="#999"
            />
            <TextInput
                style={styles.input}
                placeholder="Correo Electrónico"
                value={editedTrabajador.email}
                onChangeText={(text) => setEditedTrabajador({ ...editedTrabajador, email: text })}
                keyboardType="email-address"
                placeholderTextColor="#999"
            />
            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                secureTextEntry
                value={editedTrabajador.password}
                onChangeText={(text) => setEditedTrabajador({ ...editedTrabajador, password: text })}
                placeholderTextColor="#999"
            />

            <DropDownPicker
                open={open}
                value={role}
                items={items}
                setOpen={setOpen}
                setValue={setRole}
                setItems={setItems}
                placeholder="Selecciona el rol"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#101010',
    },
    title: {
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
    saveButton: {
        backgroundColor: '#d4af37',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default EditarTrabajador;
