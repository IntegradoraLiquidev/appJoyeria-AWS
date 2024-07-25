import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';

const EditarClientes = ({ cliente, visible, onClose, onGuardar }) => {
    const [nombre, setNombre] = useState('');
    const [ocupacion, setOcupacion] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaTermino, setFechaTermino] = useState('');
    const [montoInicial, setMontoInicial] = useState('');
    const [montoActual, setMontoActual] = useState('');
    const [estado, setEstado] = useState('');
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Completado', value: 'completado' },
    ]);

    useEffect(() => {
        if (cliente) {
            setNombre(cliente.nombre || '');
            setOcupacion(cliente.ocupacion || '');
            setDireccion(cliente.direccion || '');
            setTelefono(cliente.telefono || '');
            setFechaInicio(cliente.fecha_inicio ? cliente.fecha_inicio.split('T')[0] : '');
            setFechaTermino(cliente.fecha_termino ? cliente.fecha_termino.split('T')[0] : '');
            setMontoInicial(cliente.monto_inicial || '');
            setMontoActual(cliente.monto_actual || '');
            setEstado(cliente.estado || '');
        }
    }, [cliente]);

    const handleGuardar = async () => {
        const clienteActualizado = {
            ...cliente,
            nombre,
            ocupacion,
            direccion,
            telefono,
            fecha_inicio: fechaInicio,
            fecha_termino: fechaTermino,
            monto_inicial: montoInicial,
            monto_actual: montoActual,
            estado,
        };

        try {
            const token = await AsyncStorage.getItem('token');

            const response = await fetch(`http://192.168.1.67:3000/clientes/${cliente.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(clienteActualizado),
            });

            if (response.ok) {
                onGuardar(clienteActualizado);
                onClose();
            } else {
                console.error('Error al actualizar el cliente');
            }
        } catch (error) {
            console.error('Error al actualizar el cliente', error);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.formContainer}>
                    <Text style={styles.header}>Editar Cliente</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nombre:</Text>
                        <TextInput
                            style={styles.input}
                            value={nombre}
                            onChangeText={setNombre}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Ocupación:</Text>
                        <TextInput
                            style={styles.input}
                            value={ocupacion}
                            onChangeText={setOcupacion}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Dirección:</Text>
                        <TextInput
                            style={styles.input}
                            value={direccion}
                            onChangeText={setDireccion}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Teléfono:</Text>
                        <TextInput
                            style={styles.input}
                            value={telefono}
                            onChangeText={setTelefono}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Fecha Inicio:</Text>
                        <TextInput
                            style={styles.input}
                            value={fechaInicio}
                            onChangeText={setFechaInicio}
                            placeholder="YYYY-MM-DD"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Fecha Término:</Text>
                        <TextInput
                            style={styles.input}
                            value={fechaTermino}
                            onChangeText={setFechaTermino}
                            placeholder="YYYY-MM-DD"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Monto Inicial:</Text>
                        <TextInput
                            style={styles.input}
                            value={montoInicial}
                            onChangeText={setMontoInicial}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Monto Actual:</Text>
                        <TextInput
                            style={styles.input}
                            value={montoActual}
                            onChangeText={setMontoActual}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Estado:</Text>
                        <DropDownPicker
                            open={open}
                            value={estado}
                            items={items}
                            setOpen={setOpen}
                            setValue={setEstado}
                            setItems={setItems}
                            style={styles.dropdown}
                            dropDownContainerStyle={styles.dropdownContainer}
                        />
                    </View>
                    <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
                        <Text style={styles.saveButtonText}>Guardar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // Fondo oscuro
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
        color: '#fff',
    },
    dropdownContainer: {
        borderWidth: 1,
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

export default EditarClientes;
