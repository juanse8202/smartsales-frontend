import axios from 'axios';

// Configurar la URL base desde las variables de entorno
const API_URL = import.meta.env.VITE_API_URL;

// Crear instancia de axios con configuración base
const rolApi = axios.create({baseURL: API_URL,headers: {'Content-Type': 'application/json',},});

// Interceptor para agregar el token de autenticación si existe
rolApi.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
rolApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Error de respuesta:', error.response.data);
      console.error('Estado:', error.response.status);
    } else if (error.request) {
      console.error('Error de petición:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ==================== FUNCIONES PARA ROLES ====================

/**
 * Obtener todos los roles
 * @returns {Promise} Lista de roles con sus permisos
 */
export const getAllRoles = async () => {
  try {
    const response = await rolApi.get('administracion/roles/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener roles:', error);
    throw error;
  }
};

/**
 * Obtener un rol por ID
 * @param {number} id - ID del rol
 * @returns {Promise} Datos del rol
 */
export const getRoleById = async (id) => {
  try {
    const response = await rolApi.get(`administracion/roles/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener rol ${id}:`, error);
    throw error;
  }
};

/**
 * Crear un nuevo rol
 * @param {Object} roleData - Datos del rol a crear
 * @param {string} roleData.name - Nombre del rol
 * @param {number[]} roleData.permission_ids - IDs de los permisos a asignar
 * @returns {Promise} Rol creado
 */
export const createRole = async (roleData) => {
  try {
    const response = await rolApi.post('administracion/roles/', roleData);
    return response.data;
  } catch (error) {
    console.error('Error al crear rol:', error);
    throw error;
  }
};

/**
 * Actualizar un rol existente
 * @param {number} id - ID del rol a actualizar
 * @param {Object} roleData - Datos del rol a actualizar
 * @param {string} roleData.name - Nombre del rol
 * @param {number[]} roleData.permission_ids - IDs de los permisos a asignar
 * @returns {Promise} Rol actualizado
 */
export const updateRole = async (id, roleData) => {
  try {
    const response = await rolApi.put(`administracion/roles/${id}/`, roleData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar rol ${id}:`, error);
    throw error;
  }
};

/**
 * Actualización parcial de un rol
 * @param {number} id - ID del rol a actualizar
 * @param {Object} roleData - Datos parciales del rol
 * @returns {Promise} Rol actualizado
 */
export const partialUpdateRole = async (id, roleData) => {
  try {
    const response = await rolApi.patch(`administracion/roles/${id}/`, roleData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar parcialmente rol ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar un rol
 * @param {number} id - ID del rol a eliminar
 * @returns {Promise}
 */
export const deleteRole = async (id) => {
  try {
    const response = await rolApi.delete(`administracion/roles/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar rol ${id}:`, error);
    throw error;
  }
};

// ==================== FUNCIONES PARA PERMISOS ====================

/**
 * Obtener todos los permisos disponibles
 * @returns {Promise} Lista de permisos
 */
export const getAllPermissions = async () => {
  try {
    const response = await rolApi.get('administracion/permissions/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    throw error;
  }
};

/**
 * Obtener un permiso por ID
 * @param {number} id - ID del permiso
 * @returns {Promise} Datos del permiso
 */
export const getPermissionById = async (id) => {
  try {
    const response = await rolApi.get(`administracion/permissions/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener permiso ${id}:`, error);
    throw error;
  }
};

// Exportar también la instancia de axios por si se necesita personalización adicional
export default rolApi;
