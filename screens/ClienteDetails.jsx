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

    return (
        <ScrollView style={styles.container}>
            <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{cliente?.nombre}</Text>
                <Text style={styles.clientDetail}>Dirección: {cliente?.direccion}</Text>
                <Text style={styles.clientDetail}>Teléfono: {cliente?.telefono}</Text>
                <Text style={styles.clientDetail}>Por pagar: {cliente?.precio_total}</Text>
                <Text style={styles.clientDetail}>forma de pago: {cliente?.forma_pago}</Text>
            </View>
            <Text style={styles.sectionTitle}>Realizar Abono:</Text>
            <AbonoForm clienteId={id} onAddAbono={handleAddAbono} />
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
        marginVertical: 10
    },
});

export default ClienteDetails;
