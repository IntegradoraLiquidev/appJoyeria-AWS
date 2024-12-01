import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, FlatList, TouchableOpacity, Modal } from 'react-native';
import FloatingLabelInput from '../components/FloatingLabelInput'; // Importa el componente reutilizable
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importar el ícono

const AgregarProductoScreen = () => {
    const [categorias, setCategorias] = useState([]);
    const [nombreProducto, setNombreProducto] = useState('');
    const [quilates, setQuilates] = useState('');
    const [precio, setPrecio] = useState('');
    const [idCategoria, setIdCategoria] = useState('');
    const [nombreCategoria, setNombreCategoria] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredCategorias, setFilteredCategorias] = useState([]);
    const [cantidad, setCantidad] = useState('');


    useEffect(() => {
        fetch('https://8oj4qmf2y4.execute-api.us-east-1.amazonaws.com/categorias')
            .then((response) => response.json())
            .then((data) => {
                setCategorias(data);
                setFilteredCategorias(data);
            })
            .catch((error) => console.error('Error al obtener las categorías:', error));
    }, []);

    const handleAgregarProducto = () => {
        if (!nombreProducto || !quilates || !precio || !idCategoria) {
            Alert.alert('Error', 'Por favor, completa todos los campos del producto.');
            return;
        }

        fetch('https://8oj4qmf2y4.execute-api.us-east-1.amazonaws.com/productos/agregar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: nombreProducto,
                quilates: parseInt(quilates),
                precio: parseFloat(precio),
                id_categoria: parseInt(idCategoria),
                cantidad: parseInt(cantidad),
            }),
        })
            .then((response) => response.json())
            .then(() => {
                Alert.alert('Éxito', 'Producto agregado exitosamente.');
                setNombreProducto('');
                setQuilates('');
                setPrecio('');
                setIdCategoria('');
                setCantidad(''); // Reinicia la cantidad
            })
            .catch((error) => console.error('Error al agregar el producto:', error));

    };

    const handleAgregarCategoria = () => {
        if (!nombreCategoria) {
            Alert.alert('Error', 'Por favor, ingresa un nombre para la categoría.');
            return;
        }

        fetch('https://8oj4qmf2y4.execute-api.us-east-1.amazonaws.com/categorias/agregar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombreCategoria }),
        })
            .then((response) => response.json())
            .then((data) => {
                Alert.alert('Éxito', 'Categoría agregada exitosamente.');
                setCategorias((prevCategorias) => [...prevCategorias, data]);
                setFilteredCategorias((prevCategorias) => [...prevCategorias, data]);
                setNombreCategoria('');
            })
            .catch((error) => console.error('Error al agregar la categoría:', error));
    };

    const handleSearch = (text) => {
        setSearchText(text);
        const filtered = categorias.filter((categoria) =>
            categoria.nombre.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredCategorias(filtered);
    };

    const handleSelectCategoria = (id, nombre) => {
        setIdCategoria(id);
        setSearchText(nombre);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Agregar Producto</Text>

            <FloatingLabelInput
                label="Nombre del producto"
                value={nombreProducto}
                onChangeText={setNombreProducto}
            />
            <FloatingLabelInput
                label="Quilates"
                value={quilates}
                onChangeText={setQuilates}
                keyboardType="numeric"
            />
            <FloatingLabelInput
                label="Precio"
                value={precio}
                onChangeText={setPrecio}
                keyboardType="numeric"
            />
            <FloatingLabelInput
                label="Cantidad"
                value={cantidad}
                onChangeText={setCantidad}
                keyboardType="numeric"
            />

            <TouchableOpacity
                style={[styles.input, styles.dropdown]}
                onPress={() => setModalVisible(true)}
            >
                <View style={styles.dropdownContainer}>
                    <Text style={styles.dropdownText}>
                        {searchText || 'Selecciona una categoría'}
                    </Text>
                    <Icon name="keyboard-arrow-down" size={24} color="#ccc" />
                </View>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <FloatingLabelInput
                        label="Buscar categoría"
                        value={searchText}
                        onChangeText={handleSearch}
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
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.buttonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <TouchableOpacity style={styles.button} onPress={handleAgregarProducto}>
                <Text style={styles.buttonText}>Agregar Producto</Text>
            </TouchableOpacity>

            <Text style={styles.subtitle}>Agregar Nueva Categoría</Text>
            <FloatingLabelInput
                label="Nombre de la categoría"
                value={nombreCategoria}
                onChangeText={setNombreCategoria}
            />
            <TouchableOpacity style={styles.button} onPress={handleAgregarCategoria}>
                <Text style={styles.buttonText}>Agregar Categoría</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#101010' },
    header: { fontSize: 28, fontWeight: 'bold', color: '#f5c469', textAlign: 'center', marginBottom: 20 },
    dropdown: { justifyContent: 'center' },
    dropdownText: { color: '#ccc' },
    button: { backgroundColor: '#d4af37', padding: 12, borderRadius: 10, alignItems: 'center', marginVertical: 10 },
    buttonText: { color: '#000', fontWeight: 'bold', fontSize: 18 },
    subtitle: { fontSize: 20, fontWeight: 'bold', color: '#f5c469', marginTop: 20, textAlign: 'center' },
    modalContainer: { flex: 1, padding: 20, backgroundColor: '#101010' },
    item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#303030' },
    itemText: { color: '#fff' },
    dropdown: {
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#404040',
        borderRadius: 8,
        padding: 12,
        marginVertical: 8,
    },
    dropdownContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        color: '#000',
        fontSize: 16,
    },

});

export default AgregarProductoScreen;
