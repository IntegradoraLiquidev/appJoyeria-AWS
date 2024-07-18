import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const EditarTrabajador = ({ worker, onSave }) => {
    const [name, setName] = useState(worker.nombre);
    const [role, setRole] = useState(worker.role);
    const [email, setEmail] = useState(worker.email);

    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([
        { label: 'Admin', value: 'admin' },
        { label: 'Trabajador', value: 'trabajador' },
    ]);

    const handleSave = () => {
        const updatedWorker = {
            ...worker,
            nombre: name,
            role,
            email,
        };
        onSave(updatedWorker);
    };

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.header}>Editar Trabajador</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nombre:</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Rol:</Text>
                    <DropDownPicker
                        open={open}
                        value={role}
                        items={items}
                        setOpen={setOpen}
                        setValue={setRole}
                        setItems={setItems}
                        style={styles.input}
                        dropDownContainerStyle={styles.dropdown}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email:</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => {/* handle cancel logic */}}>
                    <Text style={styles.cancelButtonText}>Cerrar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1c1c1e', // Fondo oscuro
    },
    formContainer: {
        width: '90%',
        padding: 20,
        backgroundColor: '#2c2c2e', // Fondo del formulario
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    header: {
        fontSize: 24,
        marginBottom: 20,
        color: '#fff', // Color de texto
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        color: '#fff', // Color de texto
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#444', // Fondo de entrada
        color: '#fff', // Color de texto
    },
    dropdown: {
        backgroundColor: '#444', // Fondo del dropdown
        borderColor: '#ccc',
    },
    saveButton: {
        backgroundColor: '#ff4757', // Color de fondo del botón
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#fff', // Color del texto del botón
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#ccc', // Color de fondo del botón de cerrar
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButtonText: {
        color: '#000', // Color del texto del botón de cerrar
        fontWeight: 'bold',
    },
});

export default EditarTrabajador;
