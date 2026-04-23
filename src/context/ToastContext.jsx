import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success'
            ? <CheckCircle size={16} />
            : <XCircle size={16} />
          }
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
