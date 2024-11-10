import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, TextInput, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import DropDownPicker from 'react-native-dropdown-picker';

const TrabajadorCard = ({ trabajador, navigation, onDelete, onEdit }) => {
    const [showClientes, setShowClientes] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editedTrabajador, setEditedTrabajador] = useState({ ...trabajador });
    const [open, setOpen] = useState(false);
    const [role, setRole] = useState(editedTrabajador.rol);
    const [items, setItems] = useState([
        { label: 'Administrador', value: 'Administrador' },
        { label: 'Trabajador', value: 'Trabajador' }
    ]);

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
        setEditedTrabajador({ ...trabajador });
        setEditModalVisible(true);
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
                        axios.delete(`http://192.168.1.68:3000/api/trabajadores/eliminar/${trabajador.id_usuario}`)
                            .then(response => {
                                Alert.alert("Éxito", "Trabajador eliminado exitosamente");
                                onDelete(trabajador.id_usuario);
                            })
                            .catch(error => {
                                const errorMessage = error.response?.data?.message || 'Error desconocido al eliminar el trabajador';
                                Alert.alert("Error", errorMessage);
                            });
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const handleSaveChanges = () => {
        axios.put(`http://192.168.1.68:3000/api/trabajadores/editar/${trabajador.id_usuario}`, {
            ...editedTrabajador,
            rol: role
        })
            .then(response => {
                if (response.status === 200) {
                    Alert.alert("Éxito", "Trabajador actualizado correctamente");
                    if (onEdit) {
                        onEdit({ ...editedTrabajador, rol: role });
                    }
                    setEditModalVisible(false);
                }
            })
            .catch(error => {
                const errorMessage = error.response?.data?.message || 'Error desconocido al actualizar el trabajador';
                Alert.alert("Error", errorMessage);
            });
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

            <Modal
                animationType="slide"
                transparent={true}
                visible={isEditModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Editar Trabajador</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre"
                            value={editedTrabajador.nombre}
                            onChangeText={(text) => setEditedTrabajador({ ...editedTrabajador, nombre: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Apellidos"
                            value={editedTrabajador.apellidos}
                            onChangeText={(text) => setEditedTrabajador({ ...editedTrabajador, apellidos: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={editedTrabajador.email}
                            onChangeText={(text) => setEditedTrabajador({ ...editedTrabajador, email: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            secureTextEntry
                            value={editedTrabajador.password}
                            onChangeText={(text) => setEditedTrabajador({ ...editedTrabajador, password: text })}
                        />

                        <DropDownPicker
                            open={open}
                            value={role}
                            items={items}
                            setOpen={setOpen}
                            setValue={setRole}
                            setItems={setItems}
                            placeholder="Selecciona el rol"
                            style={styles.dropdown}
                        />

                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
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
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    input: {
        width: 250,
        height: 40,
        backgroundColor: '#fff',
        marginBottom: 15,
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    saveButton: {
        backgroundColor: '#4a90e2',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
        padding: 10,
        borderRadius: 5,
    },
    cancelButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default TrabajadorCard;
