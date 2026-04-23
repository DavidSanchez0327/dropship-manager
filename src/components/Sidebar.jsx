import { Package, LayoutDashboard, Tag, Truck } from 'lucide-react'

export default function Sidebar({ page, setPage, totalProducts }) {
  const links = [
    { id: 'dashboard', icon: <LayoutDashboard size={15} />, label: 'Dashboard' },
    { id: 'products', icon: <Package size={15} />, label: 'Productos' },
  ]

  return (
    <aside className="sidebar">
      <div>
        <p className="sidebar-logo">DropManager</p>
        <p className="sidebar-tagline">Gestión de productos</p>
      </div>

      <nav className="sidebar-nav">
        {links.map((l) => (
          <button
            key={l.id}
            className={`nav-link ${page === l.id ? 'active' : ''}`}
            onClick={() => setPage(l.id)}
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
  )
}
