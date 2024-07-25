import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, Animated, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AbonoForm from '../components/AbonoForm';
import MultaForm from '../components/MultaForm';

const ClienteDetails = ({ route }) => {
    const { id } = route.params;
    const [cliente, setCliente] = useState(null);
    const [abonos, setAbonos] = useState([]);
    const [multas, setMultas] = useState([]);
    const [multasVisible, setMultasVisible] = useState(false);
    const [formData, setFormData] = useState({ day: null, type: null });
    const [pendingDays, setPendingDays] = useState([]);
    const [hiddenDays, setHiddenDays] = useState([]);
    const [daysVisible, setDaysVisible] = useState(true);
    const [paidDaysVisible, setPaidDaysVisible] = useState(true);
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const rotatePaidAnim = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation(); // Obtén la navegación
    useEffect(() => {
        fetchDetails();
        loadPendingDays();
        loadHiddenDays();
    }, []);

    useEffect(() => {
        savePendingDays();
    }, [pendingDays]);

    useEffect(() => {
        saveHiddenDays();
    }, [hiddenDays]);

    useEffect(() => {
        if (cliente?.estado === 'completado') {
            Alert.alert(
                "Pagos Completados",
                "El cliente ha completado todos los pagos.",
                [
                    {
                        text: "Aceptar",
                        onPress: () => navigation.navigate('WorkerDashboard') // Redirigir a otra pantalla
                    }
                ]
            );
        }
    }, [cliente]);

    const fetchDetails = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            const clienteResponse = await axios.get(`http://192.168.1.67:3000/clientes/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCliente(clienteResponse.data);

            const abonosResponse = await axios.get(`http://192.168.1.67:3000/clientes/${id}/abonos`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAbonos(abonosResponse.data);

            const multasResponse = await axios.get(`http://192.168.1.67:3000/clientes/${id}/multas`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMultas(multasResponse.data);
        } catch (error) {
            console.error('Error fetching details:', error);
        }
    };

    const loadPendingDays = async () => {
        try {
            const storedPendingDays = await AsyncStorage.getItem(`pendingDays_${id}`);
            if (storedPendingDays) {
                setPendingDays(JSON.parse(storedPendingDays));
            }
        } catch (error) {
            console.error('Error loading pending days:', error);
        }
    };

    const savePendingDays = async () => {
        try {
            await AsyncStorage.setItem(`pendingDays_${id}`, JSON.stringify(pendingDays));
        } catch (error) {
            console.error('Error saving pending days:', error);
        }
    };

    const loadHiddenDays = async () => {
        try {
            const storedHiddenDays = await AsyncStorage.getItem(`hiddenDays_${id}`);
            if (storedHiddenDays) {
                setHiddenDays(JSON.parse(storedHiddenDays));
            }
        } catch (error) {
            console.error('Error loading hidden days:', error);
        }
    };

    const saveHiddenDays = async () => {
        try {
            await AsyncStorage.setItem(`hiddenDays_${id}`, JSON.stringify(hiddenDays));
        } catch (error) {
            console.error('Error saving hidden days:', error);
        }
    };

    const handleAddAbono = () => {
        if (cliente.estado === 'completado') {
            Alert.alert('Acción no permitida', 'No se pueden agregar más abonos, el cliente está completado.');
            return;
        }

        fetchDetails();
        setFormData({ day: null, type: null });
        
    };

    const handleAddMulta = async () => {
        const today = new Date().toISOString().split('T')[0];
        const lastActionDate = await AsyncStorage.getItem(`lastActionDate_${id}_multa`);

        if (lastActionDate === today) {
            alert('Solo puedes agregar una multa por día');
            return;
        }

        await AsyncStorage.setItem(`lastActionDate_${id}_multa`, today);
        fetchDetails();
        setFormData({ day: null, type: null });
        alert('Multa agregada correctamente');
    };

    const markAsPending = (dayStr) => {
        setPendingDays((prevPendingDays) => [...prevPendingDays, dayStr]);
    };

    const markAsPaid = (dayStr) => {
        setPendingDays((prevPendingDays) => prevPendingDays.filter(day => day !== dayStr));
        setHiddenDays((prevHiddenDays) => [...prevHiddenDays, dayStr]);
    };

    const formatDateToMexican = (dateStr) => {
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const renderDaysCards = () => {
        if (!cliente) return null;

        const startDate = new Date(cliente.fecha_inicio);
        const endDate = new Date(cliente.fecha_termino);
        const daysArray = [];

        let currentDate = new Date(startDate);
        let dayCount = 1;
        while (currentDate <= endDate) {
            const dayStr = currentDate.toISOString().split('T')[0];
            const abonoForDay = abonos.find(abono => abono.fecha === dayStr);
            const multaForDay = multas.find(multa => multa.fecha === dayStr);
            const isPending = pendingDays.includes(dayStr);
            const isPaid = abonoForDay || multaForDay ? !isPending : false;
            const isHidden = hiddenDays.includes(dayStr);

            if (isHidden) {
                currentDate.setDate(currentDate.getDate() + 1);
                dayCount++;
                continue;
            }

            daysArray.push(
                <View key={currentDate.toISOString()} style={[styles.dayCard, isPaid ? styles.paidCard : isPending ? styles.pendingCard : styles.defaultCard]}>
                    <Text style={styles.cardText}>Día {dayCount}: {formatDateToMexican(currentDate)}</Text>
                    {!abonoForDay && (
                        <TouchableOpacity
                            onPress={() => markAsPending(dayStr)}
                            style={[styles.smallButton, { backgroundColor: 'orange' }]}
                        >
                            <Text style={styles.buttonText}>Pendiente</Text>
                        </TouchableOpacity>
                    )}
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
                        <AbonoForm clienteId={id} onAddAbono={() => {
                            handleAddAbono();
                            markAsPaid(dayStr);
                        }} />
                    )}
                     {formData.day === dayStr && formData.type === 'multa' && (
                        <MultaForm clienteId={id} selectedDay={dayStr} onMultaAdded={() => {
                            handleAddMulta();
                            markAsPending(dayStr);
                        }} />
                    )}
                </View>
            );
            currentDate.setDate(currentDate.getDate() + 1);
            dayCount++;
        }
        return daysArray;
    };

    const handleCardPress = () => {
        setDaysVisible(!daysVisible);
        Animated.timing(rotateAnim, {
            toValue: daysVisible ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const handlePaidCardPress = () => {
        setPaidDaysVisible(!paidDaysVisible);
        Animated.timing(rotatePaidAnim, {
            toValue: paidDaysVisible ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const renderCardHeader = () => {
        const spin = rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
        });

        return (
            <TouchableOpacity onPress={handleCardPress} style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>Días Activos</Text>
                <Animated.Text style={[styles.arrow, { transform: [{ rotate: spin }] }]}>▼</Animated.Text>
            </TouchableOpacity>
        );
    };

    const renderPaidCardHeader = () => {
        const spin = rotatePaidAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
        });

        return (
            <TouchableOpacity onPress={handlePaidCardPress} style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>Días Pagados</Text>
                <Animated.Text style={[styles.arrow, { transform: [{ rotate: spin }] }]}>▼</Animated.Text>
            </TouchableOpacity>
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {cliente && (
                <>
                    <View style={styles.card}>
                        <Text style={styles.title}>Detalles del Cliente</Text>
                        <Text style={styles.cardText}>Nombre: {cliente.nombre}</Text>
                        <Text style={styles.cardText}>Monto Diario: {cliente.monto_diario}</Text>
                        <Text style={styles.cardText}>Fecha de Inicio: {formatDateToMexican(cliente.fecha_inicio)}</Text>
                        <Text style={styles.cardText}>Fecha de Término: {formatDateToMexican(cliente.fecha_termino)}</Text>
                        <Text style={styles.cardText}>Estado: {cliente.estado}</Text>
                        <Text style={styles.cardText}>Monto inicial: {cliente.monto_inicial}</Text>
                        <Text style={styles.cardText}>Monto actual: {cliente.monto_actual}</Text>
                    </View>
                    {renderCardHeader()}
                    {daysVisible && renderDaysCards()}

                    <Text style={styles.subtitle}>Días Pagados:</Text>
                    {renderPaidCardHeader()}
                    {paidDaysVisible && (
                        <FlatList
                            data={abonos}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.dayCard}>
                                    <Text style={styles.cardText}>
                                        Fecha: {formatDateToMexican(item.fecha)} - Monto: {item.monto}
                                    </Text>
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
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.item}>
                                    <Text style={styles.cardText}>Monto: {item.monto}</Text>
                                    <Text style={styles.cardText}>Fecha: {formatDateToMexican(item.fecha)}</Text>
                                </View>
                            )}
                        />
                    )}

                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 10,
        backgroundColor: '#121212', // Dark background color
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#e0e0e0', // Light text color
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    card: {
        backgroundColor: '#444', // Dark card background
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#e0e0e0', // Light text color
        marginBottom: 10,
    },
    cardText: {
        fontSize: 16,
        color: '#e0e0e0', // Light text color
        marginBottom: 5,
    },
    dayCard: {
        backgroundColor: 'green',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    smallButton: {
        marginTop: 5,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#007BFF',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#1e88e5', // Blue button color
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    pendingCard: {
        backgroundColor: 'orange', // Dark red background for pending
    },
    paidCard: {
        backgroundColor: 'green',
    },
    defaultCard: {
        backgroundColor: '#444', // Darker default card background
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    cardHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    arrow: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    item: {
        backgroundColor: '#2c2c2c', // Dark item background
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
    },
});

export default ClienteDetails;
