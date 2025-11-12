import react, {useEffect, useState} from 'react';
import {getAllBitacora} from '../../api/BitacoraApi.jsx';
import Table from '../../components/Table.jsx'
import {FaEye, FaTrashAlt, FaEdit, FaHistory} from 'react-icons/fa'

const BitacoraList = () => {
    const [bitacora, setBitacora] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {loadBitacora();}, []);

    const loadBitacora = async () => {
        try{
            setIsLoading(true);
            const data = await getAllBitacora();
            setBitacora(data);
        }catch(err){
            setError("Error al cargar los datos de la bitacora");
            console.error(err);
        }finally{
            setIsLoading(false);
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id'},
        { header: 'Username', accessor: 'usuario_username'},
        {header: 'Accion', accessor: 'accion'},
        {header: 'Descripcion', accessor: 'descripcion'},
        {header: 'Modulo', accessor: 'modulo'},
        {header: 'IP', accessor: 'ip_address'},
        {header: 'fecha y hora', accessor: 'fecha_hora_formateada'},
    ]

    if (isLoading) return <div className="p-8">Cargando...</div>;
    
    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
                        <FaHistory className="mr-3 text-blue-600" />
                        Gestionar Bitácora
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Total de registros: {bitacora.length}
                    </p>
                </div>
            </div>

            {/* Table */}
            <Table columns={columns} data={bitacora} />
        </div>
    );
}

export default BitacoraList;