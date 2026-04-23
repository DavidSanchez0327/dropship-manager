import { useState, useEffect } from 'react'
import { Package, Tag, Truck, TrendingUp, Plus } from 'lucide-react'
import { getProducts } from '../services/api'

export default function Dashboard({ onNavigate }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts()
      .then((data) => setProducts(data.products || data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const totalCats = new Set(products.map((p) => p.category).filter(Boolean)).size
  const totalProviders = new Set(products.map((p) => p.provider).filter(Boolean)).size
  const totalTags = new Set(products.flatMap((p) => p.tags || [])).size

  const recent = [...products]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Resumen de tu catálogo de dropshipping</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate('products')}>
          <Plus size={14} /> Nuevo producto
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <p className="stat-card-label">Productos</p>
          <p className="stat-card-value">{loading ? '…' : products.length}</p>
          <p className="stat-card-sub">en tu catálogo</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">Categorías</p>
          <p className="stat-card-value">{loading ? '…' : totalCats}</p>
          <p className="stat-card-sub">distintas</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">Proveedores</p>
          <p className="stat-card-value">{loading ? '…' : totalProviders}</p>
          <p className="stat-card-sub">activos</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">Etiquetas</p>
          <p className="stat-card-value">{loading ? '…' : totalTags}</p>
          <p className="stat-card-sub">únicas</p>
        </div>
      </div>

      {/* Recent products */}
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Productos recientes
        </h2>
        {loading ? (
          <div className="loading"><div className="spinner" /> Cargando...</div>
        ) : recent.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: 14 }}>
            No tienes productos aún.{' '}
            <button
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}
              onClick={() => onNavigate('products')}
            >
              Agrega tu primero
            </button>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Título', 'Proveedor', 'Categoría', 'SKU', 'ID Dropi'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((p, i) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'background 0.1s',
                      cursor: 'default',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{p.provider || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12 }}>
                      {p.category ? (
                        <span style={{ background: 'var(--accent-dim)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>
                          {p.category}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{p.sku || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{p.dropi_id || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
