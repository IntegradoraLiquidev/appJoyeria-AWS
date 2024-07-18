import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Modal, TouchableOpacity } from 'react-native';
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

            const response = await fetch(`http://172.20.104.17:3000/clientes/${cliente.id}`, {
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
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                    <Text style={styles.header}>Editar Cliente</Text>
                    <View style={styles.inputContainer}>
                        <Text>Nombre:</Text>
                        <TextInput
                            style={styles.input}
                            value={nombre}
                            onChangeText={setNombre}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text>Ocupación:</Text>
                        <TextInput
                            style={styles.input}
                            value={ocupacion}
                            onChangeText={setOcupacion}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text>Dirección:</Text>
                        <TextInput
                            style={styles.input}
                            value={direccion}
                            onChangeText={setDireccion}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text>Teléfono:</Text>
                        <TextInput
                            style={styles.input}
                            value={telefono}
                            onChangeText={setTelefono}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text>Fecha Inicio:</Text>
                        <TextInput
                            style={styles.input}
                            value={fechaInicio}
                            onChangeText={setFechaInicio}
                            placeholder="YYYY-MM-DD"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text>Fecha Término:</Text>
                        <TextInput
                            style={styles.input}
                            value={fechaTermino}
                            onChangeText={setFechaTermino}
                            placeholder="YYYY-MM-DD"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text>Monto Inicial:</Text>
                        <TextInput
                            style={styles.input}
                            value={montoInicial}
                            onChangeText={setMontoInicial}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text>Monto Actual:</Text>
                        <TextInput
                            style={styles.input}
                            value={montoActual}
                            onChangeText={setMontoActual}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text>Estado:</Text>
                        <DropDownPicker
                            open={open}
                            value={estado}
                            items={items}
                            setOpen={setOpen}
                            setValue={setEstado}
                            setItems={setItems}
                            style={styles.input}
                        />
                    </View>
                    <Button title="Guardar Cambios" onPress={handleGuardar} />
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        fontSize: 24,
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 15,
        width: '100%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        width: '100%',
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: 'white',
    },
});

export default EditarClientes;
