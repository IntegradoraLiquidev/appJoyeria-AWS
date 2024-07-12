// components/Navbar.js
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

const Navbar = ({ navigation }) => {
    return (
        <View style={styles.navbar}>
            <Button title="Inicio" onPress={() => navigation.navigate('WorkerDashboard')} />
            <Button title="Agregar Cliente" onPress={() => navigation.navigate('NuevoCliente')} />
        </View>
    );
};

const styles = StyleSheet.create({
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
});

export default Navbar;
