import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AbonoForm from '../components/AbonoForm';

const ClienteDetails = ({ route }) => {
    const { id } = route.params;
    const [cliente, setCliente] = useState(null);
    const [abonos, setAbonos] = useState([]);
    const [isAbonosVisible, setIsAbonosVisible] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        fetchDetails();
    }, []);

    useEffect(() => {
        if (cliente?.estado === 'completado') {
            Alert.alert(
                "Pagos Completados",
                "El cliente ha completado todos los pagos.",
                [
                    {
                        text: "Aceptar",
                        onPress: () => navigation.navigate('WorkerDashboard')
                    }
                ]
            );
        }
    }, [cliente]);

    const fetchDetails = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const clienteResponse = await axios.get(`http://192.168.1.10:3000/api/clientes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCliente(clienteResponse.data);

            const abonosResponse = await axios.get(`http://192.168.1.10:3000/api/clientes/${id}/abonos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAbonos(abonosResponse.data);
        } catch (error) {
            console.error('Error fetching details:', error);
        }
    };

    const handleAddAbono = () => {
        fetchDetails();
        Alert.alert('Pago agregado con éxito', 'El pago se ha agregado correctamente.');
    };

    const handleNoAbono = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            await axios.put(
                `http://192.168.1.10:3000/api/clientes/${id}/incrementarMonto`,
                { incremento: 10 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchDetails();  // Actualiza los detalles para reflejar el nuevo monto actual
            Alert.alert('Monto incrementado', 'Se ha añadido 10 pesos al monto actual.');
        } catch (error) {
            console.error('Error incrementing monto_actual:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{cliente?.nombre}</Text>
                <Text style={styles.clientDetail}>Dirección: {cliente?.direccion}</Text>
                <Text style={styles.clientDetail}>Teléfono: {cliente?.telefono}</Text>
                <Text style={styles.clientDetail}>Monto inicial: {cliente?.precio_total}</Text>
                <Text style={styles.clientDetail}>Forma de pago: {cliente?.forma_pago}</Text>
                <Text style={styles.clientDetail}>Monto actual: {cliente?.monto_actual}</Text>
            </View>

            <Text style={styles.sectionTitle}>Realizar Abono:</Text>
            <AbonoForm clienteId={id} onAddAbono={handleAddAbono} />

            <TouchableOpacity style={styles.noAbonoButton} onPress={handleNoAbono}>
                <Text style={styles.noAbonoButtonText}>No abonó</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsAbonosVisible(!isAbonosVisible)}>
                <Text style={styles.hiddeTitle}>
                    {isAbonosVisible ? 'Ocultar' : 'Mostrar'} Historial de Abonos
                </Text>
            </TouchableOpacity>

            {isAbonosVisible && (
                abonos.length > 0 ? (
                    abonos.map((abono, index) => (
                        <View key={index} style={styles.abonoItem}>
                            <Text style={styles.abonoText}>Monto: {abono.monto}</Text>
                            <Text style={styles.abonoText}>Fecha: {new Date(abono.fecha).toLocaleDateString()}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noAbonosText}>No hay abonos registrados.</Text>
                )
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
    },
    clientInfo: {
        marginBottom: 20
    },
    clientName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10
    },
    clientDetail: {
        fontSize: 16,
        marginBottom: 5
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#000'
    },
    hiddeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#000',
        backgroundColor: '#d0d0d0',
        padding: 10,
        borderRadius: 10,
    },
    abonoItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 10
    },
    abonoText: {
        fontSize: 16
    },
    noAbonosText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 10
    },
    noAbonoButton: {
        backgroundColor:
            '#ff6347',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10
    },
    noAbonoButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default ClienteDetails;
