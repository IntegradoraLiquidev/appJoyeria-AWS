import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import axios from 'axios';

const ListaProductos = ({ route }) => {
    const { id_categoria, nombre } = route.params;
    const [productos, setProductos] = useState([]);
    const [filteredProductos, setFilteredProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await axios.get(`http://192.168.1.65:3000/api/productos/productoCategoria?id_categoria=${id_categoria}`);
                setProductos(response.data);
                setFilteredProductos(response.data); // Inicialmente muestra todos
            } catch (error) {
                console.error('Error al obtener productos:', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProductos();
    }, [id_categoria]);

    const handleSearch = (query) => {
        setSearchQuery(query);

        if (query.trim() === '') {
            setFilteredProductos(productos); // Si no hay texto, muestra todos los productos
        } else {
            const filtered = productos.filter((item) =>
                item.nombre.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredProductos(filtered);
        }
    };

    const renderProducto = ({ item }) => (
        <View style={styles.productCard}>
            <Text style={styles.productName}>{item.nombre}</Text>
            <Text style={styles.productDetail}>Quilates: {item.quilates}</Text>
            <Text style={styles.productDetail}>Precio: ${item.precio}</Text>
            <Text style={styles.productDetail}>Cantidad: {item.cantidad}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lista de {nombre}</Text>

            <TextInput
                style={styles.searchBar}
                placeholder="Buscar productos..."
                value={searchQuery}
                onChangeText={handleSearch}
            />

            <FlatList
                data={filteredProductos}
                keyExtractor={(item) => item.id_producto.toString()}
                renderItem={renderProducto}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    searchBar: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
        borderColor: '#ccc',
        borderWidth: 1,
    },
    listContainer: {
        paddingBottom: 16,
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    productDetail: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ListaProductos;
