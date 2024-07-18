import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ClienteCard = ({ cliente, onPress }) => {
    return (
        <View style={[styles.card, cliente.total_multas >= 9 && styles.cardWarning]}>
            <View style={styles.cardContent}>
                <View style={styles.cardTextContent}>
                    <Text style={styles.cardTitle}>{cliente.nombre}</Text>
                    <Text style={styles.cardText}>Monto Actual: {cliente.monto_actual}</Text>
                    <Text style={styles.cardText}>Total de Multas: {cliente.total_multas}</Text>
                </View>
                <TouchableOpacity onPress={onPress} style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>Ver Detalles</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#333',
        borderColor: '#2e5c74',
        borderWidth: 1,
        borderRadius: 8,
        padding: 15,
        marginVertical: 8,
        width: '100%',
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTextContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    cardText: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 5,
    },
    detailsButton: {
        backgroundColor: '#2e5c74',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 4,
    },
    detailsButtonText: {
        color: '#fff',
        fontSize: 12,
    },
});

export default ClienteCard;
