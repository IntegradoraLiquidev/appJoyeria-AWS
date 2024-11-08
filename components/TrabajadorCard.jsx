import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ClienteCard from './ClienteCard';

const TrabajadorCard = ({ trabajador, navigation }) => {
    const [showClientes, setShowClientes] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.05,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowClientes(!showClientes);
            if (!showClientes) {
                navigation.navigate('TrabajadorClientes', { id: trabajador.id });
            }
        });
    };

    return (
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.row}>
                <Text style={styles.cardName}>{trabajador.nombre}</Text>
            </View>
            <View style={styles.row}>
                <Ionicons name="briefcase" size={24} color="#f5c469" />
                <Text style={styles.cardText}>{trabajador.rol}</Text>
            </View>
            <View style={styles.row}>
                <Ionicons name="people" size={24} color="#f5c469" />
                <Text style={styles.cardText}>{trabajador.cliente_count} Clientes</Text>
            </View>

            <TouchableOpacity onPress={handlePress} style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}> Ver clientes</Text>
            </TouchableOpacity>

            {showClientes && trabajador.clientes && (
                <View style={styles.clientesContainer}>
                    {trabajador.clientes.map(cliente => (
                        <ClienteCard
                            key={cliente.id}
                            cliente={cliente}
                            onPress={() => navigation.navigate('ClienteDetails', { id: cliente.id })}
                        />
                    ))}
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f5c469',
        marginLeft: 8,
    },
    cardText: {
        fontSize: 16,
        color: '#d1d1d1',
        marginLeft: 8,
    },
    detailsButton: {
        backgroundColor: '#d4af37',
        borderRadius: 8,
        paddingVertical: 8,
        marginTop: 15,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    detailsButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    clientesContainer: {
        marginTop: 10,
    },
});

export default TrabajadorCard;
