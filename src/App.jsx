import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Products from './pages/Products'
import Dashboard from './pages/Dashboard'
import { ToastProvider } from './context/ToastContext'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [totalProducts, setTotalProducts] = useState(0)

  return (
    <ToastProvider>
      <div className="layout">
        <Sidebar page={page} setPage={setPage} totalProducts={totalProducts} />
        <main className="main">
          {page === 'dashboard' && (
            <Dashboard onNavigate={setPage} />
          )}
          {page === 'products' && (
            <Products onCountChange={setTotalProducts} />
          )}
        </main>
      </div>
    </ToastProvider>
  )
}
