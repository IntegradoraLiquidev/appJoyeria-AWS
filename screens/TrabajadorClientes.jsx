import React, { useEffect, useState } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    Dimensions,
} from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ClienteCard from '../components/ClienteCard';
import { useNavigation } from '@react-navigation/native';

const TrabajadorClientes = ({ route }) => {
    const { id } = route.params;
    const [clientes, setClientes] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [trabajadorNombre, setTrabajadorNombre] = useState('');
    const [index, setIndex] = useState(0);
    const routes = [
        { key: 'pagosHoy', title: 'Con Pago Hoy' },
        { key: 'sinPagosHoy', title: 'Sin Pago Hoy' },
        { key: 'montoCero', title: 'Finalizados' },
    ];

    const navigation = useNavigation();

    // Fetch inicial de los clientes
    const fetchClientes = async () => {
        try {
            const response = await axios.get(`http://192.168.1.65:3000/api/clientes/clientes/${id}`);
            const clientesPendientes = response.data.sort(
                (a, b) => new Date(a.fecha_proximo_pago) - new Date(b.fecha_proximo_pago)
            );
            setClientes(clientesPendientes);
            setFilteredClientes(clientesPendientes);

            if (response.data.length > 0) {
                setTrabajadorNombre(response.data[0].nombre_trabajador);
            }
        } catch (error) {
            console.error('Error al obtener los clientes:', error);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, [id]);

    // Persistencia del índice de pestañas
    useEffect(() => {
        const fetchIndex = async () => {
            const savedIndex = await AsyncStorage.getItem('tabIndex');
            if (savedIndex !== null) {
                setIndex(parseInt(savedIndex, 10));
            }
        };
        fetchIndex();
    }, []);

   const handleIndexChange = async (newIndex) => {
    setIndex(newIndex);
    await AsyncStorage.setItem('tabIndex', newIndex.toString());

    // Opcional: Actualiza datos solo si es necesario
    if (newIndex === 0 || newIndex === 1 || newIndex === 2) {
        fetchClientes();
    }
};


    // Filtrar clientes según búsqueda
    useEffect(() => {
        const filtered = clientes.filter((cliente) =>
            cliente.nombre.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredClientes(filtered);
    }, [searchText, clientes]);

    // Categorías de clientes
    const today = new Date().toLocaleDateString('es-ES');
    const clientesConPagoHoy = filteredClientes.filter((cliente) => {
        const proximoPago = new Date(cliente.fecha_proximo_pago).toLocaleDateString('es-ES');
        return proximoPago === today || new Date(cliente.fecha_proximo_pago) < new Date();
    });
    const clientesSinPagoHoy = filteredClientes.filter((cliente) => {
        const proximoPago = new Date(cliente.fecha_proximo_pago).toLocaleDateString('es-ES');
        return (
            proximoPago !== today &&
            new Date(cliente.fecha_proximo_pago) >= new Date() &&
            parseFloat(cliente.monto_actual) > 0
        );
    });
    const clientesMontoCero = filteredClientes.filter(
        (cliente) => parseFloat(cliente.monto_actual) === 0
    );

    // Renderizar lista de clientes
    const renderClienteList = (clientes) => (
        <FlatList
            data={clientes}
            keyExtractor={(item) => item.id_cliente.toString()}
            renderItem={({ item }) => (
                <ClienteCard
                    cliente={item}
                    onPress={() =>
                        navigation.navigate('Detalles del cliente', { id: item.id_cliente })
                    }
                    isAdmin={true}
                />
            )}
            ListEmptyComponent={
                <Text style={styles.emptyMessage}>No hay clientes disponibles.</Text>
            }
            contentContainerStyle={styles.listContent}
        />
    );

    const renderScene = ({ route }) => {
        if (route.key === 'pagosHoy' && index === 0) {
            return renderClienteList(clientesConPagoHoy);
        } else if (route.key === 'sinPagosHoy' && index === 1) {
            return renderClienteList(clientesSinPagoHoy);
        } else if (route.key === 'montoCero' && index === 2) {
            return renderClienteList(clientesMontoCero);
        }
        return null;
    };
    

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Clientes de {trabajadorNombre}</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar clientes"
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#d1a980"
            />
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={handleIndexChange}
                initialLayout={{ width: Dimensions.get('window').width }}
                lazy
                renderTabBar={(props) => (
                    <TabBar
                        {...props}
                        indicatorStyle={styles.tabIndicator}
                        style={styles.tabBar}
                        labelStyle={styles.tabLabel}
                    />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    title: {
        fontSize: 20,
        marginHorizontal: 20,
        marginTop: 15,
        fontWeight: 'bold',
        color: '#f5c469',
        letterSpacing: 0.8,
    },
    searchInput: {
        height: 45,
        margin: 15,
        borderColor: '#707070',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        color: '#d1a980',
        backgroundColor: '#1e1e1e',
        fontSize: 16,
    },
    listContent: { paddingBottom: 20 },
    tabBar: { backgroundColor: '#1c1c1e' },
    tabIndicator: { backgroundColor: '#FFD700' },
    tabLabel: { color: '#fff', fontWeight: 'bold' },
    emptyMessage: {
        textAlign: 'center',
        color: '#fff',
        marginTop: 20,
        fontSize: 16,
    },
});

export default TrabajadorClientes;
