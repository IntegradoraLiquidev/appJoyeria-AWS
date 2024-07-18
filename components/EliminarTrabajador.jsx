import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';

const EliminarTrabajador = ({ navigation }) => {
    // Función para manejar la eliminación del trabajador
    const eliminarTrabajador = () => {
        // Lógica para eliminar el trabajador
        Alert.alert('Trabajador eliminado correctamente');
        // Navegar de vuelta a la pantalla anterior después de la eliminación
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.message}>
                ¿Está seguro que desea eliminar este trabajador?
            </Text>
            <TouchableOpacity style={styles.deleteButton} onPress={eliminarTrabajador}>
                <Text style={styles.deleteButtonText}>Eliminar Trabajador</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#1c1c1e', // Fondo oscuro
    },
    message: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        color: '#fff', // Color de texto
    },
    deleteButton: {
        backgroundColor: '#ff4757', // Color del botón eliminar
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
    },
    deleteButtonText: {
        color: '#fff', // Color del texto del botón
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cancelButton: {
        backgroundColor: '#ccc', // Color del botón cancelar
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%',
    },
    cancelButtonText: {
        color: '#000', // Color del texto del botón cancelar
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default EliminarTrabajador;
