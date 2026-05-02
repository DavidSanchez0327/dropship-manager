# DropManager — Frontend

> Aplicación React para gestionar el catálogo de productos de un dropshipper en Dropi.

---


## Stack tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| React | 18.2 | Librería de UI — componentes y estado |
| Vite | 5.2 | Bundler y servidor de desarrollo |
| React Router DOM | 6.22 | (instalado, navegación futura) |
| Axios | 1.6 | Cliente HTTP para llamadas al backend |
| lucide-react | 0.378 | Íconos SVG (Package, Sparkles, Edit3, etc.) |
| Anthropic API | v1 | Llamadas directas a Claude desde el navegador |

**Despliegue:** Vercel (plan gratuito)  
**Variables de entorno:** `VITE_API_URL` — URL del backend en Render

---

## Estructura de archivos

```
dropship-manager/
├── index.html                  # Punto de entrada HTML + fuentes Google
├── vite.config.js              # Config Vite + proxy /api en desarrollo
├── package.json
├── .env.example                # Plantilla de variables de entorno
└── src/
    ├── main.jsx                # Monta <App /> en #root
    ├── App.jsx                 # Router de páginas + layout principal
    ├── index.css               # Sistema de diseño global (variables CSS, componentes)
    ├── context/
    │   └── ToastContext.jsx    # Contexto global de notificaciones toast
    ├── services/
    │   └── api.js              # Capa de comunicación con el backend (axios)
    ├── components/
    │   ├── Sidebar.jsx         # Navegación lateral con enlaces y contador
    │   ├── ProductForm.jsx     # Modal crear/editar producto (tags + imágenes)
    │   └── ProductDetail.jsx   # Modal de vista detallada de un producto
    └── pages/
        ├── Dashboard.jsx       # Vista de métricas y tabla de productos recientes
        ├── Products.jsx        # Catálogo principal con grid, búsqueda y filtros
        └── AIUploader.jsx      # Subida con IA — flujo de 3 fases
```

---

## Páginas y rutas

El router es interno — no usa URL paths, sino un estado `page` en `App.jsx`.

| Valor de `page` | Componente | Descripción |
|---|---|---|
| `'dashboard'` | `Dashboard.jsx` | Métricas del catálogo y tabla de últimos productos |
| `'products'` | `Products.jsx` | Catálogo completo con CRUD, búsqueda y filtros |
| `'ai-uploader'` | `AIUploader.jsx` | Subida automática de productos con IA |

---

## Componentes clave

### `App.jsx`
- Mantiene el estado `page` (string) que determina qué página se renderiza.
- Envuelve todo en `<ToastProvider>` para notificaciones globales.
- Pasa `onNavigate` al Dashboard para que pueda cambiar de página.

### `Sidebar.jsx`
- Navegación lateral fija (240px).
- Tres enlaces: Dashboard, Productos, Subida con IA.
- Muestra el total de productos en la parte inferior.

### `ToastContext.jsx`
- Contexto React que expone `showToast(message, type)`.
- Tipos: `'success'` (verde) y `'error'` (rojo).
- Auto-desaparece a los 3 segundos.

### `services/api.js`
- Instancia de axios con `baseURL = VITE_API_URL/api`.
- Interceptor de respuesta que normaliza los errores.
- Funciones exportadas: `getProducts`, `getProduct`, `createProduct`, `updateProduct`, `deleteProduct`, `getCategories`, `getSuppliers`.

### `ProductForm.jsx`
- Modal para crear y editar productos.
- Gestión de tags: se agregan con Enter o coma, se eliminan con X.
- Gestión de imágenes: URLs ingresadas manualmente con preview visual.
- Validación HTML5 nativa en campos obligatorios.

### `ProductDetail.jsx`
- Modal de solo lectura con galería de imágenes (thumbnail activo).
- Acciones rápidas: editar y eliminar desde el mismo modal.

### `Products.jsx`
- Grid de tarjetas responsivo (`auto-fill, minmax(280px, 1fr)`).
- Búsqueda local sobre la lista cargada (filtra por título, proveedor, SKU, ID).
- Filtro por categoría vía `<select>`.
- Confirmación antes de eliminar con `window.confirm`.

### `Dashboard.jsx`
- Cuatro stat cards: productos, categorías, proveedores, etiquetas únicas.
- Tabla de los 5 productos más recientes ordenados por `created_at`.

### `AIUploader.jsx`
Flujo de **3 fases** controlado por la variable de estado `phase`:

| Fase | Valor | Qué ocurre |
|---|---|---|
| Datos | `'input'` | El usuario llena formulario básico |
| Revisión | `'review'` | Claude genera contenido; el usuario lo edita antes de guardar |
| Guardado | `'saved'` | El producto fue creado en la BD vía API REST |

**Llamada a Claude:**
```js
fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: SYSTEM_PROMPT,   // prompt del experto en marketing
    messages: [{ role: 'user', content: userContent }],
  }),
})
```

**System prompt base:**
> "Eres un experto profesional en marketing digital con más de 15 años de experiencia laboral. Tu labor es generar la mejor descripción, etiquetas de producto y título para publicar productos en Facebook Marketplace..."

El JSON que Claude devuelve tiene: `title`, `description`, `category`, `tags`.  
Se fusiona con los datos técnicos del usuario (`provider`, `sku`, `dropi_id`, etc.) para formar el payload final que se guarda con `createProduct()`.

---

## Sistema de diseño (index.css)

Variables CSS globales en `:root`:

| Variable | Valor | Uso |
|---|---|---|
| `--bg` | `#0f0f11` | Fondo principal |
| `--bg-card` | `#17171b` | Tarjetas y sidebar |
| `--bg-elevated` | `#1e1e24` | Inputs y elementos elevados |
| `--accent` | `#c8a96e` | Color dorado — CTAs, highlights |
| `--text-primary` | `#f0ede8` | Texto principal |
| `--text-secondary` | `#9895a0` | Texto secundario |
| `--font-display` | Playfair Display | Títulos y números grandes |
| `--font-body` | DM Sans | Todo el texto de interfaz |

Clases de utilidad principales: `.card`, `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-danger`, `.form-input`, `.form-textarea`, `.form-select`, `.tag`, `.tag-item`, `.icon-btn`, `.spinner`, `.toast`, `.modal`, `.modal-overlay`.

---

## Configuración local

```bash
# 1. Instalar dependencias
cd dropship-manager
npm install

# 2. Crear .env
cp .env.example .env
# Editar VITE_API_URL=http://localhost:3001

# 3. Correr en desarrollo
npm run dev
# → http://localhost:5173

# 4. Build para producción
npm run build
```

---

## Variables de entorno

| Variable | Desarrollo | Producción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3001` | `https://tu-api.onrender.com` |

---

## Despliegue (Vercel)

1. Subir `dropship-manager/` a un repositorio GitHub.
2. Importar en Vercel → detecta Vite automáticamente.
3. Agregar variable `VITE_API_URL` con la URL de Render.
4. Deploy. Redeploys automáticos con cada `git push`.

---

## Pendientes / mejoras conocidas

- [ ] Debounce en búsqueda para catálogos grandes
- [ ] Paginación en el grid de productos (actualmente carga hasta 50)
- [ ] Botón "Regenerar" en AIUploader sin volver al formulario
- [ ] Subida directa de imágenes (actualmente solo URLs)
- [ ] Autenticación de usuario
- [ ] Exportar catálogo a CSV
