import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';

const EditarClientes = ({ route }) => {
    const { cliente, refreshClientes } = route.params || {};

    const [nombre, setNombre] = useState(cliente?.nombre || '');
    const [direccion, setDireccion] = useState(cliente?.direccion || '');
    const [telefono, setTelefono] = useState(cliente?.telefono || '');
    const [quilates, setQuilates] = useState(cliente?.quilates?.toString() || '0');
    const [precioTotal, setPrecioTotal] = useState(cliente?.precio_total?.toString() || '0');
    const [formaPago, setFormaPago] = useState(cliente?.forma_pago || '');
    const [montoActual, setMontoActual] = useState(cliente?.monto_actual?.toString() || '0');

    const [open, setOpen] = useState(false);

    const handleUpdateCliente = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
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
                Alert.alert('Éxito', 'Cliente actualizado con éxito');
                if (refreshClientes) refreshClientes();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error al actualizar el cliente:', error);
            Alert.alert('Error', `Error al actualizar el cliente: ${error.message}`);
        }
    };

    return cliente ? (

        <View style={styles.container}>
            <ScrollView>
                <Text style={styles.label}>Nombre del Cliente:</Text>
                <TextInput
                    placeholder="Nombre"
                    value={nombre}
                    onChangeText={setNombre}
                    style={styles.input}
                    placeholderTextColor="#999"
                />

                <Text style={styles.label}>Dirección del Cliente:</Text>
                <TextInput
                    placeholder="Dirección"
                    value={direccion}
                    onChangeText={setDireccion}
                    style={styles.input}
                    placeholderTextColor="#999"
                />

                <Text style={styles.label}>Teléfono del Cliente:</Text>
                <TextInput
                    placeholder="Teléfono"
                    value={telefono}
                    onChangeText={setTelefono}
                    style={styles.input}
                    keyboardType="phone-pad"
                    placeholderTextColor="#999"
                />

                <Text style={styles.label}>Quilates del Producto:</Text>
                <TextInput
                    placeholder="Quilates"
                    value={quilates}
                    onChangeText={setQuilates}
                    style={styles.input}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                />

                <Text style={styles.label}>Precio Total del Producto:</Text>
                <TextInput
                    placeholder="Precio Total"
                    value={precioTotal}
                    onChangeText={setPrecioTotal}
                    style={styles.input}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                />

                <Text style={styles.label}>Forma de Pago:</Text>
                <DropDownPicker
                    open={open}
                    value={formaPago}
                    items={[
                        { label: 'Diario', value: 'Diario' },
                        { label: 'Semanal', value: 'Semanal' },
                    ]}
                    setOpen={setOpen}
                    setValue={setFormaPago}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    placeholder="Selecciona una opción"
                    placeholderTextColor="#999"
                />

                <Text style={styles.label}>Monto Actual a Pagar:</Text>
                <TextInput
                    placeholder="Monto Actual"
                    value={montoActual}
                    onChangeText={setMontoActual}
                    style={styles.input}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleUpdateCliente}>
                    <Text style={styles.saveButtonText}>Actualizar Cliente</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    ) : (
        <Text style={styles.loadingText}>Cargando cliente...</Text>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: '#101010',
    },
    label: {
        fontSize: 16,
        color: '#f5c469',
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#1c1c1e',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 20,
        color: '#fff',
        fontSize: 14,
    },
    dropdown: {
        marginBottom: 20,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    dropdownContainer: {
        borderRadius: 12,
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    saveButton: {
        backgroundColor: '#d4af37',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    saveButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 18,
    },
    loadingText: {
        fontSize: 18,
        color: '#f5c469',
        textAlign: 'center',
        marginTop: 20,
    },
});


export default EditarClientes;
