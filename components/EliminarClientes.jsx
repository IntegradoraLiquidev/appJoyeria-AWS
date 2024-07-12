import React from 'react';

const EliminarClientes = ({ cliente, onEliminar }) => {
    const handleEliminar = () => {
        onEliminar(cliente.id);
    };

    return (
        <div>
            <h2>Eliminar Cliente</h2>
            <p>¿Estás seguro de que deseas eliminar a {cliente.nombre}?</p>
            <button onClick={handleEliminar}>Eliminar</button>
        </div>
    );
};

export default EliminarClientes;
