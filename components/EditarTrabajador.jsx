import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
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
            <Text style={styles.header}>Editar Trabajador</Text>
            <View style={styles.inputContainer}>
                <Text>Nombre:</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text>Rol:</Text>
                <DropDownPicker
                    open={open}
                    value={role}
                    items={items}
                    setOpen={setOpen}
                    setValue={setRole}
                    setItems={setItems}
                    style={styles.input}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text>Email:</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                />
            </View>
            <Button title="Guardar" onPress={handleSave} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    header: {
        fontSize: 24,
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
    },
});

export default EditarTrabajador;
