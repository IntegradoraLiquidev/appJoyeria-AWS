import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

const EditarProducto = ({ route, navigation }) => {
    const { id_producto, onGoBack } = route.params; // Recibir el callback desde la navegación
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducto = async () => {
            try {
                const response = await axios.get(`https://8oj4qmf2y4.execute-api.us-east-1.amazonaws.com/productos/id_producto?id=${id_producto}`);
                setProducto(response.data);
            } catch (error) {
                console.error('Error al obtener el producto:', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducto();
    }, [id_producto]);

    const handleSave = async () => {
        try {
            await axios.put(`https://8oj4qmf2y4.execute-api.us-east-1.amazonaws.com/productos/editar?id_producto=${id_producto}`, producto);
            alert('Producto actualizado con éxito');
            if (onGoBack) onGoBack(); // Llamar al callback para actualizar la lista
            navigation.goBack();
        } catch (error) {
            console.error('Error al actualizar el producto:', error.response?.data || error.message);
            alert('Hubo un error al actualizar el producto');
        }
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <Text style={styles.loaderText}>Cargando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Editar Producto</Text>
            <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={producto.nombre}
                onChangeText={(text) => setProducto({ ...producto, nombre: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Quilates"
                value={producto.quilates?.toString()}
                keyboardType="numeric"
                onChangeText={(text) => setProducto({ ...producto, quilates: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Precio"
                value={producto.precio?.toString()}
                keyboardType="numeric"
                onChangeText={(text) => setProducto({ ...producto, precio: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Cantidad"
                value={producto.cantidad?.toString()}
                keyboardType="numeric"
                onChangeText={(text) => setProducto({ ...producto, cantidad: text })}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#1e1e1e',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f5c469',
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#3e3e3e',
        borderRadius: 8,
        color: '#fff',
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
    },
    saveButton: {
        backgroundColor: '#f5c469',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#1e1e1e',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        color: '#fff',
        fontSize: 18,
    },
});

export default EditarProducto;
