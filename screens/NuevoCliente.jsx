import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, StyleSheet, Alert, ScrollView, ActivityIndicator, TouchableOpacity, Animated,
} from 'react-native';
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
    const [abonoInicial, setAbonoInicial] = useState('');
    const [openCategoria, setOpenCategoria] = useState(false);
    const [openProducto, setOpenProducto] = useState(false);
    const [openPago, setOpenPago] = useState(false);

    // Animación para el botón
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

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
                Alert.alert('Error', 'No se pudieron cargar las categorías');
            }
        };

        fetchCategorias();
    }, []);

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
        } catch {
            Alert.alert('Error', 'No se pudieron cargar los productos');
        }
    };

    const handleAddCliente = async () => {
        setIsLoading(true);
        if (!nombre || !direccion || !telefono || !producto || !quilates || !precioTotal || !formaPago) {
            Alert.alert('Error', 'Por favor, complete todos los campos');
            setIsLoading(false);
            return;
        }

        const montoActual = abonoInicial
            ? Math.max(0, parseFloat(precioTotal) - parseFloat(abonoInicial))
            : parseFloat(precioTotal);

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) throw new Error('No se encontró un token de autenticación');

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
                    monto_actual: montoActual,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert('Éxito', 'Cliente agregado exitosamente');

            // Resetear los campos después de agregar el cliente
            setNombre('');
            setDireccion('');
            setTelefono('');
            setProducto(null);
            setCategoria(null);
            setQuilates('');
            setPrecioTotal('');
            setFormaPago('');
            setAbonoInicial('');
            setProductos([]);  // Limpiar productos si es necesario

            // Navegar de regreso (opcional)
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Hubo un problema al agregar el cliente');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePressIn = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0.8,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => handleAddCliente());
    };

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Agregar Cliente</Text>

            <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre"
                placeholderTextColor="#999"
            />

            <TextInput
                style={styles.input}
                value={direccion}
                onChangeText={setDireccion}
                placeholder="Dirección"
                placeholderTextColor="#999"
            />

            <TextInput
                style={styles.input}
                value={telefono}
                onChangeText={setTelefono}
                placeholder="Teléfono"
                keyboardType="phone-pad"
                placeholderTextColor="#999"
            />

            <View style={{ zIndex: 100 }}>
                <DropDownPicker
                    open={openCategoria}
                    value={categoria}
                    items={categorias}
                    setOpen={setOpenCategoria}
                    setValue={setCategoria}
                    onChangeValue={fetchProductosPorCategoria}
                    placeholder="Categoría"
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                />
            </View>

            <View style={{ zIndex: 90 }}>
                <DropDownPicker
                    open={openProducto}
                    value={producto}
                    items={productos}
                    setOpen={setOpenProducto}
                    setValue={setProducto}
                    placeholder="Producto"
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                />
            </View>

            <TextInput
                style={styles.input}
                value={quilates}
                onChangeText={setQuilates}
                placeholder="Quilates"
                keyboardType="numeric"
                placeholderTextColor="#999"
            />

            <TextInput
                style={styles.input}
                value={precioTotal}
                onChangeText={setPrecioTotal}
                placeholder="Precio Total"
                keyboardType="numeric"
                placeholderTextColor="#999"
            />

            <TextInput
                style={styles.input}
                value={abonoInicial}
                onChangeText={setAbonoInicial}
                placeholder="Abono Inicial (Opcional)"
                keyboardType="numeric"
                placeholderTextColor="#999"
            />

            <DropDownPicker
                open={openPago}
                value={formaPago}
                items={[
                    { label: 'Diario', value: 'diario' },
                    { label: 'Semanal', value: 'semanal' },
                ]}
                setOpen={setOpenPago}
                setValue={setFormaPago}
                placeholder="Forma de Pago"
                style={[styles.dropdown, openPago && { zIndex: 80 }]}
                dropDownContainerStyle={[styles.dropdownContainer, { zIndex: 80 }]}
            />

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
                            <Text style={styles.buttonText}>Agregar Cliente</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>
        </ScrollView>
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

export default NuevoCliente;
