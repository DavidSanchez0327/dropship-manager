import { useState, useEffect } from 'react'
import { X, Plus, Image } from 'lucide-react'

const CATEGORIES = [
  'Electrónica', 'Moda', 'Hogar', 'Belleza', 'Deportes',
  'Juguetes', 'Mascotas', 'Automotriz', 'Herramientas', 'Otro'
]

const DROPSHIPPER = [
  'Marcela', 'Vanessa', 'Cristhian'
]

const EMPTY = {
  title: '',
  description: '',
  provider: '',
  dropshipper: '',
  dropi_link: '',
  sku: '',
  dropi_id: '',
  category: '',
  precio_proveedor: '',
  precio_venta: '',
  producto_id_dropi: '',
  tags: [],
  images: [],
}

export default function ProductForm({ product, onSave, onClose, loading }) {
  const [form, setForm] = useState(EMPTY)
  const [tagInput, setTagInput] = useState('')
  const [imageInput, setImageInput] = useState('')

  useEffect(() => {
    if (product) {
      setForm({
        ...EMPTY,
        ...product,
        tags: product.tags || [],
        images: product.images || [],
      })
    } else {
      setForm(EMPTY)
    }
  }, [product])

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const val = tagInput.trim().replace(/,$/, '')
      if (val && !form.tags.includes(val)) {
        setForm((prev) => ({ ...prev, tags: [...prev.tags, val] }))
      }
      setTagInput('')
    }
  }

  const removeTag = (t) =>
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((x) => x !== t) }))

  const addImage = () => {
    const url = imageInput.trim()
    if (url && !form.images.includes(url)) {
      setForm((prev) => ({ ...prev, images: [...prev.images, url] }))
      setImageInput('')
    }
  }

  const removeImage = (url) =>
    setForm((prev) => ({ ...prev, images: prev.images.filter((x) => x !== url) }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {product ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">

              {/* Título */}
              <div className="form-group full">
                <label className="form-label">
                  Título del producto<span className="form-required">*</span>
                </label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={set('title')}
                  placeholder="Ej: Auriculares Inalámbricos Pro Max"
                  required
                />
              </div>

              {/* Proveedor */}
              <div className="form-group">
                <label className="form-label">
                  Proveedor<span className="form-required">*</span>
                </label>
                <input
                  className="form-input"
                  value={form.provider}
                  onChange={set('provider')}
                  placeholder="Nombre del proveedor"
                  required
                />
              </div>

              {/* Dropshipper */}
              <div className="form-group">
                <label className="form-label">Dropshipper</label>
                <select
                  className="form-select"
                  value={form.dropshipper}
                  onChange={set('dropshipper')}
                >
                  <option value="">Seleccionar...</option>
                  {DROPSHIPPER.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Categoría */}
              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  value={form.category}
                  onChange={set('category')}
                >
                  <option value="">Seleccionar...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* SKU */}
              <div className="form-group">
                <label className="form-label">SKU</label>
                <input
                  className="form-input"
                  value={form.sku}
                  onChange={set('sku')}
                  placeholder="Ej: SKU-001"
                />
              </div>

              {/* Precio proveedor */}
              <div className="form-group">
                <label className="form-label">Precio proveedor (COP)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="1"
                  value={form.precio_proveedor}
                  onChange={set('precio_proveedor')}
                  placeholder="0"
                />
              </div>

              {/* Precio venta */}
              <div className="form-group">
                <label className="form-label">Precio venta (COP)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="1"
                  value={form.precio_venta}
                  onChange={set('precio_venta')}
                  placeholder="0"
                />
              </div>

              {/* Producto ID Dropi */}
              <div className="form-group full">
                <label className="form-label">Producto ID Dropi</label>
                <input
                  className="form-input"
                  value={form.producto_id_dropi}
                  onChange={set('producto_id_dropi')}
                  placeholder="Ej: PROD-123456"
                />
              </div>

              {/* Link Dropi */}
              <div className="form-group full">
                <label className="form-label">Link en Dropi</label>
                <input
                  className="form-input"
                  value={form.dropi_link}
                  onChange={set('dropi_link')}
                  placeholder="https://dropi.co/producto/..."
                  type="url"
                />
              </div>

              {/* Descripción */}
              <div className="form-group full">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-textarea"
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Descripción del producto para la publicación..."
                  rows={4}
                />
              </div>

              {/* Etiquetas */}
              <div className="form-group full">
                <label className="form-label">Etiquetas</label>
                <div className="tags-input-wrap" onClick={() => document.getElementById('tag-field').focus()}>
                  {form.tags.map((t) => (
                    <span key={t} className="tag-item">
                      {t}
                      <button type="button" className="tag-remove" onClick={() => removeTag(t)}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <input
                    id="tag-field"
                    className="tag-input-field"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder={form.tags.length === 0 ? 'Escribe y presiona Enter...' : ''}
                  />
                </div>
                <p className="form-hint">Presiona Enter o coma para agregar cada etiqueta</p>
              </div>

              {/* Imágenes */}
              <div className="form-group full">
                <label className="form-label">Imágenes (URLs)</label>
                {form.images.length > 0 && (
                  <div className="images-grid">
                    {form.images.map((url, i) => (
                      <div key={i} className="image-thumb">
                        <img src={url} alt="" onError={(e) => { e.target.style.display = 'none' }} />
                        <button type="button" className="image-thumb-remove" onClick={() => removeImage(url)}>
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="image-add-input">
                  <input
                    className="form-input"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                  />
                  <button type="button" className="btn btn-ghost" onClick={addImage} style={{ flexShrink: 0 }}>
                    <Plus size={14} /> Agregar
                  </button>
                </div>
                <p className="form-hint">Pega la URL de cada imagen y presiona "Agregar"</p>
              </div>

            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><div className="spinner" style={{ width: 14, height: 14 }} /> Guardando...</>
              ) : (
                product ? 'Guardar cambios' : 'Crear producto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
