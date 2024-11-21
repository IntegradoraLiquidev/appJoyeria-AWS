import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';

const FloatingLabelInput = ({ label, value, onChangeText, keyboardType = 'default', ...props }) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const labelStyle = {
        position: 'absolute',
        left: 12,
        zIndex: 1,
        top: (isFocused || value) ? -10 : 12, 
        fontSize: (isFocused || value) ? 12 : 16,
        color: (isFocused || value) ? '#FFD700' : '#999', 
    };

    return (
        <View style={styles.inputContainer}>
            <Text style={labelStyle}>{label}</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                onFocus={handleFocus}
                onBlur={handleBlur}
                keyboardType={keyboardType}
                {...props}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    input: {
        backgroundColor: '#1c1c1e',
        borderRadius: 10,
        padding: 12,
        paddingTop: 20,
        color: '#fff',
        fontSize: 16,
    },
});

export default FloatingLabelInput;
