import react, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {getAllRoles, getRoleById, deleteRole} from '../../api/RolApi.jsx';
import Table from '../../components/Table.jsx';
import { FaEdit, FaTrashAlt, FaEye, FaPlus, FaUserShield } from 'react-icons/fa';

const RolList = () =>{
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null)

    useEffect(() => {loadRoles();}, []);

    const loadRoles = async () => {
        try{
            setIsLoading(true);
            const data = await getAllRoles();
            setRoles(data);
        }catch(err){
            setError('Error al cargar los roles.');
            console.error(err);
        }finally{
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Esta seguro que desea eliminar este rol?')){
            try{
                await deleteRole(id);
                setRoles(prevRoles => prevRoles.filter(role => role.id !== id));
                alert('Rol eliminado exitosamente');
            }catch (err){
                alert('Error al eliminar el rol: ' + (err.response?.data?.message || err.message));
            }
        }
    };
    
    const handleEdit = (id) => {
        navigate(`/roles/edit/${id}`);
    }

    const handleView = (id) => {
        navigate(`/roles/detail/${id}`);
    }

    const handleCreate = () => {
        navigate('/roles/create');
    }

    const columns = [
        {header: 'ID', accessor: 'id'},
        {header: 'Nombre', accessor: 'name'},
    ];

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

    if (isLoading) return <div className='p-8'>cargando ...</div>;
    
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
                        <FaUserShield className="mr-3 text-blue-600" />
                        Gestionar Roles
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Total de roles: {roles.length}
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                    <FaPlus className="mr-2" />
                    Nuevo Rol
                </button>
            </div>

            {/* Table */}
            <Table columns={columns} data={roles} renderActions={renderActions} />
        </div>
    );
};

export default RolList;