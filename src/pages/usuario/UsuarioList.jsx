import React, {useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import {deleteUsuario, getAllUsuarios} from '../../api/UsuarioApi.jsx';
import Table from '../../components/Table.jsx';
import SearchBar from '../../components/SearchBar.jsx';
import {FaEdit, FaTrashAlt, FaEye, FaPlus, FaUsers} from 'react-icons/fa'

const UsuarioList = () => {
    const navigate = useNavigate();
    const [usuarios, setUsuario] = useState([]);
    const [filteredUsuarios, setFilteredUsuarios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {loadUsuario();}, []);

    useEffect(() => {
        filterUsuarios();
    }, [searchTerm, usuarios]);

    const loadUsuario = async () => {
        try{
            setIsLoading(true);
            const data = await getAllUsuarios();
            setUsuario(data);
            setFilteredUsuarios(data);
        }catch(err){
            setError('Error al cargar los usuarios');
            console.error(err);
        }finally{
            setIsLoading(false);
        }
    };

    const filterUsuarios = () => {
        if (!searchTerm.trim()) {
            setFilteredUsuarios(usuarios);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = usuarios.filter(usuario =>
            usuario.username.toLowerCase().includes(term) ||
            usuario.email.toLowerCase().includes(term) ||
            usuario.role?.nombre?.toLowerCase().includes(term) ||
            usuario.id.toString().includes(term)
        );
        setFilteredUsuarios(filtered);
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estas seguro que deseas eliminar este usuario?")){
            try{
                await deleteUsuario(id);
                setUsuario(prevUsuario => prevUsuario.filter(usuario => usuario.id !== id));
                alert('Usuario eliminado exitosamente');
            }catch(err){
                alert('Error al eliminar el usuario: ' + (err.response?.data?.message || err.message));
            }
        }
    };
    
    const handleEdit = (id) => {
        navigate(`/usuarios/edit/${id}`);
    };
    
    const handleView = (id) => {
        navigate(`/usuarios/detail/${id}`);
    };

    const handleCreate = () => {
        navigate('/usuarios/create');
    };

    const columns = [
        { header: 'ID',accessor: 'id' },
        { header: 'nombre de usuario', accessor: 'username' },
        { header: 'correo', accessor: 'email' },
        { header: 'rol', accessor: 'role' },
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
                        <FaUsers className="mr-3 text-blue-600" />
                        Gestionar Usuarios
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Total de usuarios: {filteredUsuarios.length}
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                    <FaPlus className="mr-2" />
                    Nuevo Usuario
                </button>
            </div>

            {/* Search Bar */}
            <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por nombre de usuario, correo, rol o ID..."
            />

            {/* Table */}
            <Table columns={columns} data={filteredUsuarios} renderActions={renderActions} />
        </div>
    );
};

export default UsuarioList;