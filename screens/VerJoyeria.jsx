import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
                setFilteredCategorias(response.data);
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
            setFilteredCategorias(categorias);
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
            <View style={styles.searchContainer}>
                <Icon name="search" size={24} color="#d1a980" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar categoría..."
                    placeholderTextColor="#d1a980"
                    value={searchText}
                    onChangeText={handleSearch}
                />
            </View>
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
        backgroundColor: '#1e1e1e',
        padding: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 16,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#707070',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 20,
        backgroundColor: '#1e1e1e',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
        elevation: 3,
    },
    searchIcon: {
        marginHorizontal: 10,
    },
    searchInput: {
        flex: 1,
        color: '#d1a980',
        fontSize: 16,
        paddingVertical: 10,
    },
    listContainer: {
        paddingBottom: 16,
    },
    categoryButton: {
        backgroundColor: '#d4af37',
        borderRadius: 6,
        paddingVertical: 15,
        paddingHorizontal: 6,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    categoryButtonText: {
        color: '#1e1e1e',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default VerJoyeria;
