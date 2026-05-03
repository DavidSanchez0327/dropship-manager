import { useState } from 'react'
import {
  Sparkles, RotateCcw, CheckCircle, Loader,
  Edit3, Save, X, ChevronRight, Eye,
} from 'lucide-react'
import { createProduct } from '../services/api'
import { useToast } from '../context/ToastContext'

// ─── Prompt del experto en marketing ────────────────────────────────────────
const SYSTEM_PROMPT = `Eres un experto profesional en marketing digital con más de 15 años de experiencia laboral. Tu labor es generar la mejor descripción, etiquetas de producto y título para publicar productos en facebook marketplace basándose en la siguiente descripción.

Devuelve ÚNICAMENTE un objeto JSON válido, sin texto extra, sin markdown, sin backticks.

El JSON debe tener exactamente estos campos:
{
  "title": "Título atractivo y persuasivo, máximo 80 caracteres, optimizado para Facebook Marketplace",
  "description": "Descripción persuasiva de 4-6 oraciones que resalte beneficios clave, genere deseo de compra y sea clara para el comprador colombiano. Usa lenguaje cercano y directo.",
  "category": "La categoría más apropiada entre: Electrónica, Moda, Hogar, Belleza, Deportes, Juguetes, Mascotas, Automotriz, Herramientas, Otro",
  "tags": ["5 a 8 etiquetas relevantes en minúsculas, pensadas para búsquedas en Facebook"]
}`

const CATEGORIES = [
  'Electrónica','Moda','Hogar','Belleza','Deportes',
  'Juguetes','Mascotas','Automotriz','Herramientas','Otro',
]

const DROPSHIPPER = [
  'Marcela', 'Vanessa', 'Cristhian'
]

const EMPTY_INPUT = {
  provider: '', dropshipper: '', sku: '',
  dropi_id: '', dropi_link: '', raw_info: '',
  images: '', precio_proveedor: '', precio_venta: '', producto_id_dropi: '',
}

// Fases del flujo
const PHASE = { INPUT: 'input', REVIEW: 'review', SAVED: 'saved' }

const LOG_COLOR = {
  info:    'var(--text-secondary)',
  success: 'var(--success)',
  error:   'var(--danger)',
  accent:  'var(--accent)',
}

const secTitle = {
  fontSize: 12, textTransform: 'uppercase',
  letterSpacing: '0.08em', color: 'var(--text-muted)',
  marginBottom: 12, fontWeight: 500,
}

