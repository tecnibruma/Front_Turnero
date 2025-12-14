import axios from 'axios';

const API_URL = 'http://localhost:8080/api/turnos';

export const obtenerDisponibilidad = async (fecha) => {
    try {
        const response = await axios.get(`${API_URL}/disponibilidad`, {
            params: { fecha: fecha }
        });
        return response.data; 
    } catch (error) {
        console.error("Error al obtener disponibilidad:", error);
        throw error;
    }
};

export const reservarTurno = async (turnoData) => {
    try {
        const response = await axios.post(`${API_URL}/reservar`, turnoData);
        return response.data;
    } catch (error) {
        console.error("Error al reservar el turno:", error.response ? error.response.data : error.message);
        throw error;
    }
};