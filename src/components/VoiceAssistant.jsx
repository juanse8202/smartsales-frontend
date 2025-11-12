import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { FaMicrophone, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const VoiceAssistant = () => {
  const { addItem } = useCart();
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVoiceCommand = () => {
    // 1. Verificar soporte del navegador
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz. Intenta con Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('Escuchando... 🎤');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Error de reconocimiento:', event.error);
      setIsListening(false);
      setStatus('❌ Error al escuchar');
      setTimeout(() => setStatus(''), 3000);
    };

    recognition.onresult = async (event) => {
      let transcript = event.results[0][0].transcript;
      transcript = transcript.replace(/\.$/, '').trim();
      setStatus(`Buscando: "${transcript}"... 🔍`);
      setIsProcessing(true);

      try {
        // 2. Buscar en el backend
        const accessToken = localStorage.getItem('access_token');
        const searchRes = await axios.get(`${API_URL}catalogo/`, {
          params: { search: transcript },
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        });

        // Asegurarse de que data es un array
        // Intenta obtener .results si existe (paginación), si no, usa .data directamente
        const resultados = searchRes.data.results || (Array.isArray(searchRes.data) ? searchRes.data : []); 

        if (resultados.length > 0) {
          // Filtrar solo productos activos con stock
          const productosDisponibles = resultados.filter(
            p => p.estado === 'activo' && p.stock_disponible > 0
          );

          if (productosDisponibles.length > 0) {
            const producto = productosDisponibles[0];
            setStatus(`Encontrado: ${producto.nombre}. Agregando... 🛒`);

            // 3. Agregar al carrito usando el context
            const result = await addItem(producto.id, 1);

            if (result.success) {
              setStatus(`✅ ¡${producto.nombre} agregado al carrito!`);
            } else {
              setStatus('❌ Error al agregar al carrito');
            }
          } else {
            setStatus(`❌ "${transcript}" no tiene stock disponible`);
          }
        } else {
          setStatus(`❌ No encontré productos para "${transcript}"`);
        }
      } catch (error) {
        console.error("Error en voz:", error);
        setStatus('❌ Error al procesar tu solicitud');
      } finally {
        setIsProcessing(false);
      }

      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => setStatus(''), 3000);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleVoiceCommand}
        disabled={isListening || isProcessing}
        className={`
          relative p-3 rounded-full transition-all duration-300 shadow-lg
          ${isListening 
            ? 'bg-red-500 animate-pulse' 
            : isProcessing
            ? 'bg-yellow-500'
            : 'bg-blue-600 hover:bg-blue-700 hover:scale-110'
          }
          text-white disabled:cursor-not-allowed
        `}
        title="Buscar por voz"
      >
        {isProcessing ? (
          <FaSpinner className="w-5 h-5 animate-spin" />
        ) : (
          <FaMicrophone className="w-5 h-5" />
        )}
      </button>
      
      {status && (
        <div className="absolute top-20 right-4 bg-white shadow-lg rounded-lg p-3 max-w-xs z-50 border border-gray-200 animate-fade-in">
          <p className="text-sm text-gray-800 font-medium">{status}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
