import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';

const NuevoCliente = ({ navigation }) => {
    const [nombre, setNombre] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [producto, setProducto] = useState(null);
    const [categoria, setCategoria] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [productos, setProductos] = useState([]);
    const [quilates, setQuilates] = useState('');
    const [precioTotal, setPrecioTotal] = useState('');
    const [formaPago, setFormaPago] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [openCategoria, setOpenCategoria] = useState(false);
    const [openProducto, setOpenProducto] = useState(false);
    const [openPago, setOpenPago] = useState(false);

    // Fetch de las categorías al montar el componente
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await axios.get('http://192.168.1.10:3000/api/categorias');
                const categorias = response.data.map((cat) => ({
                    label: cat.nombre,
                    value: cat.id_categoria,
                }));
                setCategorias(categorias);
            } catch (error) {
                console.error('Error al obtener categorías:', error);
                Alert.alert('Error', 'No se pudieron cargar las categorías');
            }
        };

        fetchCategorias();
    }, []);

    // Fetch de los productos filtrados por categoría
    const fetchProductosPorCategoria = async (categoriaId) => {
        try {
            const response = await axios.get(
                `http://192.168.1.10:3000/api/productos?categoria=${categoriaId}`
            );
            const productos = response.data.map((prod) => ({
                label: prod.nombre,
                value: prod.id_producto,
            }));
            setProductos(productos);
        } catch (error) {
            console.error('Error al obtener productos:', error.response || error);
            Alert.alert('Error', 'No se pudieron cargar los productos');
        }
    };

    const handleAddCliente = async () => {
        setIsLoading(true);

        // Validar campos obligatorios
        if (!nombre || !direccion || !telefono || !producto || !quilates || !precioTotal || !formaPago) {
            Alert.alert('Error', 'Por favor, complete todos los campos');
            setIsLoading(false);
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'No se encontró un token de autenticación');
                return;
            }

            await axios.post(
                'http://192.168.1.10:3000/api/clientes',
                {
                    nombre,
                    direccion,
                    telefono,
                    producto_id: producto,
                    quilates: parseFloat(quilates),
                    precio_total: parseFloat(precioTotal),
                    forma_pago: formaPago,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert('Éxito', 'Cliente agregado exitosamente');
            // Limpiar formulario después de agregar cliente
            setNombre('');
            setDireccion('');
            setTelefono('');
            setProducto(null);
            setCategoria(null);
            setQuilates('');
            setPrecioTotal('');
            setFormaPago('');
            navigation.goBack();
        } catch (error) {
            console.error('Error al agregar cliente:', error);
            Alert.alert('Error', 'Hubo un problema al agregar el cliente');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Agregar nuevo cliente</Text>

            <Text style={styles.label}>Nombre:</Text>
            <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ingrese el nombre"
                placeholderTextColor="#748873"
            />

            <Text style={styles.label}>Dirección:</Text>
            <TextInput
                style={styles.input}
                value={direccion}
                onChangeText={setDireccion}
                placeholder="Ingrese la dirección"
                placeholderTextColor="#748873"
            />

            <Text style={styles.label}>Teléfono:</Text>
            <TextInput
                style={styles.input}
                value={telefono}
                onChangeText={setTelefono}
                placeholder="Ingrese el teléfono"
                keyboardType="phone-pad"
                placeholderTextColor="#748873"
            />

            <Text style={styles.label}>Categoría:</Text>
            <DropDownPicker
                open={openCategoria}
                value={categoria}
                items={categorias}
                setOpen={setOpenCategoria}
                setValue={setCategoria}
                onChangeValue={(value) => fetchProductosPorCategoria(value)}
                placeholder="Seleccione una categoría"
                placeholderStyle={{ color: '#748873' }}
                style={[styles.input, styles.dropdown]}
                dropDownContainerStyle={styles.dropdownContainer}
            />

            <Text style={styles.label}>Producto:</Text>
            <DropDownPicker
                open={openProducto}
                value={producto}
                items={productos}
                setOpen={setOpenProducto}
                setValue={setProducto}
                placeholder="Seleccione un producto"
                placeholderStyle={{ color: '#748873' }}
                style={[styles.input, styles.dropdown]}
                dropDownContainerStyle={styles.dropdownContainer}
            />

            <Text style={styles.label}>Quilates:</Text>
            <TextInput
                style={styles.input}
                value={quilates}
                onChangeText={setQuilates}
                placeholder="Ingrese los quilates"
                keyboardType="numeric"
                placeholderTextColor="#748873"
            />

            <Text style={styles.label}>Precio Total:</Text>
            <TextInput
                style={styles.input}
                value={precioTotal}
                onChangeText={setPrecioTotal}
                placeholder="Ingrese el precio total"
                keyboardType="numeric"
                placeholderTextColor="#748873"
            />

            <Text style={styles.label}>Forma de Pago:</Text>
            <DropDownPicker
                open={openPago}
                value={formaPago}
                items={[
                    { label: 'Diario', value: 'diario' },
                    { label: 'Semanal', value: 'semanal' },
                ]}
                setOpen={setOpenPago}
                setValue={setFormaPago}
                placeholder="Seleccione la forma de pago"
                placeholderStyle={{ color: '#748873' }}
                style={[styles.input, styles.dropdown]}
                dropDownContainerStyle={styles.dropdownContainer}
            />

            <View style={styles.buttonContainer}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#28A745" />
                ) : (
                    <Button title="Agregar Cliente" onPress={handleAddCliente} color="#c9b977" />
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#000',
    },
    title: {
        fontSize: 24,
        color: '#ecdda2',
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    label: {
        fontSize: 16,
        color: '#ecdda2',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#748873',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        color: '#fff',
        backgroundColor: '#1c1c1e',
    },
    dropdown: {
        borderColor: '#748873',
        backgroundColor: '#fff',
    },
    dropdownContainer: {
        backgroundColor: '#fff',
    },
    buttonContainer: {
        marginTop: 20,
    },
});

export default NuevoCliente;