export default function AIUploader() {
  const [phase,      setPhase]     = useState(PHASE.INPUT)
  const [inputForm,  setInputForm] = useState(EMPTY_INPUT)
  const [preview,    setPreview]   = useState(null)
  const [tagInput,   setTagInput]  = useState('')
  const [logs,       setLogs]      = useState([])
  const [loading,    setLoading]   = useState(false)
  const [saved,      setSaved]     = useState(null)
  const { showToast } = useToast()

  const setIn  = (f) => (e) => setInputForm(p => ({ ...p, [f]: e.target.value }))
  const setPrev = (f) => (e) => setPreview(p  => ({ ...p, [f]: e.target.value }))
  const addLog = (msg, type = 'info') => setLogs(p => [...p, { msg, type }])

  const resetAll = () => {
    setPhase(PHASE.INPUT)
    setInputForm(EMPTY_INPUT)
    setPreview(null)
    setTagInput('')
    setLogs([])
    setSaved(null)
  }

  // Tags helpers
  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const val = tagInput.trim().replace(/,$/, '')
      if (val && !preview.tags.includes(val))
        setPreview(p => ({ ...p, tags: [...p.tags, val] }))
      setTagInput('')
    }
  }
  const removeTag = (t) => setPreview(p => ({ ...p, tags: p.tags.filter(x => x !== t) }))

  // ── STEP 1: call Groq, show review ──────────────────────────────────────
  const handleGenerate = async () => {
    if (!inputForm.provider && !inputForm.raw_info) {
      showToast('Ingresa al menos el proveedor o la información del producto', 'error')
      return
    }
    const apiKey = import.meta.env.VITE_GROQ_API_KEY
    if (!apiKey) {
      showToast('Configura VITE_GROQ_API_KEY en el archivo .env', 'error')
      return
    }
    setLoading(true)
    setLogs([])

    const userContent = [
      inputForm.provider   && `Proveedor: ${inputForm.provider}`,
      inputForm.dropshipper   && `Dropshipper: ${inputForm.dropshipper}`,
      inputForm.sku        && `SKU: ${inputForm.sku}`,
      inputForm.dropi_id   && `ID en Dropi: ${inputForm.dropi_id}`,
      inputForm.dropi_link && `Link en Dropi: ${inputForm.dropi_link}`,
      inputForm.raw_info   && `Información del producto: ${inputForm.raw_info}`,
    ].filter(Boolean).join('\n')

    try {
      addLog('Enviando información al modelo de IA (Groq)…', 'info')

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1000,
          temperature: 0.7,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user',   content: userContent },
          ],
        }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error.message)

      const raw    = data.choices[0].message.content
      const parsed = JSON.parse(raw)

      addLog(`Título: "${parsed.title}"`, 'accent')
      addLog(`Categoría: ${parsed.category}`, 'info')
      addLog(`Descripción: "${parsed.description ? parsed.description.substring(0, 120) + (parsed.description.length > 120 ? '…' : '') : ''}"`, 'info')
      addLog(`Etiquetas: ${(parsed.tags || []).join(', ')}`, 'info')
      addLog('Generación lista. Revisa y edita antes de guardar.', 'success')

      const images = inputForm.images
        ? inputForm.images.split(',').map(u => u.trim()).filter(Boolean)
        : []

      setPreview({
        title:            parsed.title       || '',
        description:      parsed.description || '',
        category:         parsed.category    || '',
        tags:             parsed.tags        || [],
        provider:         inputForm.provider         || '',
        dropshipper:      inputForm.dropshipper      || '',
        sku:              inputForm.sku              || '',
        dropi_id:         inputForm.dropi_id         || '',
        dropi_link:       inputForm.dropi_link       || '',
        precio_proveedor:  inputForm.precio_proveedor  ? parseFloat(inputForm.precio_proveedor) : null,
        precio_venta:      inputForm.precio_venta      ? parseFloat(inputForm.precio_venta)     : null,
        producto_id_dropi: inputForm.producto_id_dropi || '',
        images,
      })
      setPhase(PHASE.REVIEW)
    } catch (err) {
      addLog(`Error: ${err.message}`, 'error')
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── STEP 2: save to REST API ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!preview.title)    { showToast('El título no puede estar vacío', 'error'); return }
    if (!preview.provider) { showToast('El proveedor no puede estar vacío', 'error'); return }
    setLoading(true)
    addLog('Guardando producto en la base de datos…', 'info')
    try {
      const result  = await createProduct(preview)
      const product = result.product || result
      addLog(`¡Guardado! ID: ${product.id}`, 'success')
      setSaved(product)
      setPhase(PHASE.SAVED)
      showToast('Producto guardado correctamente')
    } catch (err) {
      addLog(`Error al guardar: ${err.message}`, 'error')
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Shared sub-components ────────────────────────────────────────────────
  const PhaseBar = () => {
    const steps = [
      { key: PHASE.INPUT,  label: '1. Datos' },
      { key: PHASE.REVIEW, label: '2. Revisión' },
      { key: PHASE.SAVED,  label: '3. Guardado' },
    ]
    const current = steps.findIndex(s => s.key === phase)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
        {steps.map((s, i) => {
          const active = phase === s.key
          const done   = current > i
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                background: active ? 'var(--accent)' : done ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                color: active ? '#17171B' : done ? 'var(--accent)' : 'var(--text-muted)',
                border: `1px solid ${active || done ? 'var(--accent)' : 'var(--border)'}`,
                transition: 'all 0.2s',
              }}>{s.label}</span>
              {i < steps.length - 1 && <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
            </div>
          )
        })}
      </div>
    )
  }

  const LogPanel = () => logs.length === 0 ? null : (
    <div className="card" style={{ marginTop: '1rem' }}>
      <p style={secTitle}>Registro del proceso</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {logs.map((l, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 11, marginTop: 2, flexShrink: 0 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span style={{ color: LOG_COLOR[l.type], lineHeight: 1.5 }}>{l.msg}</span>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--accent)' }}>
            <Loader size={12} style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
            <span>Trabajando…</span>
          </div>
        )}
      </div>
    </div>
  )

  // ══════════════════════════════════════════════════════════════
  //  FASE 1 — INPUT
  // ══════════════════════════════════════════════════════════════
  if (phase === PHASE.INPUT) return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Subida con IA</h1>
          <p className="page-subtitle">
            Ingresa los datos del producto. La IA generará el contenido optimizado y podrás revisarlo antes de guardar.
          </p>
        </div>
      </div>
      <PhaseBar />

      <div className="ai-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <p style={secTitle}>Información del producto</p>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Descripción / notas<span className="form-required">*</span></label>
              <textarea className="form-textarea" rows={5} value={inputForm.raw_info} onChange={setIn('raw_info')}
                placeholder="Describe el producto: características, materiales, para quién es, ventajas, precio referencia, etc." />
            </div>
            <div className="form-group">
                <label className="form-label">Dropshipper<span className="form-required">*</span></label>
                <select
                  className="form-select"
                  value={inputForm.dropshipper}
                  onChange={setIn('dropshipper')}
                >
                  <option value="">Seleccionar...</option>
                  {DROPSHIPPER.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            <div className="form-group">
              <label className="form-label">Proveedor<span className="form-required">*</span></label>
              <input className="form-input" value={inputForm.provider} onChange={setIn('provider')} placeholder="Nombre del proveedor en Dropi" />
            </div>
          </div>

          <div className="card">
            <p style={secTitle}>Datos de Dropi (opcionales)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div className="form-group">
                <label className="form-label">SKU</label>
                <input className="form-input" value={inputForm.sku} onChange={setIn('sku')} placeholder="SKU-001" />
              </div>
              <div className="form-group">
                <label className="form-label">ID en Dropi</label>
                <input className="form-input" value={inputForm.dropi_id} onChange={setIn('dropi_id')} placeholder="DP5523" />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="form-label">Producto ID Dropi</label>
              <input className="form-input" value={inputForm.producto_id_dropi} onChange={setIn('producto_id_dropi')} placeholder="Ej: PROD-123456" />
            </div>
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="form-label">Link del producto en Dropi</label>
              <input className="form-input" type="url" value={inputForm.dropi_link} onChange={setIn('dropi_link')} placeholder="https://dropi.co/producto/..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div className="form-group">
                <label className="form-label">Precio proveedor (COP)</label>
                <input className="form-input" type="number" min="0" step="1" value={inputForm.precio_proveedor} onChange={setIn('precio_proveedor')} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Precio venta (COP)</label>
                <input className="form-input" type="number" min="0" step="1" value={inputForm.precio_venta} onChange={setIn('precio_venta')} placeholder="0" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">URLs de imágenes (separadas por coma)</label>
              <input className="form-input" value={inputForm.images} onChange={setIn('images')} placeholder="https://img1.jpg, https://img2.jpg" />
              <p className="form-hint">Opcional</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleGenerate} disabled={loading}>
              {loading
                ? <><Loader size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Generando…</>
                : <><Sparkles size={14} /> Generar con IA</>}
            </button>
            <button className="btn btn-ghost" onClick={resetAll} disabled={loading} title="Limpiar">
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        <div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', textAlign: 'center', gap: 12 }}>
            <Sparkles size={32} style={{ color: 'var(--text-muted)', opacity: 0.35 }} />
            <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 240, lineHeight: 1.6 }}>
              Completa el formulario y presiona <strong style={{ color: 'var(--text-secondary)' }}>Generar con IA</strong>.
              Antes de guardar podrás revisar y editar cada campo generado.
            </p>
          </div>
          <LogPanel />
        </div>
      </div>
    </>
  )

  // ══════════════════════════════════════════════════════════════
  //  FASE 2 — REVIEW & EDIT
  // ══════════════════════════════════════════════════════════════
  if (phase === PHASE.REVIEW) return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Revisar y confirmar</h1>
          <p className="page-subtitle">La IA generó el contenido. Edita lo que necesites y confirma para guardar.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => { setPhase(PHASE.INPUT); setLogs([]) }}>
            <X size={14} /> Volver
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading
              ? <><Loader size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Guardando…</>
              : <><Save size={14} /> Confirmar y guardar</>}
          </button>
        </div>
      </div>
      <PhaseBar />

      <div className="ai-grid">

        {/* Left — editable AI fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Edit3 size={14} style={{ color: 'var(--accent)' }} />
              <p style={{ ...secTitle, marginBottom: 0 }}>Contenido generado por IA — editable</p>
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Título</label>
              <input className="form-input" value={preview.title} onChange={setPrev('title')} />
              <p className="form-hint">{preview.title.length}/80 caracteres</p>
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Categoría</label>
              <select className="form-select" value={preview.category} onChange={setPrev('category')}>
                <option value="">Seleccionar...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Descripción para Facebook Marketplace</label>
              <textarea className="form-textarea" rows={6} value={preview.description} onChange={setPrev('description')} />
            </div>

            <div className="form-group">
              <label className="form-label">Etiquetas</label>
              <div className="tags-input-wrap" onClick={() => document.getElementById('tag-field-review').focus()}>
                {preview.tags.map(t => (
                  <span key={t} className="tag-item">
                    {t}
                    <button type="button" className="tag-remove" onClick={() => removeTag(t)}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <input
                  id="tag-field-review"
                  className="tag-input-field"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder={preview.tags.length === 0 ? 'Escribe y presiona Enter…' : ''}
                />
              </div>
              <p className="form-hint">Presiona Enter o coma para agregar</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setPhase(PHASE.INPUT); setLogs([]) }}>
              <X size={14} /> Volver y regenerar
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={loading}>
              {loading
                ? <><Loader size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Guardando…</>
                : <><Save size={14} /> Confirmar y guardar</>}
            </button>
          </div>
        </div>

        {/* Right — log + facebook preview + dropi recap */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <LogPanel />
          {/* Facebook preview */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 16 }}>📘</span>
              <p style={{ ...secTitle, marginBottom: 0 }}>Vista previa — Facebook Marketplace</p>
            </div>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              {preview.images?.[0] && (
                <img src={preview.images[0]} alt="" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.style.display = 'none' }} />
              )}
              <div style={{ padding: '12px 14px' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.35 }}>
                  {preview.title || '—'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>
                  {preview.description || '—'}
                </p>
                {preview.tags?.length > 0 && (
                  <p style={{ fontSize: 11, color: 'var(--accent)', lineHeight: 1.6 }}>
                    {preview.tags.map(t => `#${t}`).join(' ')}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Eye size={14} style={{ color: 'var(--text-muted)' }} />
              <p style={{ ...secTitle, marginBottom: 0 }}>Datos de Dropi</p>
            </div>
            {[
              ['Dropshipper',      preview.dropshipper,      false],
              ['Proveedor',        preview.provider,         false],
              ['SKU',              preview.sku,              true],
              ['ID Dropi',         preview.dropi_id,         true],
              ['Producto ID Dropi',preview.producto_id_dropi,true],
              ['Link Dropi',       preview.dropi_link,       false],
            ].map(([label, value, mono]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, gap: 12 }}>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
                <span style={{ color: 'var(--text-secondary)', fontFamily: mono ? 'monospace' : 'inherit', fontSize: mono ? 12 : 13, wordBreak: 'break-all', textAlign: 'right' }}>
                  {value || '—'}
                </span>
              </div>
            ))}

            {(preview.precio_proveedor || preview.precio_venta) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                {preview.precio_proveedor && (
                  <div style={{ background: 'var(--bg)', borderRadius: 6, padding: '8px 10px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>Precio proveedor</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(preview.precio_proveedor)}
                    </p>
                  </div>
                )}
                {preview.precio_venta && (
                  <div style={{ background: 'var(--accent-dim)', borderRadius: 6, padding: '8px 10px', border: '1px solid var(--accent)', textAlign: 'center' }}>
                    <p style={{ fontSize: 10, color: 'var(--accent)', marginBottom: 3 }}>Precio venta</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(preview.precio_venta)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {preview.images?.length > 0 && (
              <>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, marginBottom: 6 }}>Imágenes</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {preview.images.map((url, i) => (
                    <img key={i} src={url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }}
                      onError={e => { e.target.style.display = 'none' }} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )

  // ══════════════════════════════════════════════════════════════
  //  FASE 3 — SAVED
  // ══════════════════════════════════════════════════════════════
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Producto guardado</h1>
          <p className="page-subtitle">El producto fue creado exitosamente en tu catálogo.</p>
        </div>
        <button className="btn btn-primary" onClick={resetAll}>
          <Sparkles size={14} /> Subir otro producto
        </button>
      </div>
      <PhaseBar />

      <div className="ai-grid">
        <div className="card" style={{ borderColor: 'var(--accent)', boxShadow: '0 0 0 1px var(--accent-dim2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <CheckCircle size={16} color="var(--success)" />
            <p style={{ ...secTitle, color: 'var(--success)', marginBottom: 0 }}>Guardado correctamente</p>
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.3 }}>
            {saved?.title}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>
            {saved?.description}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
            {(saved?.tags || []).map(t => (
              <span key={t} className="tag" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', borderColor: 'transparent' }}>{t}</span>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['Categoría', saved?.category, false],
              ['Proveedor', saved?.provider, false],
              ['SKU',       saved?.sku,      true],
              ['ID Dropi',  saved?.dropi_id, true],
              ['ID en BD',  saved?.id,       true],
            ].map(([label, value, mono]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ color: 'var(--text-secondary)', fontFamily: mono ? 'monospace' : 'inherit' }}>{value || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <LogPanel />
          <button className="btn btn-ghost" style={{ width: '100%', marginTop: '1rem' }} onClick={resetAll}>
            <RotateCcw size={14} /> Subir otro producto
          </button>
        </div>
      </div>
    </>
  )
}