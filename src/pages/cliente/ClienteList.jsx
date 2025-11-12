import react, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import {getAllClientes, deleteCliente} from '../../api/ClienteApi.jsx';
import Table from '../../components/Table.jsx';
import SearchBar from '../../components/SearchBar.jsx';
import {FaEdit, FaTrashAlt, FaEye, FaPlus, FaUserTie} from 'react-icons/fa';

const ClienteList = () => {
    const navigate = useNavigate();
    const [cliente, setCliente] = useState([]);
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {loadCliente();}, []);

    useEffect(() => {
        filterClientes();
    }, [searchTerm, cliente]);

    const loadCliente = async () => {
        try{
            setIsLoading(true);
            const data = await getAllClientes();
            setCliente(data);
            setFilteredClientes(data);
        }catch(err){
            setError('Error al cargar los clientes');
            console.error(err);
        }finally{
            setIsLoading(false);
        }
    };

    const filterClientes = () => {
        if (!searchTerm.trim()) {
            setFilteredClientes(cliente);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = cliente.filter(c =>
            c.nombre.toLowerCase().includes(term) ||
            c.nit_ci.toLowerCase().includes(term) ||
            c.telefono?.toLowerCase().includes(term) ||
            c.razon_social?.toLowerCase().includes(term) ||
            c.estado?.toLowerCase().includes(term) ||
            c.id.toString().includes(term)
        );
        setFilteredClientes(filtered);
    };

    const handleDelete = async (id) =>{
        if(window.confirm('¿Esta seguro que desea eliminar este cliente?')){
            try{
                await deleteCliente(id);
                setCliente(prevCliente => prevCliente.filter(cliente => cliente.id !== id));
                alert('Cliente eliminado exitosamente');
            }catch(err){
                alert('Error al eliminar el cliente: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleEdit = (id) => {
        navigate(`/clientes/edit/${id}`);
    }

    const handleView = (id) => {
        navigate(`/clientes/detail/${id}`);
    }

    const handleCreate = () => {
        navigate('/clientes/create');
    }

    const columns = [
        { header: 'ID', accessor: 'id'},
        { header: 'NIT', accessor: 'nit_ci'},
        { header: 'Nombre', accessor: 'nombre'},
        { header: 'Telefono', accessor: 'telefono'},
        { header: 'Razon social', accessor: 'razon_social'},
        { header: 'Estado', accessor: 'estado'},
    ]

    const renderActions = (item) => (
        <div className="felex justify-center items-center gap-2">

            <button onClick={() => handleView(item.id)} className='p-2 text-gray-500 hover:text-green-700 hover:bg-gray-100 rounded-full transition-colors' title="Ver detalles">
                <FaEye size={18} />
            </button>

            <button onClick={() => handleEdit(item.id)} className="p-2 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors" title="Editar">
                <FaEdit size={18} />
            </button>

            <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors" title="Eliminar">
                <FaTrashAlt size={18} />
            </button>
        </div>
    );

    if (isLoading) return <div className='p-8'>cargando...</div>;
    
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
                        <FaUserTie className="mr-3 text-blue-600" />
                        Gestionar Clientes
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Total de clientes: {filteredClientes.length}
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                    <FaPlus className="mr-2" />
                    Nuevo Cliente
                </button>
            </div>

            {/* Search Bar */}
            <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por nombre, NIT/CI, teléfono, razón social o estado..."
            />

            {/* Table */}
            <Table columns={columns} data={filteredClientes} renderActions={renderActions} /> 
        </div>
    );
};

export default ClienteList;