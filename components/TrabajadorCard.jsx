import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native'; // Importa useRoute
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import EditarTrabajador from './EditarTrabajador';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

const TrabajadorCard = ({ trabajador, navigation, onDelete }) => {
    const [showClientes, setShowClientes] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const route = useRoute(); // Usa el hook useRoute para obtener parámetros

    const handleSave = async (updatedWorker) => {
        const token = await AsyncStorage.getItem('token');

        try {
            const response = await fetch(`http://192.168.1.17:3000/trabajadores/${trabajador.id}`, {
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
        const token = await AsyncStorage.getItem('token');

        try {
            const response = await fetch(`http://192.168.1.17:3000/trabajadores/${trabajador.id}`, {
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

    const handleDownload = async () => {
        const token = await AsyncStorage.getItem('token');
        try {
            const response = await fetch(`http://192.168.1.67:3000/estadisticas/trabajador/${trabajador.id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                throw new Error('Error al obtener estadísticas del trabajador');
            }

            const data = await response.json();
            const formattedData = data.map((cliente, index) => ({
                'No.': index + 1,
                'Nombre cliente': cliente.nombre,
                'Direccion': cliente.direccion,
                'Telefono': cliente.telefono,
                'Monto inicial': cliente.monto_inicial,
                'Esquema de Dias-%': `${cliente.dias_prestamo === 15 ? `15 días $85x1000 30%` : cliente.dias_prestamo === 20 ? `20 días $65x1000 30%` : cliente.esquema_dias}`,
                'Fecha de inicio del prestamo': new Date(cliente.fecha_inicio).toLocaleDateString('es-ES', {
                    day: '2-digit', month: 'long', year: 'numeric'
                }),
                'Fecha de termino': new Date(cliente.fecha_termino).toLocaleDateString('es-ES', {
                    day: '2-digit', month: 'long', year: 'numeric'
                }),
                'Observaciones': cliente.ocupacion
            }));

            const ws = XLSX.utils.json_to_sheet(formattedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Clientes");
            const wbout = XLSX.write(wb, { type: 'binary', bookType: "xlsx" });

            const s2ab = (s) => {
                const buf = new ArrayBuffer(s.length);
                const view = new Uint8Array(buf);
                for (let i = 0; i !== s.length; ++i) {
                    view[i] = s.charCodeAt(i) & 0xFF;
                }
                return buf;
            };

            const bufferToBase64 = (buffer) => {
                let binary = '';
                const bytes = new Uint8Array(buffer);
                const len = bytes.byteLength;
                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                return btoa(binary);
            };

            const uri = `${FileSystem.cacheDirectory}Estadisticas_clientes_Trabajador_${trabajador.nombre}.xlsx`;
            await FileSystem.writeAsStringAsync(uri, bufferToBase64(s2ab(wbout)), { encoding: FileSystem.EncodingType.Base64 });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                console.log("Sharing is not available on this platform.");
            }
        } catch (error) {
            console.error('Error exportando clientes:', error);
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
                <TouchableOpacity style={styles.deleteButton} onPress={() => setIsDeleting(true)}>
                    <Icon name="trash" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
                    <Icon name="download" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
            <Modal visible={isEditing} animationType="slide" transparent={true}>
                <View style={styles.modalBackground}>
                    <EditarTrabajador worker={trabajador} onSave={handleSave} onClose={() => setIsEditing(false)} />
                </View>
            </Modal>
            <Modal
                visible={isDeleting}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsDeleting(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.deleteModal}>
                        <Text style={styles.modalText}>¿Está seguro que desea eliminar este trabajador?</Text>
                        <View style={styles.modalButtonContainer}>
                            <Button title="Cancelar" onPress={() => setIsDeleting(false)} />
                            <Button title="Eliminar" onPress={eliminarTrabajador} color="red" />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 20,
        margin: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#E8E8E8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    cardText: {
        fontSize: 16,
        marginBottom: 10,
    },
    clientesContainer: {
        marginTop: 10,
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    editButton: {
        backgroundColor: '#2e5c74',
        padding: 10,
        borderRadius: 5,
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
        padding: 10,
        borderRadius: 5,
    },
    downloadButton: {
        backgroundColor: '#3498db',
        padding: 10,
        borderRadius: 5,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    deleteModal: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 10,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
});

export default TrabajadorCard;
