import React, { useState, useEffect } from 'react';
import { 
    View, 
    FlatList, 
    StyleSheet, 
    TextInput, 
    Text, 
    TouchableOpacity, 
    LayoutAnimation, 
    UIManager, 
    Platform 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import ClienteCard from '../components/ClienteCard';
import { Ionicons } from '@expo/vector-icons';

// Habilitar LayoutAnimation para Android (opcional)
if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const WorkerDashboard = ({ navigation }) => {
    const [clientes, setClientes] = useState([]);
    const [abonados, setAbonados] = useState([]); // Clientes que ya abonaron
    const [searchText, setSearchText] = useState('');
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [isAbonadosVisible, setIsAbonadosVisible] = useState(false); // Estado del acordeón
    const isFocused = useIsFocused();

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }
                const response = await axios.get('http://192.168.1.10:3000/api/clientes', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const clientesConMonto = response.data.filter(
                    (cliente) => cliente.monto_actual > 0
                );

                // Separar clientes según si abonaron hoy o no
                const clientesPendientes = clientesConMonto.filter(
                    (cliente) => cliente.debeAbonarHoy
                );
                const clientesAbonados = clientesConMonto.filter(
                    (cliente) => !cliente.debeAbonarHoy
                );

                setClientes(clientesPendientes);
                setAbonados(clientesAbonados);
                setFilteredClientes(clientesPendientes);
            } catch (error) {
                console.error(error);
            }
        };

        if (isFocused) {
            fetchClientes();
        }
    }, [isFocused]);

    useEffect(() => {
        const filtered = clientes.filter((cliente) =>
            cliente.nombre.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredClientes(filtered);
    }, [searchText, clientes]);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    const toggleAbonados = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsAbonadosVisible(!isAbonadosVisible);
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Clientes</Text>
                <Ionicons
                    name={'exit-outline'}
                    size={32}
                    color={'#ff6347'}
                    onPress={handleLogout}
                    style={styles.logoutIcon}
                />
            </View>

            <TextInput
                style={styles.searchInput}
                placeholder="Buscar cliente"
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#d1a980"
            />

            {/* Lista de Clientes Pendientes */}
            <FlatList
                data={filteredClientes}
                keyExtractor={(item) =>
                    item.id_cliente ? item.id_cliente.toString() : Math.random().toString()
                }
                renderItem={({ item }) => (
                    <ClienteCard
                        cliente={item}
                        onPress={() =>
                            navigation.navigate('Detalles del cliente', { id: item.id_cliente })
                        }
                    />
                )}
                contentContainerStyle={styles.listContent}
            />

            {/* Acordeón de Clientes Abonados */}
            <TouchableOpacity onPress={toggleAbonados} style={styles.accordionHeader}>
                <Text style={styles.accordionHeaderText}>Clientes que ya abonaron</Text>
                <Ionicons 
                    name={isAbonadosVisible ? 'chevron-up' : 'chevron-down'} 
                    size={24} 
                    color="#fff" 
                />
            </TouchableOpacity>

            {isAbonadosVisible && (
                <FlatList
                    data={abonados}
                    keyExtractor={(item) => 
                        item.id_cliente ? item.id_cliente.toString() : Math.random().toString()
                    }
                    renderItem={({ item }) => (
                        <ClienteCard
                            cliente={item}
                            onPress={() =>
                                navigation.navigate('Detalles del cliente', { id: item.id_cliente })
                            }
                        />
                    )}
                    ListEmptyComponent={<Text>No hay clientes que hayan abonado.</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f0f',
        padding: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#f5c469',
        letterSpacing: 0.5,
    },
    logoutIcon: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#1c1c1e',
    },
    searchInput: {
        height: 45,
        borderColor: '#707070',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        color: '#d1a980',
        backgroundColor: '#1c1c1e',
        marginBottom: 15,
        fontSize: 16,
    },
    listContent: {
        paddingBottom: 20,
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    accordionHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
});

export default WorkerDashboard;
