import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ClienteCard = ({ cliente, onPress, isAdmin, onEdit }) => {
    return (
        <View style={[styles.card, cliente.total_multas >= 9 && styles.cardWarning]}>
            <Text style={styles.cardText}>Nombre: {cliente.nombre}</Text>
            <Text style={styles.cardText}>Monto Actual: {cliente.monto_actual}</Text>
            <Text style={styles.cardText}>Total de Multas: {cliente.total_multas}</Text>
            <Button title="Ver Detalles" onPress={onPress} />
            {isAdmin && (
                <TouchableOpacity onPress={onEdit} style={styles.editButton}>
                    <Icon name="edit" size={24} color="black" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        elevation: 3,
        position: 'relative',
    },
    cardWarning: {
        backgroundColor: '#ffcccc', // Rojo pastel
    },
    cardText: {
        fontSize: 16,
        marginBottom: 5,
    },
    editButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
});

export default ClienteCard;
