import { useState } from 'react'
import { Package, LayoutDashboard, Menu, X } from 'lucide-react'

export default function Sidebar({ page, setPage, totalProducts }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { id: 'dashboard', icon: <LayoutDashboard size={15} />, label: 'Dashboard' },
    { id: 'products',  icon: <Package size={15} />,         label: 'Productos' },
  ]

  const navigate = (id) => {
    setPage(id)
    setMobileOpen(false)
  }

  return (
    <>
      {/* Barra superior en mobile */}
      <header className="mobile-header">
        <p className="sidebar-logo">DropManager</p>
        <button className="hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Abrir menú">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Overlay oscuro al abrir el drawer */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div>
          <p className="sidebar-logo">DropManager</p>
          <p className="sidebar-tagline">Gestión de productos</p>
        </div>

        <nav className="sidebar-nav">
          {links.map((l) => (
            <button
              key={l.id}
              className={`nav-link ${page === l.id ? 'active' : ''}`}
              onClick={() => navigate(l.id)}
            >
              {l.icon}
              {l.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-stats">
          <p className="stat-pill">Total productos</p>
          <p className="stat-number">{totalProducts}</p>
        </div>
      </aside>
    </>
  )
}
