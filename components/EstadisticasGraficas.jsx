import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, StyleSheet, Dimensions } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, PieChart, LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const EstadisticasGraficas = () => {
    const [estadisticas, setEstadisticas] = useState(null);
    const [trabajadorEstadisticas, setTrabajadorEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEstadisticas = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }

                const response = await axios.get('http://192.168.1.17:3000/estadisticas/general', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const trabajadorResponse = await axios.get('http://192.168.1.17:3000/estadisticas/trabajadores', {
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

    if (!estadisticas || !trabajadorEstadisticas) {
        return (
            <View>
                <Text>No se pudieron cargar las estadísticas</Text>
            </View>
        );
    }
    

    const totalPrestamosActivos = estadisticas ? estadisticas.filter(item => item.estado === 'pendiente').length : 0;
    const totalPrestamosCompletados = estadisticas ? estadisticas.filter(item => item.estado === 'completado').length : 0;

    const barData = estadisticas && estadisticas.length > 0 ? {
        labels: estadisticas.map(item => new Date(item.fecha_inicio).toLocaleDateString('es-ES', { month: 'short' })),
        datasets: [
            {
                data: estadisticas.map(item => Number(item.monto_inicial) || 0),
                color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
            }
        ]
    } : {
        labels: [],
        datasets: [{ data: [] }]
    };
    
    

    const pieData = [
        {
            name: 'pendiente',
            population: totalPrestamosActivos,
            color: 'rgba(131, 167, 234, 1)',
            legendFontColor: '#7F7F7F',
            legendFontSize: 15,
        },
        {
            name: 'completado',
            population: totalPrestamosCompletados,
            color: '#F00',
            legendFontColor: '#7F7F7F',
            legendFontSize: 15,
        }
    ];

    const lineData = {
        labels: estadisticas ? estadisticas.map(item => new Date(item.fecha_inicio).toLocaleDateString('es-ES', { month: 'short' })) : [],
        datasets: [
            {
                data: estadisticas ? estadisticas.map(item => {
                    const monto = Number(item.monto_inicial);
                    return isNaN(monto) ? 0 : monto;
                }) : [],
                color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                strokeWidth: 2,
            }
        ],
        legend: ['Monto Inicial'],
    };
    

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.chartTitle}>Gráfico de Barras</Text>
            <BarChart
                data={barData}
                width={screenWidth - 20}
                height={300}
                yAxisLabel="$"
                chartConfig={chartConfig}
                style={styles.chart}
            />

            <Text style={styles.chartTitle}>Gráfico de Pastel</Text>
            <PieChart
                data={pieData}
                width={screenWidth - 20}
                height={300}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                style={styles.chart}
            />

            <Text style={styles.chartTitle}>Gráfico de Tendencia</Text>
            <LineChart
                data={lineData}
                width={screenWidth - 20}
                height={300}
                yAxisLabel="$"
                chartConfig={chartConfig}
                style={styles.chart}
            />
        </ScrollView>
    );
};

const chartConfig = {
    backgroundColor: '#1cc910',
    backgroundGradientFrom: '#eff3ff',
    backgroundGradientTo: '#efefef',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#ffffff'
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center'
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16
    },
});

export default EstadisticasGraficas;
