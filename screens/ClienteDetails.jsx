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
                [{ text: "Aceptar", onPress: () => navigation.navigate('WorkerDashboard') }]
            );
        }
    }, [cliente]);

    const fetchDetails = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const clienteResponse = await axios.get(`http://192.168.1.10:3000/api/clientes/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCliente(clienteResponse.data);

            const abonosResponse = await axios.get(`http://192.168.1.10:3000/api/clientes/${id}/abonos`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const abonosOrdenados = abonosResponse.data.sort(
                (a, b) => new Date(b.fecha) - new Date(a.fecha)
            );

            setAbonos(abonosOrdenados);
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

            fetchDetails();
            Alert.alert('Monto incrementado', 'Se ha añadido 10 pesos al monto actual.');
        } catch (error) {
            console.error('Error incrementing monto_actual:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{cliente?.nombre}</Text>
                <View style={styles.divider} />
                <Text style={styles.clientDetail}>Dirección: {cliente?.direccion}</Text>
                <View style={styles.divider} />
                <Text style={styles.clientDetail}>Teléfono: {cliente?.telefono}</Text>
                <View style={styles.divider} />
                <Text style={styles.clientDetail}>Monto inicial: {cliente?.precio_total}</Text>
                <View style={styles.divider} />
                <Text style={styles.clientDetail}>Forma de pago: {cliente?.forma_pago}</Text>
                <View style={styles.divider} />
                <Text style={styles.clientDetail}>Monto actual: {cliente?.monto_actual}</Text>
            </View>

            <View style={styles.clientInfo}>
                <Text style={styles.sectionTitle}>Realizar Abono</Text>
                <AbonoForm clienteId={id} onAddAbono={handleAddAbono} />
                <TouchableOpacity style={styles.noAbonoButton} onPress={handleNoAbono}>
                    <Text style={styles.noAbonoButtonText}>No abonó</Text>
                </TouchableOpacity>

                <View style={styles.buttonSpacing} />

                <TouchableOpacity onPress={() => setIsAbonosVisible(!isAbonosVisible)}>
                    <Text style={styles.hiddeTitle}>
                        {isAbonosVisible ? 'Ocultar' : 'Mostrar'} Historial de Abonos
                    </Text>
                </TouchableOpacity>

                {isAbonosVisible && (
                    abonos.length > 0 ? (
                        abonos
                            .slice()
                            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) 
                            .map((abono, index) => (
                                <View key={index} style={[
                                    styles.abonoItem,
                                    abono.estado === 'no_abono' ? styles.noAbonoBackground : styles.pagadoBackground
                                ]}>
                                    <Text style={styles.abonoText}>Monto: {abono.monto}</Text>
                                    <Text style={styles.abonoText}>Fecha: {new Date(abono.fecha).toLocaleDateString()}</Text>
                                    <Text style={styles.abonoText}>Estado: {abono.estado === 'no_abono' ? 'No Abonado' : 'Pagado'}</Text>
                                </View>
                            ))
                    ) : (
                        <Text style={styles.noAbonosText}>No hay abonos registrados.</Text>
                    )
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d0d0d',
        padding: 20,
    },
    clientInfo: {
        backgroundColor: '#1a1a1a',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 12,
    },
    clientName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f5c469',
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: 3,
    },
    clientDetail: {
        fontSize: 16,
        color: '#d1d1d1',
        marginBottom: 5,
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginVertical: 10,
    },
    sectionTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#f5c469',
        marginVertical: 20,
        textAlign: 'center',
    },
    hiddeTitle: {
        fontSize: 18,
        color: '#ecdda2',
        paddingVertical: 12,
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        textAlign: 'center',
        elevation: 10,
    },
    abonoItem: {
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
    },
    abonoText: {
        fontSize: 16,
        color: '#fff',
    },
    noAbonosText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
    },
    noAbonoBackground: {
        backgroundColor: '#ff4c4c',
    },
    pagadoBackground: {
        backgroundColor: '#1db954',
    },
    noAbonoButton: {
        backgroundColor: '#ff6347',
        paddingVertical: 10,
        paddingHorizontal: 1,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 15, // Separación con otros elementos
        shadowColor: '#ff6347',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 2,
    },

    buttonSpacing: {
        height: 15, // Espacio vertical entre botones
    },

    noAbonoButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default ClienteDetails;
