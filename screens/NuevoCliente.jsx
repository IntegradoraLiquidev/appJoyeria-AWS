import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, ActivityIndicator, TouchableOpacity, Animated, Platform, FlatList, Modal,
} from 'react-native';
import axios from 'axios';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingLabelInput from '../components/FloatingLabelInput'; // Ajusta la ruta según tu estructura de proyecto




const NuevoCliente = ({ navigation }) => {
    const [nombre, setNombre] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [producto, setProducto] = useState(null);
    const [categoria, setCategoria] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [productos, setProductos] = useState([]);
    const [precioTotal, setPrecioTotal] = useState('');
    const [formaPago, setFormaPago] = useState('');
    const [abonoInicial, setAbonoInicial] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredCategorias, setFilteredCategorias] = useState([]);
    const [openPago, setOpenPago] = useState(false);
    const [searchProductText, setSearchProductText] = useState(''); // Nuevo estado para buscar productos
    const [filteredProductos, setFilteredProductos] = useState([]);
    const [modalProductosVisible, setModalProductosVisible] = useState(false);



    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await axios.get('http://192.168.1.18:3000/api/categorias');
                setCategorias(response.data);
                setFilteredCategorias(response.data); // Inicializar con todas las categorías
            } catch (error) {
                console.error('Error al cargar categorías:', error);
                Alert.alert('Error', 'No se pudieron cargar las categorías');
            }
        };

        fetchCategorias();
    }, []);

    const fetchProductosPorCategoria = async (categoriaId) => {
        try {
            const response = await axios.get(
                `http://192.168.1.18:3000/api/productos?categoria=${categoriaId}`
            );
            setProductos(response.data);
        } catch {
            Alert.alert('Error', 'No se pudieron cargar los productos');
        }
    };

    const handleSelectCategoria = (id, nombre) => {
        setCategoria(id);
        setSearchText(nombre);
        setModalVisible(false);
        fetchProductosPorCategoria(id);
    };

    const handleSelectProducto = (id, nombre) => {
        setProducto(id);  // Actualizamos el id del producto seleccionado
        setSearchProductText(nombre);  // Actualizamos el texto del producto
        setModalProductosVisible(false);
    };

    const handleSearch = (text) => {
        setSearchText(text);
        const filtered = categorias.filter((cat) =>
            cat.nombre.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredCategorias(filtered);
    };

    const handleSearchProduct = (text) => {
        setSearchProductText(text);
        const filtered = productos.filter((prod) =>
            prod.nombre.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredProductos(filtered);
    };

    useEffect(() => {
        setFilteredProductos(productos); // Inicializar productos filtrados cuando se carguen
    }, [productos]);

    const handleAddCliente = async () => {
        setIsLoading(true);

        // Verifica si los datos están completos
        if (!nombre || !direccion || !telefono || !producto || !precioTotal || !formaPago) {
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
                'http://192.168.1.18:3000/api/clientes',
                {
                    nombre,
                    direccion,
                    telefono,
                    producto_id: producto,
                    precio_total: parseFloat(precioTotal),
                    forma_pago: formaPago,
                    monto_actual: montoActual,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert('Éxito', 'Cliente agregado exitosamente');
            setNombre('');
            setDireccion('');
            setTelefono('');
            setProducto(null);
            setCategoria(null);
            setPrecioTotal('');
            setFormaPago('');
            setAbonoInicial('');
            setProductos([]);
            navigation.goBack();
        } catch (error) {
            console.error('Error al agregar cliente:', error);  // Muestra el error real
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
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >
                <View contentContainerStyle={{ paddingBottom: 20 }}>
                    <View>
                        <Text style={styles.title}>Agregar Cliente</Text>

                        <FloatingLabelInput
                            label="Nombre"
                            value={nombre}
                            onChangeText={setNombre}
                        />
                        <FloatingLabelInput
                            label="Dirección"
                            value={direccion}
                            onChangeText={setDireccion}

                        />
                        <FloatingLabelInput
                            label="Teléfono"
                            value={telefono}
                            onChangeText={setTelefono}
                            keyboardType="phone-pad"

                        />

                        <TouchableOpacity style={styles.inputPicker} onPress={() => setModalVisible(true)}>
                            <Text>{searchText || 'Selecciona una categoría'}</Text>
                        </TouchableOpacity>
                        <Modal visible={modalVisible} animationType="slide">
                            <View style={styles.modalContainer}>
                                <TextInput
                                    style={styles.inputBuscador}
                                    placeholder="Buscar categoría"
                                    value={searchText}
                                    onChangeText={handleSearch}
                                    placeholderTextColor="#d1a980"
                                />
                                <FlatList
                                    data={filteredCategorias}
                                    keyExtractor={(item) => item.id_categoria.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.item}
                                            onPress={() => handleSelectCategoria(item.id_categoria, item.nombre)}
                                        >
                                            <Text style={styles.itemText}>{item.nombre}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                    <Text style={styles.closeButtonText}>Cerrar</Text>
                                </TouchableOpacity>
                            </View>
                        </Modal>


                        <TouchableOpacity style={styles.inputPicker} onPress={() => setModalProductosVisible(true)}>
                            <Text>{producto ? productos.find((p) => p.id_producto === producto)?.nombre : 'Selecciona un producto'}</Text>
                        </TouchableOpacity>

                        <Modal visible={modalProductosVisible} animationType="slide">
                            <View style={styles.modalContainer}>
                                <TextInput
                                    style={styles.inputBuscador}
                                    placeholder="Buscar producto"
                                    value={searchProductText}
                                    onChangeText={handleSearchProduct}
                                    placeholderTextColor="#d1a980"
                                />
                                <FlatList
                                    data={filteredProductos}
                                    keyExtractor={(item) => item.id_producto.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.item}
                                            onPress={() => handleSelectProducto(item.id_producto, item.nombre)}
                                        >
                                            <Text style={styles.itemText}>{item.nombre}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                                <TouchableOpacity onPress={() => setModalProductosVisible(false)} style={styles.closeButton}>
                                    <Text style={styles.closeButtonText}>Cerrar</Text>
                                </TouchableOpacity>
                            </View>
                        </Modal>

                        <FloatingLabelInput
                            label="Precio Total"
                            value={precioTotal}
                            onChangeText={setPrecioTotal}
                            keyboardType="numeric"

                            
                        />
                        <FloatingLabelInput
                            label="Abono Inicial (Opcional)"
                            value={abonoInicial}
                            onChangeText={setAbonoInicial}
                            keyboardType="numeric"

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
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView >
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
    inputPicker: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        color: '#fff',
    },
    inputBuscador: {
        height: 45,
        borderColor: '#707070',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        color: '#d1a980',
        backgroundColor: '#1e1e1e',
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
        elevation: 3,
    },
    modalContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#101010', // Fondo oscuro para el modal
    },
    item: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        color: '#fff', // Cambiado a blanco
    },
    itemText: {
        color: '#fff'// Cambiado a blanco
    },
    closeButton: {
        padding: 10,
        backgroundColor: '#d32f2f', // Rojo oscuro
        borderRadius: 5,
        marginTop: 20,
    },
    closeButtonText: {
        color: '#fff', // Cambiado a blanco
        textAlign: 'center',
    },
    dropdown: {
        marginBottom: 15,
        borderRadius: 10,
        backgroundColor: '#fff',
        color: '#fff',
    },
    dropdownContainer: {
        borderRadius: 10,
        backgroundColor: '#fff',
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
