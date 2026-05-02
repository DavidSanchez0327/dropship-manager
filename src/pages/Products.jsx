import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Package, Edit2, Trash2, Eye, RefreshCw } from 'lucide-react'
import {
  getProducts, createProduct, updateProduct, deleteProduct
} from '../services/api'
import ProductForm from '../components/ProductForm'
import ProductDetail from '../components/ProductDetail'
import { useToast } from '../context/ToastContext'

const CATEGORIES = ['', 'Electrónica', 'Moda', 'Hogar', 'Belleza', 'Deportes', 'Juguetes', 'Mascotas', 'Automotriz', 'Herramientas', 'Otro']

export default function Products({ onCountChange, onNavigate }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [viewProduct, setViewProduct] = useState(null)
  const { showToast } = useToast()

  useEffect(() => { onCountChange?.(products.length) }, [products, onCountChange])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProducts({ search, category })
      setProducts(data.products || data || [])
    } catch (err) {
      showToast(err.message, 'error')
      // Demo mode: use local state only
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [search, category])

  useEffect(() => { load() }, [load])

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editProduct) {
        const updated = await updateProduct(editProduct.id, form)
        setProducts((prev) => prev.map((p) => p.id === editProduct.id ? (updated.product || updated) : p))
        showToast('Producto actualizado correctamente')
      } else {
        const created = await createProduct(form)
        setProducts((prev) => [...prev, created.product || created])
        showToast('Producto creado correctamente')
      }
      setShowForm(false)
      setEditProduct(null)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product) => {
    setEditProduct(product)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      showToast('Producto eliminado')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const filtered = products.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      p.title?.toLowerCase().includes(q) ||
      p.provider?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.dropi_id?.toLowerCase().includes(q)
    const matchCat = !category || p.category === category
    return matchSearch && matchCat
  })

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis Productos</h1>
          <p className="page-subtitle">{products.length} producto{products.length !== 1 ? 's' : ''} en tu catálogo</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={load} title="Refrescar">
            <RefreshCw size={14} />
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate('ai-uploader')}>
            <Plus size={15} /> Nuevo producto
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrap">
          <Search className="search-icon" />
          <input
            className="search-input"
            placeholder="Buscar por título, proveedor, SKU o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.filter(Boolean).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="loading">
          <div className="spinner" />
          Cargando productos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Package />
          <h3>{search || category ? 'Sin resultados' : 'Aún no tienes productos'}</h3>
          <p>
            {search || category
              ? 'Intenta con otros términos de búsqueda o cambia el filtro.'
              : 'Agrega tu primer producto haciendo clic en "Nuevo producto".'}
          </p>
          {!search && !category && (
            <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => onNavigate('ai-uploader')}>
              <Plus size={15} /> Agregar primer producto
            </button>
          )}
        </div>
      ) : (
        <div className="products-grid">
          {filtered.map((p) => (
            <div key={p.id} className="product-card">
              <div className="product-image-wrap" onClick={() => setViewProduct(p)}>
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <div className="product-image-placeholder">
                    <Package size={32} />
                  </div>
                )}
              </div>
              <div className="product-body">
                {p.category && <p className="product-category">{p.category}</p>}
                <h3 className="product-title" onClick={() => setViewProduct(p)}>{p.title}</h3>
                <p className="product-supplier">{p.provider}</p>
                {p.tags?.length > 0 && (
                  <div className="product-tags">
                    {p.tags.slice(0, 3).map((t) => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                    {p.tags.length > 3 && (
                      <span className="tag">+{p.tags.length - 3}</span>
                    )}
                  </div>
                )}
                <div className="product-footer">
                  <span className="product-sku">{p.sku || p.dropi_id || '—'}</span>
                  <div className="product-actions">
                    <button className="icon-btn" title="Ver detalle" onClick={() => setViewProduct(p)}>
                      <Eye size={13} />
                    </button>
                    <button className="icon-btn" title="Editar" onClick={() => handleEdit(p)}>
                      <Edit2 size={13} />
                    </button>
                    <button className="icon-btn danger" title="Eliminar" onClick={() => handleDelete(p.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editProduct}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditProduct(null) }}
          loading={saving}
        />
      )}

      {viewProduct && (
        <ProductDetail
          product={viewProduct}
          onClose={() => setViewProduct(null)}
          onEdit={(p) => { setViewProduct(null); handleEdit(p) }}
          onDelete={(id) => { setViewProduct(null); handleDelete(id) }}
        />
      )}
    </>
  )
}
