import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ClienteCard = ({ cliente, onPress, isAdmin, onEdit, onDelete, onExport }) => {
    return (
        <View style={[styles.card, cliente.total_multas >= 9 && styles.cardWarning]}>
            <Text style={styles.cardText}>Nombre: {cliente.nombre}</Text>
            <Text style={styles.cardText}>Monto Actual: {cliente.monto_actual}</Text>
            <Text style={styles.cardText}>Total de Multas: {cliente.total_multas}</Text>
            <Button title="Ver Detalles" onPress={onPress} color="#2e5c74" />
            {isAdmin && (
                <View style={styles.actionsContainer}>
                    <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                        <Icon name="edit" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(cliente)} style={styles.actionButton}>
                        <Icon name="delete" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onExport(cliente)} style={styles.actionButton}>
                        <Icon name="file-download" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#444', // Fondo oscuro
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        elevation: 3,
        position: 'relative',
    },
    cardWarning: {
        backgroundColor: '#b22222', // Rojo más oscuro
    },
    cardText: {
        fontSize: 16,
        color: '#fff', // Texto blanco
        marginBottom: 5,
    },
    actionsContainer: {
        flexDirection: 'row',
        position: 'absolute',
        top: 10,
        right: 10,
    },
    actionButton: {
        marginLeft: 10,
    },
});

export default ClienteCard;
