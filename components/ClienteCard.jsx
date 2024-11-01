import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ClienteCard = ({ cliente, onPress, isAdmin, onEdit, onDelete, onExport }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        // Efecto de "pop" en el botón de "Ver Detalles"
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.02,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onPress();
        });
    };

    return (
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.cardName}>{cliente.nombre}</Text>
            <Text style={styles.cardText}>Dirección: {cliente.direccion}</Text>
            <Text style={styles.cardText}>Teléfono: {cliente.telefono}</Text>
            <Text style={styles.cardText}>Por pagar: {cliente.monto_actual}</Text>
            <Text style={styles.cardText}>
                Próximo pago: {cliente.fecha_proximo_pago ? new Date(cliente.fecha_proximo_pago).toLocaleDateString('es-ES') : 'No disponible'}
            </Text>

            <TouchableOpacity onPress={handlePress} style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>Ver Detalles</Text>
            </TouchableOpacity>

            {isAdmin && (
                <View style={styles.actionsContainer}>
                    <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                        <Icon name="edit" size={28} color="#8ecae6" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(cliente)} style={styles.actionButton}>
                        <Icon name="delete" size={28} color="#e63946" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onExport(cliente)} style={styles.actionButton}>
                        <Icon name="download" size={28} color="#06d6a0" />
                    </TouchableOpacity>
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 20,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    cardName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f5c469',
        marginBottom: 12,
        letterSpacing: 3,
    },
    cardText: {
        fontSize: 16,
        color: '#d1d1d1',
        marginBottom: 8,
        fontWeight: 'bold',
    },
    detailsButton: {
        backgroundColor: '#d4af37',
        borderRadius: 8,
        paddingVertical: 10,
        marginTop: 15,
        alignItems: 'center',
    },
    detailsButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    actionButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#2e2e38',
    },
});

export default ClienteCard;
