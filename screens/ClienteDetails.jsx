import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AbonoForm from '../components/AbonoForm';
import MultaForm from '../components/MultaForm';
import DropDownPicker from 'react-native-dropdown-picker';




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
    const [canRenew, setCanRenew] = useState(false); // Nuevo estado para controlar la opción de renovación
    const [showRenewInput, setShowRenewInput] = useState(false);
    const [renewAmount, setRenewAmount] = useState('');
    const [amountValid, setAmountValid] = useState(false);
    const [fechaTermino, setFechaTermino] = useState('');
    const [open, setOpen] = useState(false);
    const [newInitialAmount, setNewInitialAmount] = useState('');
    const [items, setItems] = useState([
        { label: 'Seleccionar fecha', value: '' },
        { label: '15 días', value: '15 días' },
        { label: '20 días', value: '20 días' },
    ]);
    const isFormValid = amountValid && renewAmount !== '' && fechaTermino !== null;

    const navigation = useNavigation();

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
        checkRenewalEligibility(); // Verificar si se puede renovar después de cargar los abonos
    }, [abonos]);

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
            if (!token) {
                console.error('No token found');
                return;
            }

            const clienteResponse = await axios.get(`http://192.168.1.17:3000/clientes/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCliente(clienteResponse.data);

            const abonosResponse = await axios.get(`http://192.168.1.17:3000/clientes/${id}/abonos`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAbonos(abonosResponse.data);

            const multasResponse = await axios.get(`http://192.168.1.17:3000/clientes/${id}/multas`, {
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
        Alert.alert('Pago agregado con éxito', 'El pago se ha agregado correctamente.');
    };

    const handleAddMulta = async () => {
        const today = new Date().toISOString().split('T')[0];
        const lastActionDate = await AsyncStorage.getItem(`lastActionDate_${id}_multa`);

        if (lastActionDate === today) {
            Alert.alert('Acción no permitida', 'Solo puedes agregar una multa por día.');
            return;
        }

        await AsyncStorage.setItem(`lastActionDate_${id}_multa`, today);
        fetchDetails();
        setFormData({ day: null, type: null });
        Alert.alert('Multa agregada con éxito', 'La multa se ha agregado correctamente.');
    };




    const markAsPending = (dayStr) => {
        setPendingDays((prevPendingDays) => [...prevPendingDays, dayStr]);
        Alert.alert('Día Pendiente', 'El día queda pendiente para pago y multa.');
    };

    const markAsPaid = (dayStr) => {
        setPendingDays((prevPendingDays) => prevPendingDays.filter(day => day !== dayStr));
        setHiddenDays((prevHiddenDays) => [...prevHiddenDays, dayStr]);
        checkRenewalEligibility();
    };

    const formatDateToMexican = (dateStr) => {
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const checkRenewalEligibility = () => {
        if (abonos.length >= 5) {
            setCanRenew(true);
        } else {
            setCanRenew(false);
        }
    };

    const handleRenewLoan = () => {
        setShowRenewInput(true);
    };
    const handleConfirmRenewal = async () => {
        const remainingAmount = cliente.monto_actual;
    
        if (renewAmount === '') {
            Alert.alert('Error', 'Por favor ingresa el monto para renovar el préstamo.');
            return;
        }
    
        const amountToRenew = parseFloat(renewAmount);
        const tolerance = 0.01;
        if (Math.abs(amountToRenew - remainingAmount) > tolerance) {
            Alert.alert('Error', `La cantidad ingresada debe ser exactamente ${remainingAmount}.`);
            return;
        }
    
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }
    
            // Calcular el nuevo monto con el 30% de interés
            const interestRate = 0.30;
            const newAmountInitial = parseFloat(newInitialAmount);
            const newAmountWithInterest = newAmountInitial * (1 + interestRate);
    
            // Nueva fecha de inicio
            const fechaInicio = new Date(); // Crear una nueva instancia de Date
            fechaInicio.setDate(fechaInicio.getDate() + 2); // Sumar 1 día a la fecha actual
    
            let newFechaTermino;
            if (fechaTermino === '15 días') {
                newFechaTermino = new Date(fechaInicio);
                newFechaTermino.setDate(newFechaTermino.getDate() + 14); // Agrega 14 días (para completar 15 días)
            } else if (fechaTermino === '20 días') {
                newFechaTermino = new Date(fechaInicio);
                newFechaTermino.setDate(newFechaTermino.getDate() + 19); // Agrega 19 días (para completar 20 días)
            }
    
            // Formatear la fecha en un formato aceptable para la base de datos (ISO8601)
            const formattedFechaInicio = fechaInicio.toISOString().split('T')[0];
            const formattedFechaTermino = newFechaTermino.toISOString().split('T')[0];
    
            const updatedClient = {
                nombre: cliente.nombre,           // Mantener nombre existente
                ocupacion: cliente.ocupacion,     // Mantener ocupación existente
                direccion: cliente.direccion,     // Mantener dirección existente
                telefono: cliente.telefono,       // Mantener teléfono existente
                estado: cliente.estado,           // Mantener estado existente
                monto_inicial: newAmountInitial,  // Nuevo monto inicial
                monto_actual: newAmountWithInterest, // Nuevo monto con interés
                fecha_inicio: formattedFechaInicio, // Nueva fecha de inicio
                fecha_termino: formattedFechaTermino // Nueva fecha de término
            };
    
            await axios.put(`http://192.168.1.17:3000/clientes/${id}`, updatedClient, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            setCliente(prevCliente => ({
                ...prevCliente,
                ...updatedClient
            }));
    
            // Reiniciar el array de días al primer día
            setPendingDays([]);
            setHiddenDays([]);
    
            setShowRenewInput(false);
            Alert.alert('Renovación exitosa', 'El préstamo ha sido renovado correctamente.');
        } catch (error) {
            console.error('Error al renovar el préstamo:', error);
            Alert.alert('Error', 'Hubo un problema al renovar el préstamo.');
        }
    };
    



    const handleAmountChange = (text) => {
        setRenewAmount(text);
        const amountToRenew = parseFloat(text);
        const remainingAmount = cliente.monto_actual;
        if (Math.abs(amountToRenew - remainingAmount) <= 0.01) {
            setAmountValid(true);
        } else {
            setAmountValid(false);
        }
    };

    const handleNewAmountInitialChange = (text) => {
        setNewInitialAmount(text);
    };

    const handleRenewalDaysChange = (value) => {
        setFechaTermino(value);
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
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            onPress={() => setFormData({ day: dayStr, type: 'abono' })}
                            style={styles.abonoButton}
                        >
                            <Text style={styles.buttonText}>Pago</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setFormData({ day: dayStr, type: 'multa' })}
                            style={styles.multaButton}
                        >
                            <Text style={styles.buttonText}>Multa</Text>
                        </TouchableOpacity>
                        {!abonoForDay && (
                            <TouchableOpacity
                                onPress={() => markAsPending(dayStr)}
                                style={[styles.pendienteButton, { backgroundColor: 'orange' }]}
                            >
                                <Text style={styles.buttonText}>Pendiente</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {formData.day === dayStr && formData.type === 'abono' && (
                        <View style={styles.formContainer}>
                            <AbonoForm clienteId={id} onAddAbono={() => {
                                handleAddAbono();
                                markAsPaid(dayStr);
                            }} />
                        </View>
                    )}
                    {formData.day === dayStr && formData.type === 'multa' && (
                        <View style={styles.formContainer}>
                            <MultaForm clienteId={id} selectedDay={dayStr} onMultaAdded={() => {
                                handleAddMulta();
                                markAsPending(dayStr);
                            }} />
                        </View>
                    )}
                </View>
            );
            currentDate.setDate(currentDate.getDate() + 1);
            dayCount++;
        }


        return (
            <ScrollView>
                <FlatList
                    data={daysArray}
                    renderItem={({ item }) => item}
                    keyExtractor={(item, index) => index.toString()}
                />
            </ScrollView>
        );
    };

    const renderAbonosList = () => {
        if (abonos.length === 0) {
            return <Text style={styles.noAbonosText}>No hay pagos registrados.</Text>;
        }

        return (
            <FlatList
                data={abonos}
                renderItem={({ item }) => (
                    <View style={styles.abonoCard}>
                        <Text style={styles.abonoText}>Fecha: {formatDateToMexican(item.fecha)}</Text>
                        <Text style={styles.abonoText}>Cantidad: ${item.monto}</Text>
                    </View>
                )}
                keyExtractor={item => item.id.toString()}
            />
        );
    };

    const renderMultasList = () => {
        if (multas.length === 0) {
            return <Text style={styles.noAbonosText}>No hay multas registradas.</Text>;
        }

        return (
            <FlatList
                data={multas}
                renderItem={({ item }) => (
                    <View style={styles.multaCard}>
                        <Text style={styles.abonoText}>Fecha: {formatDateToMexican(item.fecha)}</Text>
                        <Text style={styles.abonoText}>Cantidad: ${item.monto}</Text>
                    </View>
                )}
                keyExtractor={item => item.id.toString()}
            />
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {cliente && (
                <View>
                    <View style={styles.detallesCliente}>
                        <Text style={styles.title}>Detalles del cliente</Text>
                        <Text style={styles.text}>Nombre: {cliente.nombre}</Text>
                        <Text style={styles.text}>Fecha de Inicio: {formatDateToMexican(cliente.fecha_inicio)}</Text>
                        <Text style={styles.text}>Fecha de Término: {formatDateToMexican(cliente.fecha_termino)}</Text>
                        <Text style={styles.text}>Estado: {cliente.estado}</Text>
                        <Text style={styles.text}>Monto inicial: ${cliente.monto_inicial}</Text>
                        <Text style={styles.text}>Monto actual: ${cliente.monto_actual}</Text>
                    </View>
                    {canRenew && !showRenewInput && (
                        <TouchableOpacity
                            onPress={handleRenewLoan}
                            style={[styles.button, { marginBottom: 10, backgroundColor: 'green' }]}
                        >
                            <Text style={styles.buttonText}>Renovar Préstamo</Text>
                        </TouchableOpacity>
                    )}

                    {showRenewInput && (
                        <View style={styles.RenovarPrestamo}>
                            <Text style={styles.cardText}>Ingrese el monto para renovar el préstamo:</Text>
                            <Text style={[styles.cardText, { color: amountValid ? 'green' : 'red' }]}>
                                Monto requerido: ${cliente?.monto_actual}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Monto"
                                value={renewAmount}
                                onChangeText={handleAmountChange}
                                keyboardType="numeric"
                            />

                            <Text style={styles.cardText}>Ingrese el nuevo monto</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: amountValid ? '#fff' : '#f0f0f0' }]}
                                placeholder="Nuevo monto"
                                value={newInitialAmount}
                                onChangeText={handleNewAmountInitialChange}
                                keyboardType="numeric"
                                editable={amountValid}
                            />

                            <Text style={styles.label}>Fecha de Término:</Text>
                            <DropDownPicker
                                open={open}
                                value={fechaTermino}
                                items={items}
                                setOpen={setOpen}
                                setValue={handleRenewalDaysChange}
                                setItems={setItems}
                                placeholder="Seleccione la nueva fecha de término"
                                style={styles.dropdown}
                            />

                            <TouchableOpacity
                                onPress={isFormValid ? handleConfirmRenewal : null}
                                style={[styles.button, { marginTop: 10, backgroundColor: isFormValid ? 'green' : 'gray' }]}
                                disabled={!isFormValid}
                            >
                                <Text style={styles.buttonText}>Confirmar Renovación</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setShowRenewInput(false)}
                                style={[styles.button, { backgroundColor: 'red', marginTop: 10 }]}
                            >
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={() => setDaysVisible(!daysVisible)}
                        style={[styles.button, { marginBottom: 10, marginTop: 10 }]}
                    >
                        <Text style={styles.buttonText}>{daysVisible ? 'Ocultar Días' : 'Mostrar Días'}</Text>
                    </TouchableOpacity>
                    {daysVisible && renderDaysCards()}
                    <TouchableOpacity
                        onPress={() => setPaidDaysVisible(!paidDaysVisible)}
                        style={[styles.button, { marginBottom: 10, marginTop: 10  }]}
                    >
                        <Text style={styles.buttonText}>{paidDaysVisible ? 'Ocultar Abonos' : 'Mostrar Abonos'}</Text>
                    </TouchableOpacity>
                    {paidDaysVisible && renderAbonosList()}
                    <TouchableOpacity
                        onPress={() => setMultasVisible(!multasVisible)}
                        style={[styles.button, { marginBottom: 10, marginTop: 10  }]}
                    >
                        <Text style={styles.buttonText}>{multasVisible ? 'Ocultar Multas' : 'Mostrar Multas'}</Text>
                    </TouchableOpacity>
                    {multasVisible && renderMultasList()}


                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#1c1c1e',
        height: '100%' ,
    },
    detallesCliente: {
        backgroundColor: '#E8E8E8',
        borderRadius: 8,
        padding: 20,
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        fontSize: 16
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    text: {
        fontSize: 16,
        marginBottom: 8,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 5,
        width: '80%',
        margin: 'auto',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16
    },
    dayCard: {
        padding: 12,
        marginBottom: 10,
        borderRadius: 8,
        backgroundColor: '#E8E8E8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    cardText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    RenovarPrestamo: {
        backgroundColor: '#E9F0C2',
        borderRadius: 8,
        padding: 20,
        marginBottom: 10,
    },
    abonoCard: {
        padding: 12,
        marginBottom: 10,
        borderRadius: 8,
        backgroundColor: '#CBE5C4',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    multaCard: {
        padding: 12,
        marginBottom: 10,
        borderRadius: 8,
        backgroundColor: '#EFC3CA',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    abonoText: {
        fontSize: 16,
        marginBottom: 8
    },
    noAbonosText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
        color: '#888'
    },
    paidCard: {
        backgroundColor: '#d4edda'
    },
    pendingCard: {
        backgroundColor: '#fff3cd'
    },
    defaultCard: {
        backgroundColor: '#E8E8E8'
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    abonoButton: {
        backgroundColor: '#4CAF50', // Verde
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 5,
        width: '30%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    multaButton: {
        backgroundColor: '#F44336', // Rojo
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 5,
        width: '30%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pendienteButton: {
        backgroundColor: '#FFEB3B', // Amarillo
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 5,
        width: '30%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
    },
    formContainer: {
        marginTop: 15,
    },
});

export default ClienteDetails;
