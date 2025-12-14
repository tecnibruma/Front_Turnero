import React, { useState, useEffect } from 'react';
import { obtenerDisponibilidad, reservarTurno } from './TurnosService'; // Importamos la nueva función
import './index.css';

// Estado inicial del formulario de reserva
const INITIAL_RESERVA_STATE = {
  fecha: '',
  horaInicio: '',
  nombreCliente: '',
  emailCliente: ''
};

function App() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [mensajeError, setMensajeError] = useState('');

  // 1. Estados para la Reserva
  const [reservaData, setReservaData] = useState(INITIAL_RESERVA_STATE);
  const [reservaMensaje, setReservaMensaje] = useState(null); // { type: 'success'|'error', text: 'Mensaje' }
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null); // Guarda el horario clicado

  // Función para obtener la fecha de mañana en formato YYYY-MM-DD
  const getFechaManana = () => {
    const manana = new Date();
    // Añade un día para asegurar que la fecha esté en el futuro y sea válida
    manana.setDate(manana.getDate() + 1); 
    return manana.toISOString().split('T')[0];
  };

  // Efecto para cargar disponibilidad cuando la fecha cambia
  useEffect(() => {
    if (fechaSeleccionada) {
      cargarDisponibilidad(fechaSeleccionada);
      setTurnoSeleccionado(null); // Resetear selección al cambiar fecha
      setReservaMensaje(null); // Resetear mensajes
    }
  }, [fechaSeleccionada]);

  // Cargar disponibilidad de la API
  const cargarDisponibilidad = async (fecha) => {
    setMensajeError('');
    setHorariosDisponibles([]);
    try {
      const data = await obtenerDisponibilidad(fecha);
      setHorariosDisponibles(data);
    } catch (error) {
      setMensajeError('Error al cargar la disponibilidad. Asegúrate de que el Backend esté corriendo.');
    }
  };
  
  // Manejador del cambio de fecha
  const handleFechaChange = (event) => {
    setFechaSeleccionada(event.target.value);
  };
  
  // Inicializar con la fecha de mañana al cargar
  useEffect(() => {
    setFechaSeleccionada(getFechaManana());
  }, []);

  // Función que se ejecuta al hacer clic en un horario
  const seleccionarTurno = (hora) => {
    setTurnoSeleccionado(hora);
    setReservaMensaje(null);
    setReservaData({
      ...INITIAL_RESERVA_STATE,
      fecha: fechaSeleccionada,
      horaInicio: hora
    });
  };

  // Manejador de cambios en el formulario de reserva
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setReservaData(prev => ({ ...prev, [name]: value }));
  };

  // 2. Función que llama a la API de Reserva
  const handleReservaSubmit = async (event) => {
    event.preventDefault();
    setReservaMensaje(null);

    // Validación básica
    if (!reservaData.nombreCliente || !reservaData.emailCliente) {
        setReservaMensaje({ type: 'error', text: 'Por favor, completa todos los campos.' });
        return;
    }

    try {
      const turnoReservado = await reservarTurno(reservaData);
      
      setReservaMensaje({ 
        type: 'success', 
        text: `¡Turno reservado con éxito! ID: ${turnoReservado.id}. Recibirás una confirmación en ${turnoReservado.emailCliente}`
      });
      
      // Recargar la disponibilidad para que el turno reservado desaparezca de la lista
      cargarDisponibilidad(fechaSeleccionada);
      setTurnoSeleccionado(null); // Ocultar el formulario
      setReservaData(INITIAL_RESERVA_STATE);

    } catch (error) {
        // El backend devuelve el mensaje de error de la excepción (ej. "Turno no disponible")
        const errorMessage = error.response && error.response.data 
                             ? error.response.data 
                             : 'Error al procesar la reserva. Intenta de nuevo.';
        
        setReservaMensaje({ 
            type: 'error', 
            text: errorMessage 
        });
    }
  };

  return (
    <div className="App">
      <h1>📅 Sistema de Reserva de Turnos</h1>
      
      <div className="card">
        <label htmlFor="fecha">Selecciona una Fecha:</label>
        <input 
          type="date" 
          id="fecha" 
          value={fechaSeleccionada} 
          onChange={handleFechaChange}
        />
      </div>

      <h2>Horarios Disponibles para el {fechaSeleccionada}</h2>
      
      {mensajeError && <p style={{ color: 'red' }}>{mensajeError}</p>}
      
      {/* Muestra mensajes de Éxito/Error de la Reserva */}
      {reservaMensaje && (
        <p style={{ 
            color: reservaMensaje.type === 'success' ? 'green' : 'red',
            fontWeight: 'bold'
        }}>
            {reservaMensaje.text}
        </p>
      )}

      {/* 3. Renderiza la lista de horarios */}
      {horariosDisponibles.length > 0 ? (
        <ul className="horarios-list">
          {horariosDisponibles.map((hora) => (
            <li 
              key={hora} 
              onClick={() => seleccionarTurno(hora)}
              className={turnoSeleccionado === hora ? 'selected-time' : ''}
            >
              {hora}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay horarios disponibles para la fecha seleccionada.</p>
      )}

      {/* 4. Formulario de Reserva Condicional */}
      {turnoSeleccionado && (
        <div className="card reserva-form-card">
          <h3>Reservar Turno a las {turnoSeleccionado}</h3>
          
          <form onSubmit={handleReservaSubmit}>
            <div className="form-group">
                <label htmlFor="nombreCliente">Nombre Completo:</label>
                <input 
                    type="text" 
                    id="nombreCliente" 
                    name="nombreCliente"
                    value={reservaData.nombreCliente}
                    onChange={handleFormChange}
                    required
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="emailCliente">Email:</label>
                <input 
                    type="email" 
                    id="emailCliente" 
                    name="emailCliente"
                    value={reservaData.emailCliente}
                    onChange={handleFormChange}
                    required
                />
            </div>

            <button type="submit">Confirmar Reserva</button>
            <button type="button" onClick={() => setTurnoSeleccionado(null)} style={{ marginLeft: '10px' }}>
                Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;