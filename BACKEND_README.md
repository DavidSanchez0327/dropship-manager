# DropManager — Backend

> API REST en Node.js + Express para gestionar el catálogo de productos de dropshipping. Se conecta a una base de datos PostgreSQL en Supabase.

---

## Stack tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| Node.js | ≥ 18 | Runtime de JavaScript |
| Express | 4.19 | Framework HTTP y router |
| pg (node-postgres) | 8.11 | Cliente PostgreSQL con pool de conexiones |
| express-validator | 7.0 | Validación y sanitización de entrada |
| cors | 2.8 | Control de orígenes permitidos (CORS) |
| dotenv | 16.4 | Carga de variables de entorno desde `.env` |
| uuid | 9.0 | (Reservado — la BD genera UUIDs nativamente) |
| nodemon | 3.1 | Recarga automática en desarrollo |

**Despliegue:** Render (plan gratuito — hiberna tras 15 min de inactividad)  
**Base de datos:** Supabase PostgreSQL (plan gratuito — 500 MB)

---

## Estructura de archivos

```
dropship-api/
├── package.json
├── .env.example              # Plantilla de variables de entorno
└── src/
    ├── index.js              # Servidor Express: middlewares, rutas, arranque
    ├── db.js                 # Pool de conexión PostgreSQL + initDB()
    └── routes/
        └── products.js       # CRUD completo de productos con validaciones
```

---

## Base de datos

### Tabla `products`

| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Identificador único automático |
| `title` | TEXT | NOT NULL | Título del producto |
| `description` | TEXT | NULLABLE | Descripción para publicación |
| `provider` | TEXT | NOT NULL | Nombre del proveedor en Dropi |
| `dropi_link` | TEXT | NULLABLE | URL del producto en Dropi |
| `sku` | TEXT | NULLABLE | Código SKU interno |
| `dropi_id` | TEXT | NULLABLE | ID del producto en Dropi |
| `category` | TEXT | NULLABLE | Categoría del producto |
| `tags` | TEXT[] | DEFAULT `'{}'` | Arreglo de etiquetas |
| `images` | TEXT[] | DEFAULT `'{}'` | Arreglo de URLs de imágenes |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `NOW()` | Fecha de creación |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `NOW()` | Actualizado por trigger |

### Trigger automático
`updated_at` se actualiza automáticamente en cada UPDATE mediante el trigger `set_updated_at`. No requiere manejo desde el backend.

### Inicialización automática
`initDB()` en `db.js` ejecuta `CREATE TABLE IF NOT EXISTS` y crea el trigger al arrancar el servidor. Las tablas se crean solas en la primera ejecución — no hay scripts manuales.

---

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Health-check del servidor |
| GET | `/api/products` | Listar productos con paginación y filtros |
| GET | `/api/products/:id` | Obtener un producto por UUID |
| POST | `/api/products` | Crear nuevo producto |
| PUT | `/api/products/:id` | Actualizar producto existente |
| DELETE | `/api/products/:id` | Eliminar producto |
| GET | `/api/categories` | Categorías únicas usadas en el catálogo |
| GET | `/api/suppliers` | Proveedores únicos del catálogo |

### Parámetros de GET `/api/products`

| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `search` | string | — | Búsqueda ILIKE en title, provider, sku, dropi_id |
| `category` | string | — | Filtro exacto por categoría |
| `page` | int | 1 | Número de página |
| `limit` | int | 50 | Resultados por página (máx 100) |

### Campos obligatorios en POST / PUT

- `title` (string, no vacío)
- `provider` (string, no vacío)

Todos los demás campos son opcionales.

### Ejemplo de respuesta — POST `/api/products`

```json
{
  "product": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Auriculares Bluetooth Premium",
    "provider": "TechSupply",
    "sku": "SKU-001",
    "dropi_id": "DP5523",
    "dropi_link": "https://dropi.co/producto/123",
    "category": "Electrónica",
    "tags": ["bluetooth", "premium"],
    "images": ["https://ejemplo.com/img.jpg"],
    "created_at": "2025-04-22T14:30:00Z",
    "updated_at": "2025-04-22T14:30:00Z"
  },
  "message": "Producto creado"
}
```

---

## Módulos clave

### `src/db.js`
- Crea un `Pool` de conexiones con `pg` usando `DATABASE_URL`.
- SSL activado en producción (`NODE_ENV === 'production'`).
- `initDB()`: crea la tabla `products` y el trigger si no existen. Se llama una vez al arrancar.

### `src/index.js`
- Configura CORS con `FRONTEND_URL` (variable de entorno).
- `express.json({ limit: '2mb' })` como parser del body.
- Monta el router de productos en `/api/products`.
- Rutas helpers `/api/categories` y `/api/suppliers` con queries DISTINCT.
- Middleware de errores global: en producción oculta detalles del error.
- Llama a `initDB()` antes de `app.listen()`.

### `src/routes/products.js`
- Todas las rutas usan `express-validator` para validar entrada.
- Middleware `validate` centralizado que responde 422 si hay errores.
- Queries parametrizadas (`$1`, `$2`...) — previene SQL Injection.
- GET con búsqueda construye cláusulas WHERE dinámicamente con contador de índice.
- Responde 404 si un producto no existe (UPDATE y DELETE revisan `rowCount`).

---

## Seguridad aplicada

| Medida | Implementación |
|---|---|
| SQL Injection | Consultas parametrizadas con `pg` |
| Validación de entrada | `express-validator` en cada ruta |
| CORS restrictivo | Solo acepta el dominio en `FRONTEND_URL` |
| Credenciales seguras | Variables de entorno — nunca en código |
| SSL en BD | Activado automáticamente en `NODE_ENV=production` |
| UUIDs como PK | No predecibles ni enumerables |
| Ocultamiento de errores | En producción solo devuelve mensaje genérico |

---

## Configuración local

```bash
# 1. Instalar dependencias
cd dropship-api
npm install

# 2. Crear .env
cp .env.example .env
# Editar DATABASE_URL con la cadena de Supabase

# 3. Correr en desarrollo
npm run dev
# → http://localhost:3001
# → ✅ Base de datos inicializada
# → 🚀 API corriendo en http://localhost:3001

# 4. Probar el health-check
curl http://localhost:3001/health
```

---


## Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Connection string de Supabase PostgreSQL |
| `FRONTEND_URL` | Sí | URL del frontend para CORS (`*` en desarrollo) |
| `NODE_ENV` | Recomendado | `development` o `production` |
| `PORT` | No | Puerto (Render lo asigna; default 3001) |

### Ejemplo `.env`
```
DATABASE_URL=postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres
FRONTEND_URL=https://tu-app.vercel.app
NODE_ENV=production
```

---

## Despliegue (Render)

1. Subir `dropship-api/` a un repositorio GitHub.
2. En Render: New → Web Service → conectar repo.
3. Configurar: Runtime = Node, Build = `npm install`, Start = `npm start`.
4. Variables de entorno: `DATABASE_URL`, `NODE_ENV=production`, `FRONTEND_URL`.
5. Deploy. Redeploys automáticos con cada `git push`.

> **Nota:** El plan gratuito de Render hiberna el servicio tras 15 min sin tráfico. La primera petición puede tardar ~30s.

---

## Pendientes / mejoras conocidas

- [ ] Autenticación JWT para proteger los endpoints
- [ ] Rate limiting por IP
- [ ] Endpoint de búsqueda avanzada con múltiples filtros simultáneos
- [ ] Historial de cambios por producto (audit log)
- [ ] Endpoint para duplicar un producto
- [ ] Tests unitarios e integración con Jest + Supertest