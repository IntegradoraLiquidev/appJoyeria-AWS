import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Platform, Dimensions, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Table, Row, Rows } from 'react-native-table-component';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import DropDownPicker from 'react-native-dropdown-picker';

const screenWidth = Dimensions.get('window').width;

const EstadisticasTablas = () => {
    const [estadisticas, setEstadisticas] = useState(null);
    const [trabajadorEstadisticas, setTrabajadorEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [workerSearchQuery, setWorkerSearchQuery] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(rowsPerPage);
    const [items, setItems] = useState([
        { label: '5', value: 5 },
        { label: '10', value: 10 },
        { label: '15', value: 15 },
        { label: '20', value: 20 }
    ]);

    useEffect(() => {
        const fetchEstadisticas = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }

                const response = await axios.get('http://192.168.1.67:3000/estadisticas/general', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const trabajadorResponse = await axios.get('http://192.168.1.67:3000/estadisticas/trabajadores', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setEstadisticas(response.data);
                setTrabajadorEstadisticas(trabajadorResponse.data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchEstadisticas();
    }, []);

    useEffect(() => {
        setValue(rowsPerPage);
    }, [rowsPerPage]);

    const exportToCSV = async (data, filename) => {
        const formattedData = data.map(item => ({
            'Nombre cliente': item.nombre,
            'Direccion': item.direccion,
            'Telefono': item.telefono,
            'Monto inicial': item.monto_inicial,
            'Esquema de Dias-%': `${item.dias_prestamo || 'Desconocido'} Dias $${item.cobro_diario ? Math.round(item.cobro_diario) : '0'} *$1000`,
            'Fecha de inicio del prestamo': new Date(item.fecha_inicio).toLocaleDateString('es-ES', {
                day: '2-digit', month: 'long', year: 'numeric'
            }),
            'Fecha de termino': new Date(item.fecha_termino).toLocaleDateString('es-ES', {
                day: '2-digit', month: 'long', year: 'numeric'
            }),
            'Observaciones': item.ocupacion
        }));

        const ws = XLSX.utils.json_to_sheet(formattedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Estadísticas");
        const wbout = XLSX.write(wb, { type: 'binary', bookType: "xlsx" });

        const s2ab = (s) => {
            const buf = new ArrayBuffer(s.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i !== s.length; ++i) {
                view[i] = s.charCodeAt(i) & 0xFF;
            }
            return buf;
        };

        const bufferToBase64 = (buffer) => {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
        };

        const uri = FileSystem.cacheDirectory + `${filename}.xlsx`;
        await FileSystem.writeAsStringAsync(uri, bufferToBase64(s2ab(wbout)), { encoding: FileSystem.EncodingType.Base64 });

        if (Platform.OS === 'android') {
            await Sharing.shareAsync(uri);
        } else {
            Sharing.shareAsync(uri);
        }
    };

    const exportTrabajadorToCSV = async (data, filename) => {
        const formattedData = data.map(item => ({
            'Nombre Trabajador': item.trabajador_nombre,
            'Fecha': new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
            'Total Abonos Día': item.total_abonos_hoy,
            'Total Abonos Semana': item.total_abonos_semana,
            'Total Multas Día': item.total_multas_hoy,
            'Total Multas Semana': item.total_multas_semana,
        }));

        const ws = XLSX.utils.json_to_sheet(formattedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Estadísticas Trabajador");
        const wbout = XLSX.write(wb, { type: 'binary', bookType: "xlsx" });

        const s2ab = (s) => {
            const buf = new ArrayBuffer(s.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i !== s.length; ++i) {
                view[i] = s.charCodeAt(i) & 0xFF;
            }
            return buf;
        };

        const bufferToBase64 = (buffer) => {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
        };

        const uri = FileSystem.cacheDirectory + `${filename}.xlsx`;
        await FileSystem.writeAsStringAsync(uri, bufferToBase64(s2ab(wbout)), { encoding: FileSystem.EncodingType.Base64 });

        if (Platform.OS === 'android') {
            await Sharing.shareAsync(uri);
        } else {
            await Sharing.shareAsync(uri);
        }
    };

    const handleSearch = (data, query, searchField) => {
        if (query.trim() === '') {
            return data;
        }
        return data.filter(item => (item[searchField] || '').toLowerCase().includes(query.toLowerCase()));
    };

    const filteredEstadisticas = estadisticas ? handleSearch(estadisticas, searchQuery, 'nombre').slice(0, rowsPerPage) : [];
    const filteredTrabajadorEstadisticas = trabajadorEstadisticas ? handleSearch(trabajadorEstadisticas, workerSearchQuery, 'trabajador_nombre').slice(0, rowsPerPage) : [];

    const tableHead = ['Nombre cliente', 'Direccion', 'Telefono', 'Monto inicial', 'Esquema de Dias-%', 'Fecha de inicio del prestamo', 'Fecha de termino', 'Observaciones'];
    const tableData = filteredEstadisticas.map(item => [
        item.nombre,
        item.direccion,
        item.telefono,
        item.monto_inicial,
        `${item.dias_prestamo || 'Desconocido'} Dias $${item.cobro_diario ? Math.round(item.cobro_diario) : '0'} *$1000`,
        new Date(item.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
        new Date(item.fecha_termino).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
        item.ocupacion
    ]);

    const trabajadorTableHead = ['Nombre Trabajador', 'Fecha', 'Total Abonos Día', 'Total Abonos Semana', 'Total Multas Día', 'Total Multas Semana'];
    const trabajadorTableData = filteredTrabajadorEstadisticas.map(item => [
        item.trabajador_nombre,
        new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
        item.total_abonos_hoy,
        item.total_abonos_semana,
        item.total_multas_hoy,
        item.total_multas_semana,
    ]);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (error) {
        return <Text style={styles.errorText}>{error.message}</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Estadísticas Trabajadores</Text>

            <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre"
                value={workerSearchQuery}
                onChangeText={setWorkerSearchQuery}
            />

            <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                placeholder="Seleccionar cantidad de filas por página"
                onChangeValue={(val) => setRowsPerPage(val)}
            />

            <ScrollView horizontal style={styles.horizontalScroll}>
                <Table borderStyle={styles.border}>
                    <Row data={trabajadorTableHead} style={styles.head} textStyle={styles.text} />
                    <Rows data={trabajadorTableData} textStyle={styles.text} />
                </Table>
            </ScrollView>

            <Button
                title="Exportar a CSV"
                onPress={() => exportTrabajadorToCSV(trabajadorEstadisticas, 'estadisticas_trabajador')}
            />

            <View style={styles.separator} />

            <Text style={styles.title}>Estadísticas Generales</Text>

            <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                placeholder="Seleccionar cantidad de filas por página"
                onChangeValue={(val) => setRowsPerPage(val)}
            />

            <ScrollView horizontal style={styles.horizontalScroll}>
                <Table borderStyle={styles.border}>
                    <Row data={tableHead} style={styles.head} textStyle={styles.text} />
                    <Rows data={tableData} textStyle={styles.text} />
                </Table>
            </ScrollView>

            <Button
                title="Exportar a CSV"
                onPress={() => exportToCSV(estadisticas, 'estadisticas_general')}
            />

            <View style={styles.footerSpace} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
        textAlign: 'center'
    },
    searchInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        width: screenWidth - 32
    },
    border: {
        borderWidth: 1,
        borderColor: '#c8e1ff',
    },
    head: {
        height: 50,
        backgroundColor: '#f1f8ff',
    },
    text: {
        margin: 6,
        textAlign: 'center',
        width: screenWidth / 8,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
    horizontalScroll: {
        marginVertical: 10,
    },
    separator: {
        height: 20,
    },
    footerSpace: {
        height: 50,
    },
});

export default EstadisticasTablas;
