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
import Icon from 'react-native-vector-icons/MaterialIcons';
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
        { key: 'pagosHoy', title: 'Con pago hoy' },
        { key: 'atrasados', title: 'Atrasados' },
        { key: 'sinPagosHoy', title: 'Sin pago hoy' },
        { key: 'montoCero', title: 'Finalizados' },
    ];

    const navigation = useNavigation();

    // Fetch inicial de los clientes
    const fetchClientes = async () => {
        try {
            const response = await axios.get(`http://192.168.1.15:3000/api/clientes/clientes/${id}`);
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
        return (
            proximoPago === today &&
            new Date(cliente.fecha_proximo_pago) < new Date() &&
            parseFloat(cliente.monto_actual) > 0 // Excluir clientes con monto_actual 0
        );
    });
    const clientesSinPagoHoy = filteredClientes.filter((cliente) => {
        const proximoPago = new Date(cliente.fecha_proximo_pago).toLocaleDateString('es-ES');
        return (
            proximoPago !== today &&
            new Date(cliente.fecha_proximo_pago) >= new Date() &&
            parseFloat(cliente.monto_actual) > 0 // Excluir clientes con monto_actual 0
        );
    });

    // Clientes atrasados (fecha de pago es anterior a hoy y aún deben dinero)
    const clientesAtrasados = filteredClientes.filter((cliente) => {
        const proximoPago = new Date(cliente.fecha_proximo_pago).toLocaleDateString('es-ES');
        return (
            proximoPago < today &&
            parseFloat(cliente.monto_actual) > 0 // Asegurarse de que aún deben dinero
        );
    });

    const clientesMontoCero = filteredClientes.filter(
        (cliente) => parseFloat(cliente.monto_actual) === 0
    );


    const handleEdit = (cliente) => {
        navigation.navigate('EditarClientes', { cliente, refreshClientes: fetchClientes });
    };

    const handleDelete = async (clienteId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const response = await axios.delete(`http://192.168.1.15:3000/api/clientes/${clienteId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    setClientes((prevClientes) => prevClientes.filter((cliente) => cliente.id_cliente !== clienteId));
                    alert('Cliente eliminado correctamente');
                } else {
                    alert('Error al eliminar el cliente');
                }
            }
        } catch (error) {
            console.error('Error al eliminar el cliente:', error);
            alert('Error al eliminar el cliente');
        }
    };

    // Renderizar lista de clientes
    const renderClienteList = (clientes) => (
        <FlatList
            data={clientes}
            keyExtractor={(item) => item.id_cliente.toString()}
            renderItem={({ item }) => (
                <ClienteCard
                    cliente={item}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onExport={handleEdit}
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
        } else if (route.key === 'atrasados' && index === 1) {
            return renderClienteList(clientesAtrasados);
        } else if (route.key === 'sinPagosHoy' && index === 2) {
            return renderClienteList(clientesSinPagoHoy);
        } else if (route.key === 'montoCero' && index === 3) {
            return renderClienteList(clientesMontoCero);
        }
        return null;
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Clientes de {trabajadorNombre}</Text>
            <View style={styles.searchContainer}>
                <Icon name="search" size={24} color="#d1a980" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar clientes"
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholderTextColor="#d1a980"
                />
            </View>
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
                        tabStyle={styles.tabStyle}
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#707070',
        borderWidth: 1,
        borderRadius: 10,
        marginHorizontal: 16,
        marginVertical: 10,
        backgroundColor: '#1e1e1e',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
        elevation: 3,
    },
    searchIcon: {
        marginHorizontal: 10,
    },
    searchInput: {
        flex: 1,
        color: '#d1a980',
        fontSize: 16,
        paddingVertical: 10,
    },
    listContent: { paddingBottom: 20 },
    tabBar: { 
        backgroundColor: '#1c1c1e',
        paddingVertical: 1, // Añadido para espaciar las pestañas verticalmente
    },
    tabIndicator: { 
        backgroundColor: '#FFD700', 
        height: 3, // Altura del indicador
    },
    tabLabel: { 
        color: '#fff', 
        fontWeight: 'bold',
        fontSize: 10, // Tamaño reducido de la fuente para que no se vea apretado
    },
    tabStyle: { 
        paddingHorizontal: 1, // Espaciado horizontal para cada pestaña
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#fff',
        marginTop: 20,
        fontSize: 16,
    },
});


export default TrabajadorClientes;
