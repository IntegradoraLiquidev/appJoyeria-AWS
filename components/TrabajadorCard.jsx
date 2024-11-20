import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const TrabajadorCard = ({ trabajador, navigation, onDelete, onEdit }) => {
    const [showClientes, setShowClientes] = useState(false);
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const popAnim = useRef(new Animated.Value(0)).current;

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]).start(() => {
            setShowClientes(!showClientes);
            if (!showClientes) {
                navigation.navigate('TrabajadorClientes', { id: trabajador.id_usuario });
            }
        });
    };

    const handleEdit = () => {
        navigation.navigate('EditarTrabajador', { trabajador, onEdit });
    };

    const handleDeleteModalOpen = () => {
        setDeleteModalVisible(true);
        Animated.spring(popAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    };

    const handleDeleteModalClose = () => {
        Animated.spring(popAnim, { toValue: 0, friction: 9, useNativeDriver: true }).start(() => {
            setDeleteModalVisible(false);
        });
    };

    const confirmDelete = () => {
        axios.delete(`http://192.168.1.18:3000/api/trabajadores/eliminar/${trabajador.id_usuario}`)
            .then(response => {
                handleDeleteModalClose();
                onDelete(trabajador.id_usuario);
            })
            .catch(error => {
                const errorMessage = error.response?.data?.message || 'Error desconocido al eliminar el trabajador';
                console.error(errorMessage);
            });
    };

    const handleExport = () => {
        console.log(`Exportando datos del trabajador con id: ${trabajador.id}`);
    };

    return (
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.header}>
                <Text style={styles.cardName}>{trabajador.nombre} {trabajador.apellidos}</Text>
                <View style={styles.iconContainer}>
                    <TouchableOpacity style={styles.iconButton} onPress={handleEdit}>
                        <Ionicons name="pencil" size={23} color="#4a90e2" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={handleDeleteModalOpen}>
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

            <Modal
                transparent
                visible={isDeleteModalVisible}
                animationType="fade"
            >
                <View style={styles.modalContainer}>
                    <Animated.View style={[styles.modalContent, { transform: [{ scale: popAnim }] }]}>
                        <Text style={styles.modalTitle}>Eliminar Trabajador</Text>
                        <Text style={styles.modalText}>¿Estás seguro de que deseas eliminar a este trabajador?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalButtonCancel} onPress={handleDeleteModalClose}>
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButtonDelete} onPress={confirmDelete}>
                                <Text style={styles.modalButtonText}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
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
        fontSize: 20,
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
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#333',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f5c469',
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButtonCancel: {
        backgroundColor: '#888',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginRight: 5,
        alignItems: 'center',
    },
    modalButtonDelete: {
        backgroundColor: '#e74c3c',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default TrabajadorCard;
