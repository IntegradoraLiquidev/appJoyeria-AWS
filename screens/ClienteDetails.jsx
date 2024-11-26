import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Animated, Modal } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AbonoForm from '../components/AbonoForm';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ClienteDetails = ({ route }) => {
    const { id } = route.params;
    const [cliente, setCliente] = useState(null);
    const [abonos, setAbonos] = useState([]);
    const [isAbonosVisible, setIsAbonosVisible] = useState(false);
    const navigation = useNavigation();
    const [lastIncrementDate, setLastIncrementDate] = useState(null);
    const [productos, setProductos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);

    const scaleAnimModal = useRef(new Animated.Value(2)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(10)).current;

    useEffect(() => {
        fetchDetails();
        fetchProductos(); // Nueva función para obtener productos
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

    const fetchProductos = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const response = await axios.get(`http://192.168.1.15:3000/api/clientes/${id}/productos`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setProductos(response.data);
        } catch (error) {
            console.error('Error fetching productos:', error);
        }
    };

    const fetchDetails = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const clienteResponse = await axios.get(`http://192.168.1.15:3000/api/clientes/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCliente(clienteResponse.data);

            const abonosResponse = await axios.get(`http://192.168.1.15:3000/api/clientes/${id}/abonos`, {
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
        const today = new Date().toISOString().split('T')[0]; // Obtener la fecha actual en formato 'YYYY-MM-DD'

        if (lastIncrementDate === today) {
            Alert.alert('Incremento ya realizado', 'El incremento ya se realizó para la fecha de hoy.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            await axios.put(
                `http://192.168.1.15:3000/api/clientes/${id}/incrementarMonto`,
                { incremento: 10 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setLastIncrementDate(today); // Actualizar la última fecha de incremento
            fetchDetails();
            Alert.alert('Monto incrementado', 'Se ha añadido 10 pesos al monto actual.');
        } catch (error) {
            console.error('Error incrementing monto_actual:', error);
        }
    };


    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const handleToggleAbonos = () => {
        setIsAbonosVisible(!isAbonosVisible);
        if (!isAbonosVisible) {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(translateYAnim, { toValue: 0, duration: 500, useNativeDriver: true })
            ]).start();
        } else {
            fadeAnim.setValue(0);
            translateYAnim.setValue(10);
        }
    };

    const toggleModal = () => {
        if (!modalVisible) {
            // Mostrar modal con animación de "pop"
            setModalVisible(true);
            Animated.spring(scaleAnimModal, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
            }).start();
        } else {
            // Ocultar modal
            Animated.timing(scaleAnimModal, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => setModalVisible(false));
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{cliente?.nombre}</Text>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                    <Icon name="location-on" size={18} color="#f5c469" />
                    <Text style={styles.clientDetail}>{cliente?.direccion}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                    <Icon name="phone" size={18} color="#f5c469" />
                    <Text style={styles.clientDetail}>{cliente?.telefono}</Text>
                </View>
                <View style={styles.divider} />
                <Text style={styles.clientDetail}>Monto inicial: {cliente?.precio_total}</Text>
                <View style={styles.divider} />
                <Text style={styles.clientDetail}>Forma de pago: {cliente?.forma_pago}</Text>
                <View style={styles.divider} />
                <TouchableOpacity onPress={toggleModal} style={styles.button}>
                    <Text style={styles.buttonText}>Ver Productos</Text>
                </TouchableOpacity>
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="none" // Evitamos animaciones predeterminadas
                    onRequestClose={toggleModal}
                >
                    <View style={styles.modalContainer}>
                        <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnimModal }] }]}>
                            <Text style={styles.modalTitle}>Lista de Productos</Text>
                            <ScrollView>
                                {productos.length > 0 ? (
                                    productos.map((producto, index) => (
                                        <View key={index} style={styles.productItem}>
                                            <Text style={styles.clientDetail}>Nombre: {producto.nombre}</Text>
                                            <Text style={styles.clientDetail}>Quilates: {producto.quilates}</Text>
                                            <Text style={styles.clientDetail}>precio: {producto.precio} </Text>
                                            <Text style={styles.clientDetail}>Cantidad: {producto.cantidad}</Text> 
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.noProductsText}>No hay productos asociados.</Text>
                                )}
                            </ScrollView>
                            <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>Cerrar</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </Modal>
                <View style={styles.divider} />
                <Text style={styles.clientAmountText}>Por pagar: {cliente?.monto_actual}</Text>

            </View>
            <View style={styles.clientInfo}>
                <Text style={styles.sectionTitle}>Realizar abono</Text>
                {cliente?.monto_actual > 0 ? (
                    <>
                        <AbonoForm clienteId={id} onAddAbono={handleAddAbono} />
                        <Animated.View style={[styles.noAbonoButton, { transform: [{ scale: scaleAnim }] }]}>
                            <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handleNoAbono} disabled={cliente?.monto_actual <= 0}>
                                <Text style={styles.noAbonoButtonText}>No abonó</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </>
                ) : (
                    <Text style={styles.check}>El cliente ha completado todos los pagos.</Text>
                )}

                <TouchableOpacity onPress={handleToggleAbonos} style={styles.toggleButton}>
                    <Text style={styles.hiddeTitle}>{isAbonosVisible ? 'Ocultar' : 'Mostrar'} Historial de Abonos</Text>
                </TouchableOpacity>

                {isAbonosVisible && (
                    abonos.length > 0 ? (
                        abonos.map((abono, index) => (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.abonoItem,
                                    abono.estado === 'no_abono' ? styles.noAbonoBackground : styles.pagadoBackground,
                                    { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }
                                ]}
                            >
                                <Text style={styles.abonoText}>Monto: {abono.monto}</Text>
                                <Text style={styles.abonoText}>Fecha: {new Date(abono.fecha).toLocaleDateString()}</Text>
                                <Text style={styles.abonoText}>Estado: {abono.estado === 'no_abono' ? 'No Abonado' : 'Pagado'}</Text>
                            </Animated.View>
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
        color: '#d9d9d9',
        marginLeft: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#444',
        marginVertical: 10,
    },
    sectionTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#f5c469',
        marginBottom: 12,
        textAlign: 'center',

    },
    clientAmountText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ff6347', // Color rojo suave
        textAlign: 'center',
        textShadowColor: '#000', // Color de sombra
        textShadowOffset: { width: 1, height: 1 }, // Desplazamiento de sombra
        textShadowRadius: 5, // Radio de desenfoque de la sombra
    },
    noAbonosText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
    },
    toggleButton: {
        marginVertical: 15,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#2a2a2a',
        alignItems: 'center',
    },
    abonoItem: {
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
    },
    check: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginBottom: 12,
    },
    abonoText: {
        fontSize: 16,
        color: '#f9f9f9',
    },
    noAbonoBackground: {
        backgroundColor: '#8b0000',
    },
    pagadoBackground: {
        backgroundColor: '#006400',
    },
    noAbonoButton: {
        backgroundColor: '#ff6347',
        paddingVertical: 10,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 15,
        shadowColor: '#ff6347',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 2,
    },
    noAbonoButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    hiddeTitle: {
        color: '#b1b1b1'
    },
    button: {
        backgroundColor: '#d4af37',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#1a1a1a',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#f5c469',
        marginBottom: 20,
    },
    productItem: {
        marginBottom: 15,
        padding: 15,
        backgroundColor: '#2a2a2a',
        borderRadius: 8,
    },
    noProductsText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
    },
    closeButton: {
        backgroundColor: '#ff6347',
        padding: 10,
        borderRadius: 8,
        marginTop: 20,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default ClienteDetails;
