import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor para manejo global de errores
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || 'Error de conexión con el servidor'
    return Promise.reject(new Error(msg))
  }
)

// ---- Productos ----

export const getProducts = (params = {}) =>
  api.get('/products', { params })

export const getProduct = (id) =>
  api.get(`/products/${id}`)

export const createProduct = (data) =>
  api.post('/products', data)

export const updateProduct = (id, data) =>
  api.put(`/products/${id}`, data)

export const deleteProduct = (id) =>
  api.delete(`/products/${id}`)

// ---- Categorías / proveedores (helpers) ----

export const getCategories = () =>
  api.get('/categories')

export const getSuppliers = () =>
  api.get('/suppliers')
