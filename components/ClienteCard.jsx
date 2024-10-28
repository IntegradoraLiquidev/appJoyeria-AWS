import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ClienteCard = ({ cliente, onPress, isAdmin, onEdit, onDelete, onExport }) => {
    return (
        <View style={[styles.card, cliente.forma_pago >= 9 && styles.cardWarning]}>
            <Text style={styles.cardText}>Nombre: {cliente.nombre}</Text>

            <Text style={styles.cardText}>A pagar: {cliente.monto_actual}</Text>
            <Text style={styles.cardText}>Forma de pago: {cliente.forma_pago}</Text>
            <View style={styles.buttonContainer}>
                <Button title="Ver Detalles" onPress={onPress} color="#007BFF" />
            </View>
            {isAdmin && (
                <View style={styles.actionsContainer}>
                    <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                        <Icon name="edit" size={35} color="#2e5c74" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(cliente)} style={styles.actionButton}>
                        <Icon name="delete" size={35} color="#e74c3c" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onExport(cliente)} style={styles.actionButton}>
                        <Icon name="download" size={35} color="#3498db" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#E8E8E8', 
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        marginTop: 10,
        elevation: 3,
        position: 'relative',
    },
    cardWarning: {
        backgroundColor: '#b22222',
    },
    cardText: {
        fontSize: 16,
        color: '#000',
        marginBottom: 10,
        padding: 2,
    },
    buttonContainer: {
        width: 150,
        marginTop: 10,
        margin: 'auto',
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
