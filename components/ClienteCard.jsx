import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ClienteCard = ({ cliente, onPress, isAdmin, onEdit, onDelete, onExport }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const calcularDiasRestantes = (fechaProximoPago) => {
        const hoy = new Date();
        const proximoPago = new Date(fechaProximoPago);
        const diferenciaTiempo = proximoPago - hoy;
        const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

        if (diasRestantes === 0) return { texto: "Hoy es el día de pago", esAtrasado: false };
        if (diasRestantes === 1) return { texto: "Mañana es el día de pago", esAtrasado: false };
        if (diasRestantes < 0) return { texto: `Atrasado ${Math.abs(diasRestantes)} día(s)`, esAtrasado: true };

        return { texto: `Faltan ${diasRestantes} días para el pago`, esAtrasado: false };
    };

    const handlePress = () => {
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

    // Handlers for ClienteCard actions
    const handleEdit = (cliente) => {
        console.log(`Editando cliente con ID: ${cliente.id_cliente}`);
        // Implementa la lógica para editar el cliente
    };

    const handleDelete = () => {
        onDelete(cliente.id_cliente); // Pasa solo el ID
    };

    const handleExport = (cliente) => {
        console.log(`Exportando datos de cliente con ID: ${cliente.id_cliente}`);
        // Implementa la lógica para exportar los datos del cliente
    };


    const { texto: etiquetaPago, esAtrasado } = calcularDiasRestantes(cliente.fecha_proximo_pago);

    return (
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
            {cliente.fecha_proximo_pago && (
                <View style={styles.paymentDateTagContainer}>
                    <View style={[styles.paymentDateTagCut, esAtrasado && styles.atrasadoTagCut]} />
                    <View style={[styles.paymentDateTag, esAtrasado && styles.atrasadoTag]}>
                        <Text style={[styles.paymentDateText, esAtrasado && styles.atrasadoText]}>
                            {etiquetaPago}
                        </Text>
                    </View>
                </View>
            )}

            <Text style={styles.cardName}>{cliente.nombre}</Text>
            <View style={styles.infoContainer}>
                <Icon name="location-on" size={18} color="#f5c469" />
                <Text style={styles.cardText}>{cliente.direccion}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Icon name="phone" size={18} color="#f5c469" />
                <Text style={styles.cardText}>{cliente.telefono}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Icon name="attach-money" size={18} color="#f5c469" />
                <Text style={styles.cardAmountText}>Por pagar: {cliente.monto_actual}</Text>
            </View>

            <TouchableOpacity onPress={handlePress} style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>Ver Detalles</Text>
            </TouchableOpacity>

            {isAdmin && (
                <View style={styles.actionsContainer}>
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity onPress={() => onEdit(cliente)} style={styles.actionButton}>
                            <Icon name="edit" size={28} color="#8ecae6" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                            <Icon name="delete" size={28} color="#e63946" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleExport(cliente)} style={styles.actionButton}>
                            <Icon name="download" size={28} color="#06d6a0" />
                        </TouchableOpacity>
                    </View>

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
        position: 'relative',
    },
    paymentDateTagContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentDateTagCut: {
        width: 0,
        height: 0,
        borderTopWidth: 10,
        borderTopColor: 'transparent',
        borderBottomWidth: 10,
        borderBottomColor: 'transparent',
        borderRightWidth: 10,
        borderRightColor: '#f5c469', // Color por defecto
    },
    atrasadoTagCut: {
        borderRightColor: '#ff4d4d', // Color rojo si está atrasado
    },
    paymentDateTag: {
        backgroundColor: '#f5c469',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        paddingVertical: 4,
        paddingHorizontal: 8,
        zIndex: 1,
    },
    atrasadoTag: {
        backgroundColor: '#ff4d4d',
    },
    paymentDateText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12,
    },
    atrasadoText: {
        color: '#fff',
    },
    cardName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f5c469',
        marginBottom: 12,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    cardText: {
        fontSize: 15,
        color: '#d1d1d1',
        marginLeft: 5,
    },
    cardAmountText: {
        fontSize: 17,
        color: '#d1d1d1',
        fontWeight: 'bold',
        marginLeft: 5,
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
