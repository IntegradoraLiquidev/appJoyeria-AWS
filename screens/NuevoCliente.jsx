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
    const [precioTotal, setPrecioTotal] = useState(0);
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
    const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await axios.get('http://192.168.1.15:3000/api/categorias');
                setCategorias(response.data);
                setFilteredCategorias(response.data); // Inicializar con todas las categorías
            } catch (error) {
                console.error('Error al cargar categorías:', error);
                Alert.alert('Error', 'No se pudieron cargar las categorías');
            }
        };

        fetchCategorias();
    }, []);

    useEffect(() => {
        const total = productosSeleccionados.reduce(
            (sum, prod) => sum + (parseFloat(prod.precio) || 0) * prod.cantidad,
            0
        );
        setPrecioTotal(total.toFixed(2)); // Asegurar dos decimales
    }, [productosSeleccionados]);



    const fetchProductosPorCategoria = async (categoriaId) => {
        try {
            const response = await axios.get(
                `http://192.168.1.15:3000/api/productos?categoria=${categoriaId}`
            );
            setProductos(response.data);
        } catch {
            Alert.alert('Error', 'No se pudieron cargar los productos');
        }
    };

    const handleSelectCategoria = (id, nombre) => {
        setCategoria({ id, nombre }); // Actualizar el estado con el objeto seleccionado
        if (!categoriasSeleccionadas.some((cat) => cat.id === id)) {
            setCategoriasSeleccionadas([...categoriasSeleccionadas, { id, nombre }]);
        }
        fetchProductosPorCategoria(id); // Cargar productos de la categoría seleccionada
        setModalVisible(false);
    };


    const handleSelectProducto = (id, nombre, precio) => {
        if (!precio) {
            Alert.alert("Error", "El producto seleccionado no tiene un precio válido.");
            return;
        }

        const productoExistente = productosSeleccionados.find((prod) => prod.id === id);

        if (productoExistente) {
            // Incrementar cantidad si el producto ya está seleccionado
            setProductosSeleccionados(
                productosSeleccionados.map((prod) =>
                    prod.id === id ? { ...prod, cantidad: prod.cantidad + 1 } : prod
                )
            );
        } else {
            // Agregar nuevo producto con cantidad inicial de 1
            setProductosSeleccionados([...productosSeleccionados, { id, nombre, precio, cantidad: 1 }]);
        }
        setModalProductosVisible(false);
    };

    const handleChangeCantidadProducto = (id, cambio) => {
        setProductosSeleccionados((prev) =>
            prev
                .map((prod) =>
                    prod.id === id
                        ? { ...prod, cantidad: Math.max(1, prod.cantidad + cambio) } // Asegurar que la cantidad no sea menor a 1
                        : prod
                )
                .filter((prod) => prod.cantidad > 0) // Filtrar productos con cantidad cero (si se permitiera eliminar)
        );
    };

    const handleRemoveProducto = (id) => {
        setProductosSeleccionados(productosSeleccionados.filter((prod) => prod.id !== id));
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
        if (!nombre || !direccion || !telefono || productosSeleccionados.length === 0 || !precioTotal || !formaPago) {
            Alert.alert('Error', 'Por favor, complete todos los campos y seleccione al menos un producto');
            setIsLoading(false);
            return;
        }

        const montoActual = Math.max(0, parseFloat(precioTotal) - (parseFloat(abonoInicial) || 0));


        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) throw new Error('No se encontró un token de autenticación');

            await axios.post(
                'http://192.168.1.15:3000/api/clientes',
                {
                    nombre,
                    direccion,
                    telefono,
                    productos: productosSeleccionados.map((prod) => prod.id), // Enviar IDs de productos seleccionados
                    precio_total: parseFloat(precioTotal),
                    forma_pago: formaPago,
                    monto_actual: montoActual,
                    abono_inicial: parseFloat(abonoInicial) || 0, // Envía el abono inicial
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert('Éxito', 'Cliente agregado exitosamente');
            setNombre('');
            setDireccion('');
            setTelefono('');
            setProductosSeleccionados([]);
            setCategoriasSeleccionadas([]);
            setPrecioTotal('');
            setFormaPago('');
            setAbonoInicial('');
            setProductos([]);
            navigation.goBack();
        } catch (error) {
            console.error('Error al agregar cliente:', error);
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
                        <View>
                            <TouchableOpacity
                                style={styles.inputPicker}
                                onPress={() => {
                                    if (!categoria) {
                                        Alert.alert("Aviso", "Por favor, selecciona una categoría primero.");
                                        return;
                                    }
                                    setModalProductosVisible(true);
                                }}
                            >
                                <Text style={styles.subtitle}>Seleccionar Productos</Text>
                            </TouchableOpacity>

                            {/* Productos seleccionados fuera del TouchableOpacity */}
                            <View style={styles.selectedContainer}>
                                {productosSeleccionados.length > 0 ? (
                                    <FlatList
                                        data={productosSeleccionados}
                                        keyExtractor={(item) => item.id.toString()}
                                        renderItem={({ item }) => (
                                            <View style={styles.selectedItem}>
                                                <Text style={styles.selectedItemText}>
                                                    {item.nombre} - ${item.precio}
                                                </Text>
                                                <View style={styles.quantityControls}>
                                                    <Text style={styles.quantity}>
                                                        {item.cantidad}
                                                    </Text>
                                                    <TouchableOpacity
                                                        style={styles.quantityButton}
                                                        onPress={() => handleChangeCantidadProducto(item.id, -1)}
                                                    >
                                                        <Text style={styles.quantityButtonText}>-</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.quantityButton}
                                                        onPress={() => handleChangeCantidadProducto(item.id, 1)}
                                                    >
                                                        <Text style={styles.quantityButtonText}>+</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.removeButton}
                                                    onPress={() => handleRemoveProducto(item.id)}
                                                >
                                                    <Text style={styles.removeText}>X</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    />
                                ) : (
                                    <Text>No hay productos seleccionados</Text>
                                )}
                            </View>
                        </View>

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
                                            onPress={() => handleSelectProducto(item.id_producto, item.nombre, item.precio)}
                                        >
                                            <Text style={styles.itemText}>{item.nombre} - ${item.precio}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                                <TouchableOpacity onPress={() => setModalProductosVisible(false)} style={styles.closeButton}>
                                    <Text style={styles.closeButtonText}>Cerrar</Text>
                                </TouchableOpacity>
                            </View>
                        </Modal>
                        <View style={styles.priceContainer}>
                            <Text style={styles.priceTotal}>Precio Total: ${precioTotal}</Text>
                        </View>
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
    selectedContainer: {
        backgroundColor: '#1c1c1e', // Fondo oscuro para los productos seleccionados
        borderRadius: 10, // Bordes redondeados
        padding: 10, // Relleno para el contenido interno
        marginTop: 10, // Espacio superior
    },
    selectedItem: {
        flexDirection: 'row', // Los elementos del producto en fila
        alignItems: 'center', // Alineación vertical
        justifyContent: 'space-between', // Espacio entre texto y botones
        backgroundColor: '#2a2a2a', // Fondo oscuro para los productos seleccionados
        borderRadius: 8, // Bordes redondeados
        padding: 10, // Relleno interno
        marginBottom: 8, // Espacio entre los elementos seleccionados
    },
    selectedItemText: {
        flex: 1, // Ocupa todo el espacio disponible
        color: '#fff', // Texto blanco
        fontSize: 13, // Tamaño de fuente adecuado
        fontWeight: '500', // Peso moderado
        marginRight: 10, // Espacio entre texto y botones
    },
    removeButton: {
        backgroundColor: '#e53935', // Rojo brillante para el botón de eliminar
        borderRadius: 5, // Bordes redondeados
        padding: 6, // Relleno interno
    },
    removeText: {
        color: '#fff', // Texto blanco
        fontWeight: 'bold', // Negrita para destacar
        fontSize: 10, // Tamaño adecuado
    },
    quantity:{
        color: '#fff',
        fontSize: 16,
        marginRight: 3
    },
    quantityControls: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between", // Espaciado entre los botones
        backgroundColor: "#1c1c1e", // Fondo oscuro para contraste
        borderRadius: 10,
        paddingHorizontal: 10, // Margen interno
        width: 80, // Ajustar ancho para mantener alineación
    },
    quantityButton: {
        backgroundColor: "#d4af37", // Dorado para los botones
        padding: 6, // Tamaño del botón
        borderRadius: '100%',
        alignItems: "center",
        justifyContent: "center",
    },
    quantityButtonText: {
        color: "#000", // Texto oscuro para contraste
        fontSize: 16,
        fontWeight: "bold",
    },
    priceContainer: {
        backgroundColor: '#1c1c1e', // Fondo oscuro
        borderRadius: 10, // Bordes redondeados
        padding: 10, // Relleno interno
        alignItems: 'center', // Centrar el texto
        marginVertical: 10, // Espacio vertical
    },
    priceTotal: {
        color: '#d4af37', // Dorado para destacar
        fontSize: 18, // Tamaño de fuente más grande
        fontWeight: 'bold', // Negrita para énfasis
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#121212', // Fondo más oscuro para el modal
        padding: 20, // Relleno interno
    },
    item: {
        padding: 15, // Espaciado interno
        borderBottomWidth: 1, // Línea divisoria
        borderBottomColor: '#333', // Color tenue para la línea
        backgroundColor: '#1e1e1e', // Fondo oscuro
        borderRadius: 5, // Bordes redondeados
        marginVertical: 5, // Espaciado entre elementos
    },
    itemText: {
        color: '#f5c469', // Dorado claro
        fontSize: 16, // Tamaño adecuado
        fontWeight: '500', // Peso moderado
    },
    inputBuscador: {
        backgroundColor: '#292929', // Fondo oscuro
        borderRadius: 8, // Bordes redondeados
        paddingHorizontal: 10, // Relleno horizontal
        height: 40, // Altura del input
        color: '#fff', // Texto blanco
        marginBottom: 10, // Espaciado inferior
    },
    closeButton: {
        backgroundColor: '#e53935', // Rojo intenso
        borderRadius: 8, // Bordes redondeados
        paddingVertical: 10, // Espaciado vertical
        alignItems: 'center', // Centrar texto
        marginTop: 20, // Espaciado superior
    },
    closeButtonText: {
        color: '#fff', // Texto blanco
        fontWeight: 'bold', // Negrita para énfasis
        fontSize: 16, // Tamaño adecuado
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
