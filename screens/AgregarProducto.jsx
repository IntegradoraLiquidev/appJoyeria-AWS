import React, { useState, useEffect } from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert, FlatList, TouchableOpacity, Modal} from 'react-native';

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

    useEffect(() => {
        fetch('http://192.168.1.65:3000/api/categorias/')
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

        fetch('http://192.168.1.65:3000/api/productos/agregarProducto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: nombreProducto,
                quilates: parseInt(quilates),
                precio: parseFloat(precio),
                id_categoria: parseInt(idCategoria),
            }),
        })
            .then((response) => response.json())
            .then(() => {
                Alert.alert('Éxito', 'Producto agregado exitosamente.');
                setNombreProducto('');
                setQuilates('');
                setPrecio('');
                setIdCategoria('');
            })
            .catch((error) => console.error('Error al agregar el producto:', error));
    };

    const handleAgregarCategoria = () => {
        if (!nombreCategoria) {
            Alert.alert('Error', 'Por favor, ingresa un nombre para la categoría.');
            return;
        }

        fetch('http://192.168.1.65:3000/api/categorias/agregarCategoria', {
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
            <Text style={styles.title}>Agregar Producto</Text>
            <TextInput
                style={styles.input}
                placeholder="Nombre del producto"
                value={nombreProducto}
                onChangeText={setNombreProducto}
            />
            <TextInput
                style={styles.input}
                placeholder="Quilates"
                value={quilates}
                onChangeText={setQuilates}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Precio"
                value={precio}
                onChangeText={setPrecio}
                keyboardType="numeric"
            />
            <TouchableOpacity
                style={styles.input}
                onPress={() => setModalVisible(true)}
            >
                <Text>{searchText || 'Selecciona una categoría'}</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Buscar categoría"
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
                                <Text>{item.nombre}</Text>
                            </TouchableOpacity>
                        )}
                    />
                    <Button title="Cerrar" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>

            <Button title="Agregar Producto" onPress={handleAgregarProducto} />

            <Text style={styles.subtitle}>Agregar Nueva Categoría</Text>
            <TextInput
                style={styles.input}
                placeholder="Nombre de la categoría"
                value={nombreCategoria}
                onChangeText={setNombreCategoria}
            />
            <Button title="Agregar Categoría" onPress={handleAgregarCategoria} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 30, marginBottom: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 15 },
    modalContainer: { flex: 1, padding: 20 },
    item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
});

export default AgregarProductoScreen;
