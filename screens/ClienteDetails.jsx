import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AbonoForm from '../components/AbonoForm';
import MultaForm from '../components/MultaForm';

const ClienteDetails = ({ route }) => {
    const { id } = route.params;
    const [cliente, setCliente] = useState(null);
    const [abonos, setAbonos] = useState([]);
    const [multas, setMultas] = useState([]);
    const [abonosVisible, setAbonosVisible] = useState(false);
    const [multasVisible, setMultasVisible] = useState(false);

    const fetchDetails = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            const clienteResponse = await axios.get(`http://192.168.1.13:3000/clientes/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCliente(clienteResponse.data);

            const abonosResponse = await axios.get(`http://192.168.1.13:3000/clientes/${id}/abonos`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAbonos(abonosResponse.data);

            const multasResponse = await axios.get(`http://192.168.1.13:3000/clientes/${id}/multas`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMultas(multasResponse.data);
        } catch (error) {
            console.error('Error fetching details:', error);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, []);

    const toggleAbonosVisibility = () => {
        setAbonosVisible(!abonosVisible);
    };

    const toggleMultasVisibility = () => {
        setMultasVisible(!multasVisible);
    };

    const handleAddAbono = () => {
        fetchDetails();
    };

    if (!cliente) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{cliente.nombre}</Text>
            <Text>Ocupación: {cliente.ocupacion}</Text>
            <Text>Dirección: {cliente.direccion}</Text>
            <Text>Teléfono: {cliente.telefono}</Text>
            <Text>Fecha de inicio: {cliente.fecha_inicio}</Text>
            <Text>Fecha de término: {cliente.fecha_termino}</Text>
            <Text>Monto inicial: {cliente.monto_inicial}</Text>
            <Text>Monto actual: {cliente.monto_actual}</Text>
            <Text>Estado: {cliente.estado}</Text>

            <TouchableOpacity onPress={toggleAbonosVisibility} style={styles.button}>
                <Text style={styles.buttonText}>{abonosVisible ? 'Ocultar Abonos' : 'Mostrar Abonos'}</Text>
            </TouchableOpacity>
            {abonosVisible && (
                <FlatList
                    data={abonos}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.item}>
                            <Text>Monto: {item.monto}</Text>
                            <Text>Fecha: {item.fecha}</Text>
                            <Text>Estado: {item.estado}</Text>
                        </View>
                    )}
                />
            )}

            <AbonoForm clienteId={id} onAddAbono={handleAddAbono} />

            <TouchableOpacity onPress={toggleMultasVisibility} style={styles.button}>
                <Text style={styles.buttonText}>{multasVisible ? 'Ocultar Multas' : 'Mostrar Multas'}</Text>
            </TouchableOpacity>
            {multasVisible && (
                <FlatList
                    data={multas}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.item}>
                            <Text>Fecha: {item.fecha}</Text>
                            <Text>Monto: {item.monto}</Text> {/* Mostrar el monto de la multa */}
                            <Text>Estado: {item.estado}</Text>
                        </View>
                    )}
                />
            )}

            <MultaForm clienteId={id} onMultaAdded={fetchDetails} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8
    },
    item: {
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    }
});

export default ClienteDetails;
