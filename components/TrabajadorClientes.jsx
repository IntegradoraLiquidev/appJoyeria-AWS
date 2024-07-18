import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import EditarTrabajador from './EditarTrabajador';

const TrabajadorCard = ({ trabajador, navigation, onDelete }) => {
    const [showClientes, setShowClientes] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSave = async (updatedWorker) => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:3000/trabajadores/${trabajador.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedWorker),
            });

            if (response.ok) {
                setIsEditing(false);
            } else {
                console.error('Error actualizando trabajador:', response.statusText);
            }
        } catch (error) {
            console.error('Error actualizando trabajador:', error);
        }
    };

    const eliminarTrabajador = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:3000/trabajadores/${trabajador.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.ok) {
                Alert.alert('Trabajador eliminado correctamente');
                setIsDeleting(false);
                if (onDelete) onDelete(trabajador.id);
            } else {
                console.error('Error eliminando trabajador:', response.statusText);
                Alert.alert('Error', 'No se pudo eliminar el trabajador');
            }
        } catch (error) {
            console.error('Error eliminando trabajador:', error);
            Alert.alert('Error', 'No se pudo eliminar el trabajador');
        }
    };

    return (
        <View style={styles.card}>
            <Text style={styles.cardText}>Nombre: {trabajador.nombre}</Text>
            <Text style={styles.cardText}>Rol: {trabajador.role}</Text>
            <Text style={styles.cardText}>Total de Clientes: {trabajador.clientes.length}</Text>
            <Button
                title="Ver clientes"
                onPress={() => navigation.navigate('TrabajadorClientes', { id: trabajador.id })}
                color="#2e5c74"
            />
            {showClientes && (
                <View style={styles.clientesContainer}>
                    {trabajador.clientes.map(cliente => (
                        <ClienteCard key={cliente.id} cliente={cliente} onPress={() => navigation.navigate('ClienteDetails', { id: cliente.id })} />
                    ))}
                </View>
            )}
            <View style={styles.iconContainer}>
                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                    <Icon name="pencil" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => setIsDeleting(true)}
                >
                    <Icon name="trash" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
            <Modal visible={isEditing} animationType="slide">
                <EditarTrabajador worker={trabajador} onSave={handleSave} />
                <Button title="Cerrar" onPress={() => setIsEditing(false)} />
            </Modal>
            <Modal
                visible={isDeleting}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsDeleting(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.message}>
                            ¿Está seguro que desea eliminar este trabajador?
                        </Text>
                        <Button title="Eliminar Trabajador" onPress={eliminarTrabajador} color="red" />
                        <Button title="Cancelar" onPress={() => setIsDeleting(false)} />
                    </View>
                </View>
            </Modal>
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
    },
    cardText: {
        fontSize: 16,
        color: '#fff', // Texto blanco
        marginBottom: 5,
    },
    clientesContainer: {
        marginTop: 10,
    },
    iconContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
    },
    editButton: {
        marginRight: 10,
    },
    deleteButton: {
        marginLeft: 10,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: '#333', // Fondo modal oscuro
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    message: {
        fontSize: 18,
        color: '#fff', // Texto blanco en el modal
        marginBottom: 20,
        textAlign: 'center',
    },
});

export default TrabajadorCard;
