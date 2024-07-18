import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

const Navbar = ({ navigation }) => {
    return (
        <View style={styles.navbar}>
            <Button
                title="Inicio"
                onPress={() => navigation.navigate('WorkerDashboard')}
                color="#2e5c74"
            />
            <Button
                title="Agregar Cliente"
                onPress={() => navigation.navigate('NuevoCliente')}
                color="#2e5c74"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 10,
    },
});

export default Navbar;
