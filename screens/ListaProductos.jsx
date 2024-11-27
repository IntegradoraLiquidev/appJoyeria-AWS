import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const ListaProductos = ({ route }) => {
    const { id_categoria, nombre } = route.params;
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const navigation = useNavigation();

    // Función para obtener productos
    const fetchProductos = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://192.168.1.15:3000/api/productos/productoCategoria?id_categoria=${id_categoria}`
            );
            setProductos(response.data);
        } catch (error) {
            console.error('Error al obtener productos:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductos();
    }, [id_categoria]);

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const filteredProductos = productos.filter((item) =>
        item.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (productoId) => {
        navigation.navigate('EditarProducto', {
            id_producto: productoId,
            onGoBack: fetchProductos, // Recargar productos al volver
        });
    };

    const handleDeleteConfirmation = (productoId) => {
        Alert.alert(
            'Confirmación',
            '¿Estás seguro de que deseas eliminar este producto?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Eliminar',
                    onPress: () => handleDelete(productoId),
                },
            ],
            { cancelable: true }
        );
    };


    const handleDelete = async (productoId) => {
        try {
            await axios.delete(`http://192.168.1.15:3000/api/productos/${productoId}/eliminarProducto`);
            fetchProductos();
        } catch (error) {
            console.error('Error al eliminar producto:', error.response?.data || error.message);
        }
    };

    const renderProducto = ({ item }) => (
        <View style={styles.productCard}>
            <Text style={styles.productName}>{item.nombre}</Text>
            <View style={styles.detailsContainer}>
                <Text style={styles.productDetail}>Quilates: {item.quilates}</Text>
                <Text style={styles.productDetail}>Precio: ${item.precio}</Text>
                <Text style={styles.productDetail}>Cantidad: {item.cantidad}</Text>
            </View>
            <View style={styles.iconContainer}>
                <TouchableOpacity onPress={() => handleEdit(item.id_producto)}>
                    <Ionicons name="create-outline" size={24} color="#f5c469" style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteConfirmation(item.id_producto)}>
                    <Ionicons name="trash-outline" size={24} color="#f54848" style={styles.icon} />
                </TouchableOpacity>

            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#FFD700" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lista de {nombre}</Text>

            <View style={styles.searchContainer}>
                <Icon name="search" size={24} color="#d1a980" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar productos..."
                    placeholderTextColor="#d1a980"
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>

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
        backgroundColor: '#1e1e1e',
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f5c469',
        marginBottom: 16,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#707070',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        backgroundColor: '#2a2a2a',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
        elevation: 3,
        paddingHorizontal: 8,
    },
    searchIcon: {
        marginHorizontal: 8,
    },
    searchInput: {
        flex: 1,
        color: '#d1a980',
        fontSize: 16,
        paddingVertical: 8,
    },
    listContainer: {
        paddingBottom: 16,
    },
    productCard: {
        backgroundColor: '#3e3e3e',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f5c469',
        marginBottom: 2,
    },
    detailsContainer: {
        marginTop: 8,
    },
    productDetail: {
        fontSize: 16,
        color: '#fff',
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 12,
    },
    icon: {
        marginLeft: 16,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ListaProductos;
