import React from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';

const EliminarTrabajador = ({ navigation }) => {
    // Función para manejar la eliminación del trabajador
    const eliminarTrabajador = () => {
        // Lógica para eliminar el trabajador (puedes implementar llamadas a API aquí)
        // Por ejemplo, enviar una solicitud DELETE a la API
        Alert.alert('Trabajador eliminado correctamente');
        // Navegar de vuelta a la pantalla anterior después de la eliminación
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.message}>
                ¿Está seguro que desea eliminar este trabajador?
            </Text>
            <Button title="Eliminar Trabajador" onPress={eliminarTrabajador} color="red" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    message: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
    },
});

export default EliminarTrabajador;
