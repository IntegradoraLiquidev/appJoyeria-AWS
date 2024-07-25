import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TextInput, StyleSheet, ScrollView, Button } from 'react-native';
import axios from 'axios';
import ClienteCard from '../components/ClienteCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditarClientes from '../components/EditarClientes';
import EliminarClientes from '../components/EliminarClientes';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const TrabajadorClientes = ({ route, navigation }) => {
    const { id, clienteActualizado, isFromEdit } = route.params || {};
    const [clientes, setClientes] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [eliminarVisible, setEliminarVisible] = useState(false);

    const decodeToken = (token) => {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    };

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const token = await AsyncStorage.getItem('token');

                if (!token) {
                    throw new Error('No se encontró el token');
                }

                const decodedToken = decodeToken(token);
                setIsAdmin(decodedToken.role === 'admin');

                const response = await axios.get(`http://192.168.1.67:3000/trabajadores/${id}/clientes`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setClientes(response.data);
                setFilteredClientes(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchClientes();
    }, [id]);

    useEffect(() => {
        if (isFromEdit && clienteActualizado) {
            const updatedClientes = clientes.map((cliente) =>
                cliente.id === clienteActualizado.id ? clienteActualizado : cliente
            );
            setClientes(updatedClientes);
            setFilteredClientes(updatedClientes);
        }
    }, [clienteActualizado, isFromEdit]);

    const handleSearch = (text) => {
        setSearchText(text);
        if (text === '') {
            setFilteredClientes(clientes);
        } else {
            const filtered = clientes.filter(cliente =>
                cliente.nombre.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredClientes(filtered);
        }
    };

    const handleEdit = (cliente) => {
        setClienteSeleccionado(cliente);
        setModalVisible(true);
    };

    const handleDelete = (cliente) => {
        setClienteSeleccionado(cliente);
        setEliminarVisible(true);
    };

    const handleEliminar = async (clienteId) => {
        if (!clienteId) {
            setEliminarVisible(false);
            return;
        }
        
        try {
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                throw new Error('No se encontró el token');
            }

            await axios.delete(`http://192.168.1.67:3000/clientes/${clienteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const updatedClientes = clientes.filter(cliente => cliente.id !== clienteId);
            setClientes(updatedClientes);
            setFilteredClientes(updatedClientes);
        } catch (error) {
            console.error(error);
        } finally {
            setEliminarVisible(false);
        }
    };

    const handleGuardar = (clienteActualizado) => {
        const updatedClientes = clientes.map((cliente) =>
            cliente.id === clienteActualizado.id ? clienteActualizado : cliente
        );
        setClientes(updatedClientes);
        setFilteredClientes(updatedClientes);
        setModalVisible(false);
    };

    const handleExport = async (cliente) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token');
            }
    
            // Obtener datos del cliente
            const response = await axios.get(`http://192.168.1.71:3000/estadisticas/cliente/${cliente.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            const data = response.data;
    
            // Formatear los datos para el archivo Excel
            const formattedData = [{
                'Nombre cliente': data.nombre,
                'Telefono': data.telefono,
                'Monto inicial': data.monto_inicial,
                'Esquema de Dias-%': `${data.dias_prestamo || 'Desconocido'} Dias $${data.cobro_diario ? Math.round(data.cobro_diario) : '0'} *$1000`,
                'Fecha de inicio del prestamo': new Date(data.fecha_inicio).toLocaleDateString('es-ES', {
                    day: '2-digit', month: 'long', year: 'numeric'
                }),
                'Fecha de termino': new Date(data.fecha_termino).toLocaleDateString('es-ES', {
                    day: '2-digit', month: 'long', year: 'numeric'
                }),
                'Observaciones': data.ocupacion
            }];
    
            const ws = XLSX.utils.json_to_sheet(formattedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Estadísticas");
    
            // Crear el nombre del archivo con el nombre del cliente
            const fileName = `estadisticas_cliente_${cliente.nombre.replace(/ /g, '_')}.xlsx`;
    
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
    
            const uri = FileSystem.cacheDirectory + fileName;
            await FileSystem.writeAsStringAsync(uri, bufferToBase64(s2ab(wbout)), { encoding: FileSystem.EncodingType.Base64 });
    
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                console.log("Sharing is not available on this platform.");
            }
        } catch (error) {
            console.error('Error exportando estadísticas:', error);
        }
    };
    

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Lista de clientes</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre"
                value={searchText}
                onChangeText={handleSearch}
            />
            <FlatList
                data={filteredClientes}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <ClienteCard 
                        cliente={item} 
                        onPress={() => navigation.navigate('ClienteDetails', { id: item.id })} 
                        isAdmin={isAdmin} 
                        onEdit={() => handleEdit(item)}
                        onDelete={handleDelete}
                        onExport={() => handleExport(item)}
                    />
                )}
            />
            {clienteSeleccionado && (
                <EditarClientes
                    cliente={clienteSeleccionado}
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onGuardar={handleGuardar}
                />
            )}
            {clienteSeleccionado && (
                <EliminarClientes
                    cliente={clienteSeleccionado}
                    visible={eliminarVisible}
                    onClose={() => setEliminarVisible(false)}
                    onEliminar={handleEliminar}
                />
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e1e1e', // Fondo oscuro
        padding: 10,
    },
    title: {
        fontSize: 24,
        color: '#fff', // Texto blanco
        marginBottom: 20,
        textAlign: 'center',
    },
    searchInput: {
        backgroundColor: '#2c2c2e', // Fondo del input oscuro
        color: '#fff', // Texto blanco
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
    },
});

export default TrabajadorClientes;
