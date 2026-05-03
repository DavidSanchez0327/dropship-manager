import { useState } from 'react'
import { X, ExternalLink, Edit2, Trash2 } from 'lucide-react'

export default function ProductDetail({ product, onClose, onEdit, onDelete }) {
  const [activeImg, setActiveImg] = useState(0)
  const images = product.images || []

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 800 }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
            {product.title}
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="icon-btn" onClick={() => { onClose(); onEdit(product) }} title="Editar">
              <Edit2 size={14} />
            </button>
            <button className="icon-btn danger" onClick={() => { onClose(); onDelete(product.id) }} title="Eliminar">
              <Trash2 size={14} />
            </button>
            <button className="icon-btn" onClick={onClose}>
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="product-detail">
            {/* Images column */}
            <div className="detail-images">
              <div style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                {images[activeImg] ? (
                  <img
                    src={images[activeImg]}
                    alt={product.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    Sin imagen
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="detail-thumbs">
                  {images.map((url, i) => (
                    <div
                      key={i}
                      className={`detail-thumb ${i === activeImg ? 'active' : ''}`}
                      onClick={() => setActiveImg(i)}
                    >
                      <img src={url} alt="" onError={(e) => { e.target.style.display = 'none' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info column */}
            <div className="detail-info">
              {product.category && (
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)' }}>
                  {product.category}
                </p>
              )}

              <div className="detail-field">
                <span className="detail-field-label">Proveedor</span>
                <span className="detail-field-value">{product.provider}</span>
              </div>

              {(product.precio_proveedor || product.precio_venta) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '4px 0 8px' }}>
                  {product.precio_proveedor && (
                    <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 4 }}>Precio proveedor</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(product.precio_proveedor)}
                      </p>
                    </div>
                  )}
                  {product.precio_venta && (
                    <div style={{ background: 'var(--accent-dim)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--accent)' }}>
                      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--accent)', marginBottom: 4 }}>Precio venta</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(product.precio_venta)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {product.sku && (
                <div className="detail-field">
                  <span className="detail-field-label">SKU</span>
                  <code style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{product.sku}</code>
                </div>
              )}

              {product.producto_id_dropi && (
                <div className="detail-field">
                  <span className="detail-field-label">Producto ID Dropi</span>
                  <code style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{product.producto_id_dropi}</code>
                </div>
              )}

              {product.dropi_link && (
                <div className="detail-field">
                  <span className="detail-field-label">Link en Dropi</span>
                  <a href={product.dropi_link} target="_blank" rel="noopener noreferrer" className="detail-link">
                    <ExternalLink size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                    Ver en Dropi
                  </a>
                </div>
              )}

              {product.description && (
                <div className="detail-field">
                  <span className="detail-field-label">Descripción</span>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {product.description}
                  </p>
                </div>
              )}

              {product.tags && product.tags.length > 0 && (
                <div className="detail-field">
                  <span className="detail-field-label">Etiquetas</span>
                  <div className="detail-tags">
                    {product.tags.map((t) => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 'auto' }}>
                Creado: {product.created_at ? new Date(product.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
