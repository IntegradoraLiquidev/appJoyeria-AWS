import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ClienteCard from './ClienteCard';
import axios from 'axios';

const TrabajadorCard = ({ trabajador, navigation, onDelete }) => {
    const [showClientes, setShowClientes] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]).start(() => {
            setShowClientes(!showClientes);
            if (!showClientes) {
                navigation.navigate('TrabajadorClientes', { id: trabajador.id });
            }
        });
    };

    const handleEdit = () => {
        console.log(`Editando trabajador con id: ${trabajador.id}`);
    };

    const handleDelete = () => {
        Alert.alert(
            "Eliminar Trabajador",
            "¿Estás seguro de que deseas eliminar a este trabajador?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    onPress: () => {
                        axios.delete(`http://192.168.1.21:3000/api/trabajadores/eliminar/${trabajador.id_usuario}`)
                            .then(response => {
                                console.log(response.data.message);
                                Alert.alert("Éxito", "Trabajador eliminado exitosamente");
                                onDelete(trabajador.id_usuario); // Actualiza la lista
                            })
                            .catch(error => {
                                const errorMessage = error.response?.data?.message || 'Error desconocido al eliminar el trabajador';
                                console.error("Error al eliminar el trabajador:", errorMessage);
                                Alert.alert("Error", errorMessage);
                            });
                    },
                    style: "destructive"
                }
            ]
        );
    };
    
    

    const handleExport = () => {
        console.log(`Exportando datos del trabajador con id: ${trabajador.id}`);
    };

    return (
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.header}>
                <Text style={styles.cardName}>{trabajador.nombre}</Text>
                <View style={styles.iconContainer}>
                    <TouchableOpacity style={styles.iconButton} onPress={handleEdit}>
                        <Ionicons name="pencil" size={23} color="#4a90e2" /> 
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
                        <Ionicons name="trash" size={23} color="#e74c3c" /> 
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={handleExport}>
                        <Ionicons name="download" size={23} color="#27ae60" /> 
                    </TouchableOpacity>
                </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconContainer: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardName: {
        fontSize: 23,
        fontWeight: 'bold',
        color: '#f5c469',
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
