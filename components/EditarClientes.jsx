import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditarClientes = ({ route }) => {
    const { cliente } = route.params || {}; // Obtén el cliente de route.params

    const [nombre, setNombre] = useState(cliente?.nombre || '');
    const [direccion, setDireccion] = useState(cliente?.direccion || '');
    const [telefono, setTelefono] = useState(cliente?.telefono || '');
    const [quilates, setQuilates] = useState(cliente?.quilates?.toString() || '0');
    const [precioTotal, setPrecioTotal] = useState(cliente?.precio_total?.toString() || '0');
    const [formaPago, setFormaPago] = useState(cliente?.forma_pago || '');
    const [montoActual, setMontoActual] = useState(cliente?.monto_actual?.toString() || '0');

    const handleUpdateCliente = async () => {
        try {
            const token = await AsyncStorage.getItem('token'); // Obtén el token de AsyncStorage
            if (!token) {
                alert('Error: no se encontró el token de autenticación');
                return;
            }

            const response = await fetch(`http://192.168.1.73:3000/api/clientes/${cliente.id_cliente}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre,
                    direccion,
                    telefono,
                    quilates: parseFloat(quilates),
                    precio_total: parseFloat(precioTotal),
                    forma_pago: formaPago,
                    monto_actual: parseFloat(montoActual)
                })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Cliente actualizado con éxito');
            } else {
                alert(`Error: ${data.error || 'No se pudo actualizar el cliente'}`);
            }
        } catch (error) {
            console.error('Error al actualizar el cliente:', error);
            alert(`Error al actualizar el cliente: ${error.message}`);
        }
    };

    return cliente ? (
        <View style={styles.container}>
            <Text>Editar cliente: {nombre}</Text>
            <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
            <TextInput placeholder="Dirección" value={direccion} onChangeText={setDireccion} style={styles.input} />
            <TextInput placeholder="Teléfono" value={telefono} onChangeText={setTelefono} style={styles.input} />
            <TextInput placeholder="Quilates" value={quilates} onChangeText={setQuilates} style={styles.input} keyboardType="numeric" />
            <TextInput placeholder="Precio Total" value={precioTotal} onChangeText={setPrecioTotal} style={styles.input} keyboardType="numeric" />
            <TextInput placeholder="Forma de Pago" value={formaPago} onChangeText={setFormaPago} style={styles.input} />
            <TextInput placeholder="Monto Actual" value={montoActual} onChangeText={setMontoActual} style={styles.input} keyboardType="numeric" />
            <Button title="Actualizar Cliente" onPress={handleUpdateCliente} />
        </View>
    ) : (
        <Text>Cargando cliente...</Text>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10
    }
});

export default EditarClientes;
