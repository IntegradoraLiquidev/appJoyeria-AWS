import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
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
    const [formData, setFormData] = useState({ day: null, type: null });
    const [cardStates, setCardStates] = useState({});

    const fetchDetails = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            const clienteResponse = await axios.get(`http://172.20.104.17:3000/clientes/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCliente(clienteResponse.data);

            const abonosResponse = await axios.get(`http://172.20.104.17:3000/clientes/${id}/abonos`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAbonos(abonosResponse.data);

            const multasResponse = await axios.get(`http://172.20.104.17:3000/clientes/${id}/multas`, {
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

    const handleAddAbono = () => {
        fetchDetails();
        setFormData({ day: null, type: null });
    };

    const handleAddMulta = () => {
        fetchDetails();
        setFormData({ day: null, type: null });
    };

    const toggleCardState = (dayStr) => {
        setCardStates((prevState) => ({
            ...prevState,
            [dayStr]: !prevState[dayStr],
        }));
    };

    const markAsPending = (dayStr) => {
        console.log(`Marking day ${dayStr} as pending`);
        // Aquí puedes agregar la lógica para manejar el estado pendiente, como una solicitud a la API.
    };

    const renderDaysCards = () => {
        const startDate = new Date(cliente.fecha_inicio);
        const endDate = new Date(cliente.fecha_termino);
        const daysArray = [];

        for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
            daysArray.push(new Date(d));
        }

        return daysArray.map((day, index) => {
            const dayStr = day.toISOString().split('T')[0];
            const isOpen = cardStates[dayStr] || false;

            return (
                <View key={index} style={styles.dayCard}>
                    <Text style={styles.cardText}>Día {index + 1}: {dayStr}</Text>
                    <TouchableOpacity
                        onPress={() => toggleCardState(dayStr)}
                        style={styles.smallButton}
                    >
                        <Text style={styles.buttonText}>{isOpen ? 'Cerrar' : 'Abrir'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => markAsPending(dayStr)}
                        style={[styles.smallButton, { backgroundColor: 'orange' }]}
                    >
                        <Text style={styles.buttonText}>Pendiente</Text>
                    </TouchableOpacity>
                    {isOpen && (
                        <>
                            <TouchableOpacity
                                onPress={() => setFormData({ day: dayStr, type: 'abono' })}
                                style={styles.smallButton}
                            >
                                <Text style={styles.buttonText}>Agregar Pago</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setFormData({ day: dayStr, type: 'multa' })}
                                style={styles.smallButton}
                            >
                                <Text style={styles.buttonText}>Agregar Multa</Text>
                            </TouchableOpacity>
                            {formData.day === dayStr && formData.type === 'abono' && (
                                <AbonoForm clienteId={id} selectedDay={dayStr} onAddAbono={handleAddAbono} />
                            )}
                            {formData.day === dayStr && formData.type === 'multa' && (
                                <MultaForm clienteId={id} selectedDay={dayStr} onMultaAdded={handleAddMulta} />
                            )}
                        </>
                    )}
                </View>
            );
        });
    };

    if (!cliente) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>{cliente.nombre}</Text>
                <Text style={styles.cardText}>Ocupación: {cliente.ocupacion}</Text>
                <Text style={styles.cardText}>Dirección: {cliente.direccion}</Text>
                <Text style={styles.cardText}>Teléfono: {cliente.telefono}</Text>
                <Text style={styles.cardText}>Fecha de inicio: {cliente.fecha_inicio}</Text>
                <Text style={styles.cardText}>Fecha de término: {cliente.fecha_termino}</Text>
                <Text style={styles.cardText}>Monto inicial: {cliente.monto_inicial}</Text>
                <Text style={styles.cardText}>Monto actual: {cliente.monto_actual}</Text>
                <Text style={styles.cardText}>Estado: {cliente.estado}</Text>
            </View>

            {renderDaysCards()}

            <TouchableOpacity onPress={() => setAbonosVisible(!abonosVisible)} style={styles.button}>
                <Text style={styles.buttonText}>{abonosVisible ? 'Ocultar Abonos' : 'Mostrar Abonos'}</Text>
            </TouchableOpacity>
            {abonosVisible && (
                <FlatList
                    data={abonos}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.item}>
                            <Text style={styles.cardText}>Monto: {item.monto}</Text>
                            <Text style={styles.cardText}>Fecha: {item.fecha}</Text>
                            <Text style={styles.cardText}>Estado: {item.estado}</Text>
                        </View>
                    )}
                />
            )}

            <TouchableOpacity onPress={() => setMultasVisible(!multasVisible)} style={styles.button}>
                <Text style={styles.buttonText}>{multasVisible ? 'Ocultar Multas' : 'Mostrar Multas'}</Text>
            </TouchableOpacity>
            {multasVisible && (
                <FlatList
                    data={multas}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.item}>
                            <Text style={styles.cardText}>Fecha: {item.fecha}</Text>
                            <Text style={styles.cardText}>Monto: {item.monto}</Text>
                            <Text style={styles.cardText}>Estado: {item.estado}</Text>
                        </View>
                    )}
                />
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#1c1c1e', // Fondo oscuro
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
    card: {
        backgroundColor: '#333',
        borderColor: '#2e5c74',
        borderWidth: 1,
        borderRadius: 8,
        padding: 15,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    cardText: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 4,
    },
    button: {
        backgroundColor: '#2e5c74',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginVertical: 10,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    item: {
        backgroundColor: '#444',
        borderColor: '#2e5c74',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginVertical: 5,
    },
    dayCard: {
        backgroundColor: '#444',
        borderColor: '#2e5c74',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginVertical: 5,
    },
    smallButton: {
        backgroundColor: '#2e5c74',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginTop: 5,
    },
});

export default ClienteDetails;
