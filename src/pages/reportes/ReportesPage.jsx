import React, { useState, useEffect } from 'react';
import { FaMicrophone, FaStop, FaFileDownload, FaTable, FaFilePdf, FaFileExcel, FaCalendarCheck, FaBoxes } from 'react-icons/fa';
import { generateReport, downloadReport, downloadSalesThisMonthExcel, downloadInventoryAvailablePdf } from '../../api/ReportApi';

const ReportesPage = () => {
    const [prompt, setPrompt] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const [voiceStatus, setVoiceStatus] = useState('');
    const [downloadFormat, setDownloadFormat] = useState('pdf');

    // Inicializar reconocimiento de voz
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = false;
            recognitionInstance.lang = 'es-ES';

            recognitionInstance.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setPrompt(transcript);
                setVoiceStatus(`Escuché: "${transcript}"`);
                setIsListening(false);
            };

            recognitionInstance.onerror = (event) => {
                setVoiceStatus(`Error: ${event.error}`);
                setIsListening(false);
            };

            recognitionInstance.onend = () => {
                setIsListening(false);
            };

            setRecognition(recognitionInstance);
        }
    }, []);

    // Manejar reconocimiento de voz
    const handleVoiceInput = () => {
        if (!recognition) {
            alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
            return;
        }

        if (isListening) {
            recognition.stop();
            setIsListening(false);
            setVoiceStatus('');
        } else {
            setVoiceStatus('Escuchando... Habla ahora');
            setIsListening(true);
            recognition.start();
        }
    };

    // Generar reporte (JSON preview)
    const handleGenerateReport = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) {
            setError('Por favor, escribe o dicta un reporte');
            return;
        }

        setLoading(true);
        setError(null);
        setReportData(null);

        try {
            const data = await generateReport(prompt);
            setReportData(data.report_data);
            setVoiceStatus('');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al generar el reporte');
        } finally {
            setLoading(false);
        }
    };

    // Descargar reporte en formato específico
    const handleDownloadReport = async (format) => {
        if (!prompt.trim()) {
            setError('Por favor, escribe o dicta un reporte primero');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const promptWithFormat = `${prompt} en ${format}`;
            const blob = await downloadReport(promptWithFormat);
            
            // Crear enlace de descarga
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `reporte_inventario.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setVoiceStatus(`Reporte descargado en formato ${format.toUpperCase()}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al descargar el reporte');
        } finally {
            setLoading(false);
        }
    };

    // Descargar reporte estándar de ventas del mes
    const handleDownloadSalesMonth = async () => {
        setLoading(true);
        setError(null);

        try {
            const blob = await downloadSalesThisMonthExcel();
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const today = new Date();
            const monthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            link.download = `ventas_${monthYear}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setVoiceStatus('Reporte de ventas del mes descargado exitosamente');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al descargar el reporte de ventas');
        } finally {
            setLoading(false);
        }
    };

    // Descargar reporte estándar de inventario disponible
    const handleDownloadInventory = async () => {
        setLoading(true);
        setError(null);

        try {
            const blob = await downloadInventoryAvailablePdf();
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'inventario_disponible.pdf';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setVoiceStatus('Reporte de inventario descargado exitosamente');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al descargar el reporte de inventario');
        } finally {
            setLoading(false);
        }
    };

    // Ejemplos de prompts
    const ejemplos = [
        "Reporte de inventario disponible en PDF",
        "Dame el inventario agrupado por categoría",
        "Productos vendidos de la marca Samsung",
        "Reporte de inventario de línea blanca",
        "Inventario agrupado por marca en Excel"
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Generador de Reportes</h1>
                <p className="text-gray-600 mt-2">
                    Genera reportes usando texto o voz en lenguaje natural
                </p>
            </div>

            {/* Formulario de entrada */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Describe el reporte que necesitas
                    </label>
                    <div className="flex gap-2">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleGenerateReport(e);
                                }
                            }}
                            placeholder="Ej: Dame un reporte de inventario disponible agrupado por categoría en PDF"
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows="3"
                        />
                        <button
                            type="button"
                            onClick={handleVoiceInput}
                            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                                isListening
                                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                                    : 'bg-blue-500 hover:bg-blue-600'
                            } text-white flex items-center justify-center`}
                            title={isListening ? 'Detener' : 'Usar voz'}
                        >
                            {isListening ? <FaStop size={24} /> : <FaMicrophone size={24} />}
                        </button>
                    </div>
                    {voiceStatus && (
                        <p className="mt-2 text-sm text-blue-600 italic">{voiceStatus}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                        💡 Presiona <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Enter</kbd> para generar o <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Shift + Enter</kbd> para nueva línea
                    </p>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={handleGenerateReport}
                        disabled={loading || !prompt.trim()}
                        className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
                    >
                        <FaTable />
                        {loading ? 'Generando...' : 'Generar Vista Previa'}
                    </button>

                    <button
                        type="button"
                        onClick={() => handleDownloadReport('pdf')}
                        disabled={loading || !prompt.trim()}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
                    >
                        <FaFilePdf />
                        Descargar PDF
                    </button>

                    <button
                        type="button"
                        onClick={() => handleDownloadReport('excel')}
                        disabled={loading || !prompt.trim()}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
                    >
                        <FaFileExcel />
                        Descargar Excel
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}
            </div>

            {/* Reportes Estándar */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-md p-6 mb-6 border-2 border-purple-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <FaFileDownload className="mr-2 text-purple-600" />
                    Reportes Estándar (Descarga Rápida)
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                    Reportes predefinidos listos para descargar con un solo clic
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={handleDownloadSalesMonth}
                        disabled={loading}
                        className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-green-300 hover:border-green-500 hover:bg-green-50 rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="bg-green-100 p-3 rounded-full">
                            <FaCalendarCheck className="text-2xl text-green-600" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-800">Ventas del Mes Actual</h3>
                            <p className="text-xs text-gray-600">Descarga en formato Excel (.xlsx)</p>
                        </div>
                    </button>

                    <button
                        onClick={handleDownloadInventory}
                        disabled={loading}
                        className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="bg-blue-100 p-3 rounded-full">
                            <FaBoxes className="text-2xl text-blue-600" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-800">Inventario Disponible</h3>
                            <p className="text-xs text-gray-600">Agrupado por categoría - PDF</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Ejemplos */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Ejemplos de reportes personalizados:</h2>
                <div className="flex flex-wrap gap-2">
                    {ejemplos.map((ejemplo, index) => (
                        <button
                            key={index}
                            onClick={() => setPrompt(ejemplo)}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                        >
                            {ejemplo}
                        </button>
                    ))}
                </div>
            </div>

            {/* Vista previa de datos */}
            {reportData && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Resultados del Reporte
                    </h2>
                    
                    {reportData.length === 0 ? (
                        <p className="text-gray-500 italic">No se encontraron datos para este reporte</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {Object.keys(reportData[0]).map((key) => (
                                            <th
                                                key={key}
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                {key.replace(/_/g, ' ').replace(/catalogo /g, '')}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reportData.map((row, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            {Object.values(row).map((value, i) => (
                                                <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {value !== null && value !== undefined ? String(value) : '-'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-4 text-sm text-gray-600">
                                Total de registros: <span className="font-semibold">{reportData.length}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Guía de uso */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Guía de uso:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Tipo:</strong> "reporte de inventario" o "productos"</li>
                    <li>• <strong>Filtros:</strong> "disponible", "vendido", nombre de marca o categoría</li>
                    <li>• <strong>Agrupación:</strong> "agrupado por categoría" o "agrupado por marca"</li>
                    <li>• <strong>Formato:</strong> "en PDF" o "en Excel" (o usa los botones de descarga)</li>
                    <li>• <strong>Voz:</strong> Haz clic en el micrófono y di tu reporte en voz alta</li>
                </ul>
            </div>
        </div>
    );
};

export default ReportesPage;
