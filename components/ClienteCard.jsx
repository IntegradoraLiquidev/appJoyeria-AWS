import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ClienteCard = ({ cliente, onPress, isAdmin, onEdit, onDelete, onExport }) => {
    const [proximaFechaPago, setProximaFechaPago] = useState('');

    useEffect(() => {
        calcularProximaFechaPago();
    }, [cliente]);

    const calcularProximaFechaPago = () => {
        // Usamos la fecha de creación o una fecha predeterminada si ambas son inválidas.
        const ultimaFecha = cliente.ultimaFechaAbono 
            ? new Date(Date.parse(cliente.ultimaFechaAbono)) 
            : cliente.fecha_creacion
            ? new Date(Date.parse(cliente.fecha_creacion))
            : new Date(); // Si ambas fechas están ausentes, usa la fecha actual como base.

        if (isNaN(ultimaFecha.getTime())) {
            console.error("Fecha inválida en el cliente:", cliente);
            setProximaFechaPago("Fecha inválida");
            return;
        }

        let diasIncremento = cliente.forma_pago.toLowerCase() === 'semanal' ? 7 : 1;
        const proximaFecha = new Date(ultimaFecha);
        proximaFecha.setDate(proximaFecha.getDate() + diasIncremento);

        const hoy = new Date();
        const diferenciaDias = Math.ceil((proximaFecha - hoy) / (1000 * 60 * 60 * 24));

        if (diferenciaDias === 0) {
            setProximaFechaPago("Hoy");
        } else if (cliente.forma_pago.toLowerCase() === 'diario' && diferenciaDias === 1) {
            setProximaFechaPago("Mañana");
        } else if (cliente.forma_pago.toLowerCase() === 'semanal') {
            setProximaFechaPago(`Faltan ${diferenciaDias} días`);
        } else {
            setProximaFechaPago(`Faltan ${diferenciaDias} días`);
        }
    };

    return (
        <View style={[styles.card, cliente.forma_pago >= 9 && styles.cardWarning]}>
            <Text style={styles.cardText}>Nombre: {cliente.nombre}</Text>
            <Text style={styles.cardText}>A pagar: {cliente.monto_actual}</Text>
            <Text style={styles.cardText}>Forma de pago: {cliente.forma_pago}</Text>
            <Text style={styles.cardText}>Próximo pago: {proximaFechaPago}</Text>

            <TouchableOpacity onPress={onPress} style={styles.detailsButton}>
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
        </View>
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
    cardWarning: {
        backgroundColor: '#b22222',
    },
    cardText: {
        fontSize: 16,
        color: '#d1d1d1',
        marginBottom: 8,
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
