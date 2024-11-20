import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import axios from 'axios';

const VerJoyeria = ({ navigation }) => {
    const [categorias, setCategorias] = useState([]);
    const [filteredCategorias, setFilteredCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await axios.get('http://192.168.1.18:3000/api/categorias');
                setCategorias(response.data);
                setFilteredCategorias(response.data); // Inicializa el filtro con todas las categorías
            } catch (error) {
                console.error('Error al obtener categorías:', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCategorias();
    }, []);

    const handleSearch = (text) => {
        setSearchText(text);
        if (text) {
            const filteredData = categorias.filter((item) => 
                item.nombre.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredCategorias(filteredData);
        } else {
            setFilteredCategorias(categorias); // Restablece todas las categorías cuando no hay búsqueda
        }
    };

    const renderCategoria = ({ item }) => (
        <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => navigation.navigate('Productos', { id_categoria: item.id_categoria, nombre: item.nombre })}
        >
            <Text style={styles.categoryButtonText}>{item.nombre}</Text>
        </TouchableOpacity>
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
            <Text style={styles.title}>Categorías de Joyería</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar categoría..."
                value={searchText}
                onChangeText={handleSearch}
            />
            <FlatList
                data={filteredCategorias}
                keyExtractor={(item) => item.id_categoria.toString()}
                renderItem={renderCategoria}
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
    searchInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingLeft: 10,
        marginBottom: 16,
    },
    listContainer: {
        paddingBottom: 16,
    },
    categoryButton: {
        backgroundColor: '#007bff',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    categoryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default VerJoyeria;
