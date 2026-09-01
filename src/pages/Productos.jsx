import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getProductCategories, getProductUnits,
  productImageUrl, badgeClassByCode, DEMO_CATEGORIES, DEMO_UNITS, INITIAL_PRODUCT_FORM,
} from '../services/productService';

// ─── Demo data (used if the API is unreachable) ─────────────
const DEMO_PRODUCTS = [
  { id: 1, name: 'Harina Blanca 1kg', code: 'HAR-001', category: DEMO_CATEGORIES[2], unit: DEMO_UNITS[2], stock: 120, min_stock: 30, price: 4.5, image: null },
  { id: 2, name: 'Afrecho a Granel',  code: 'AFR-001', category: DEMO_CATEGORIES[3], unit: DEMO_UNITS[0], stock: 8,   min_stock: 10, price: 180, image: null },
  { id: 3, name: 'Trigo Blando',      code: 'TB-001',  category: DEMO_CATEGORIES[0], unit: DEMO_UNITS[0], stock: 340, min_stock: 100, price: null, image: null },
  { id: 4, name: 'Trigo Durum',       code: 'TD-001',  category: DEMO_CATEGORIES[1], unit: DEMO_UNITS[0], stock: 210, min_stock: 100, price: null, image: null },
];

const fmtNum = n => (n != null && n !== '' && !isNaN(n)) ? Number(n).toLocaleString('es-VE') : '—';

// ─── Product Form Modal ──────────────────────────────────────
function ProductModal({ product, categories, units, onClose, onSaved }) {
  const isEdit = !!product;
  const [form, setForm] = useState(() => product
    ? {
        name: product.name || '',
        code: product.code || '',
        category_id: product.category?.id ?? product.category_id ?? '',
        unit_id: product.unit?.id ?? product.unit_id ?? '',
        description: product.description || '',
        stock: product.stock ?? '',
        min_stock: product.min_stock ?? '',
        price: product.price ?? '',
        imageFile: null,
        removeImage: false,
      }
    : INITIAL_PRODUCT_FORM);
  const [preview, setPreview] = useState(() => productImageUrl(product?.image));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    set('imageFile', file);
    set('removeImage', false);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    set('imageFile', null);
    set('removeImage', true);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('El nombre del producto es obligatorio.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await updateProduct(product.id, form);
      } else {
        await createProduct(form);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fap-modal-overlay" onClick={onClose}>
      <div className="fap-modal" onClick={e => e.stopPropagation()}>
        <div className="fap-modal-header">
          <span style={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--fap-font-display)', color: 'var(--fap-text)' }}>
            {isEdit ? `Editar Producto — ${product.name}` : 'Nuevo Producto'}
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--fap-text-muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}
          >
            <i className="bi bi-x" />
          </button>
        </div>
        <div className="fap-modal-body">
          {error && (
            <div className="alert-fap alert-error">
              <i className="bi bi-exclamation-circle" style={{ fontSize: 16 }} />
              {error}
            </div>
          )}

          <div className="row g-3">
            {/* Image uploader */}
            <div className="col-12 col-md-3 d-flex flex-column align-items-center">
              <div style={{
                width: 96, height: 96, borderRadius: 10,
                background: 'var(--fap-black)', border: '1px dashed var(--fap-border-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', marginBottom: 8,
              }}>
                {preview
                  ? <img src={preview} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <i className="bi bi-image" style={{ fontSize: 28, color: 'var(--fap-text-muted)' }} />
                }
              </div>
              <label className="btn-fap btn-fap-outline" style={{ padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
                <i className="bi bi-upload" /> Subir
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFile} style={{ display: 'none' }} />
              </label>
              {preview && (
                <button
                  className="btn-fap btn-fap-outline"
                  style={{ padding: '3px 10px', fontSize: 11, marginTop: 6, borderColor: 'rgba(192,57,43,0.4)', color: 'var(--fap-red-light)' }}
                  onClick={handleRemoveImage}
                >
                  <i className="bi bi-trash" /> Quitar
                </button>
              )}
            </div>

            {/* Fields */}
            <div className="col-12 col-md-9">
              <div className="row g-3">
                <div className="col-12 col-md-7">
                  <label className="form-label">Nombre *</label>
                  <input type="text" className="form-control" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="col-6 col-md-5">
                  <label className="form-label">Código</label>
                  <input type="text" className="form-control" value={form.code} onChange={e => set('code', e.target.value)} />
                </div>

                <div className="col-6 col-md-4">
                  <label className="form-label">Línea del Molino</label>
                  <select className="form-select" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                    <option value="">Sin categoría</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label">Unidad</label>
                  <select className="form-select" value={form.unit_id} onChange={e => set('unit_id', e.target.value)}>
                    <option value="">Sin unidad</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>)}
                  </select>
                </div>
                <div className="col-6 col-md-2">
                  <label className="form-label">Stock</label>
                  <input type="number" className="form-control" value={form.stock} onChange={e => set('stock', e.target.value)} />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label">Stock Mínimo</label>
                  <input type="number" className="form-control" value={form.min_stock} onChange={e => set('min_stock', e.target.value)} />
                </div>

                <div className="col-6 col-md-4">
                  <label className="form-label">Precio</label>
                  <input type="number" className="form-control" value={form.price} onChange={e => set('price', e.target.value)} />
                </div>
                <div className="col-12 col-md-8">
                  <label className="form-label">Descripción</label>
                  <input type="text" className="form-control" value={form.description} onChange={e => set('description', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button className="btn-fap btn-fap-outline" onClick={onClose}>Cancelar</button>
            <button className="btn-fap btn-fap-green" onClick={handleSubmit} disabled={saving}>
              {saving ? <><i className="bi bi-hourglass-split" /> Guardando...</> : <><i className="bi bi-check-lg" /> Guardar</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ────────────────────────────────────
function ConfirmDeleteModal({ product, onClose, onConfirmed }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    setDeleting(true);
    setError(null);
    try {
      await deleteProduct(product.id);
      onConfirmed();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  return (
    <div className="fap-modal-overlay" onClick={onClose}>
      <div className="fap-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="fap-modal-header">
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--fap-text)' }}>Eliminar Producto</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--fap-text-muted)', cursor: 'pointer', fontSize: 20 }}>
            <i className="bi bi-x" />
          </button>
        </div>
        <div className="fap-modal-body">
          {error && <div className="alert-fap alert-error"><i className="bi bi-exclamation-circle" />{error}</div>}
          <p style={{ color: 'var(--fap-text)' }}>
            ¿Seguro que desea eliminar <strong>{product.name}</strong>? Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button className="btn-fap btn-fap-outline" onClick={onClose}>Cancelar</button>
            <button className="btn-fap btn-fap-red" onClick={handleConfirm} disabled={deleting}>
              {deleting ? 'Eliminando...' : <><i className="bi bi-trash" /> Eliminar</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function Productos() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editing, setEditing]   = useState(null);   // product being edited, or {} for new
  const [deleting, setDeleting] = useState(null);   // product pending delete
  const [alert, setAlert]       = useState(null);

  useEffect(() => {
    getProductCategories().then(setCategories).catch(() => setCategories(DEMO_CATEGORIES));
    getProductUnits().then(setUnits).catch(() => setUnits(DEMO_UNITS));
  }, []);

  const loadProducts = useCallback(() => {
    setLoading(true);
    getProducts()
      .then(setProducts)
      .catch(() => setProducts(DEMO_PRODUCTS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const filtered = products.filter(p => {
    if (categoryFilter && String(p.category?.id ?? p.category_id ?? '') !== categoryFilter) return false;
    if (search && !`${p.name} ${p.code || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSaved = (msg) => {
    setEditing(null);
    setAlert({ type: 'success', msg: msg || 'Producto guardado con éxito.' });
    loadProducts();
  };

  const handleDeleted = () => {
    setDeleting(null);
    setAlert({ type: 'success', msg: 'Producto eliminado correctamente.' });
    loadProducts();
  };

  return (
    <div className="page-fade" style={{ padding: 24 }}>

      {editing && (
        <ProductModal
          product={editing.id ? editing : null}
          categories={categories}
          units={units}
          onClose={() => setEditing(null)}
          onSaved={() => handleSaved(editing.id ? 'Producto actualizado con éxito.' : 'Producto creado con éxito.')}
        />
      )}
      {deleting && (
        <ConfirmDeleteModal product={deleting} onClose={() => setDeleting(null)} onConfirmed={handleDeleted} />
      )}

      {alert && (
        <div className={`alert-fap alert-${alert.type}`}>
          <i className={`bi ${alert.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}`} style={{ fontSize: 16 }} />
          {alert.msg}
          <button onClick={() => setAlert(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            <i className="bi bi-x" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="section-card mb-3">
        <div className="section-header">
          <h6><i className="bi bi-funnel" style={{ color: 'var(--fap-green)' }} /> Inventario de Productos</h6>
          <button className="btn-fap btn-fap-green" onClick={() => setEditing({})}>
            <i className="bi bi-plus-lg" /> Nuevo Producto
          </button>
        </div>
        <div className="section-body">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label">Buscar</label>
              <input type="text" className="form-control" placeholder="Nombre o código..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Línea del Molino</label>
              <select className="form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="">Todas</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="section-card">
        <div className="section-header">
          <h6><i className="bi bi-box-seam" style={{ color: 'var(--fap-green)' }} /> Productos</h6>
          {loading
            ? <span className="badge-fap badge-yellow"><i className="bi bi-hourglass-split" /> Cargando</span>
            : <span className="badge-fap badge-green">{filtered.length} productos</span>
          }
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="fap-table">
            <thead>
              <tr>
                <th></th>
                <th>Nombre</th>
                <th>Código</th>
                <th>Línea</th>
                <th>Unidad</th>
                <th>Stock</th>
                <th>Precio</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: 'var(--fap-text-muted)', padding: 32 }}>
                    <i className="bi bi-inbox" style={{ fontSize: 24, display: 'block', marginBottom: 8, opacity: 0.4 }} />
                    No se encontraron productos
                  </td>
                </tr>
              )}
              {filtered.map(p => {
                const cat = p.category;
                const low = p.min_stock != null && Number(p.stock) < Number(p.min_stock);
                const imgUrl = productImageUrl(p.image);
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{
                        width: 36, height: 36, borderRadius: 6, overflow: 'hidden',
                        background: 'var(--fap-black)', border: '1px solid var(--fap-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {imgUrl
                          ? <img src={imgUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <i className="bi bi-image" style={{ color: 'var(--fap-text-muted)', fontSize: 14 }} />
                        }
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ color: 'var(--fap-text-muted)', fontFamily: 'monospace', fontSize: 12 }}>{p.code || '—'}</td>
                    <td>
                      {cat
                        ? (
                          <span className={`badge-fap ${badgeClassByCode[cat.code] || ''}`} style={!badgeClassByCode[cat.code] ? { color: cat.color, background: 'rgba(128,128,128,0.12)' } : undefined}>
                            {cat.name}
                          </span>
                        )
                        : <span style={{ color: 'var(--fap-text-muted)' }}>—</span>
                      }
                    </td>
                    <td style={{ color: 'var(--fap-text-muted)' }}>{p.unit?.abbreviation || '—'}</td>
                    <td style={{ fontWeight: 600, color: low ? 'var(--fap-red-light)' : 'var(--fap-text)' }}>
                      {fmtNum(p.stock)}
                    </td>
                    <td>{p.price != null && p.price !== '' ? `$${fmtNum(p.price)}` : '—'}</td>
                    <td>
                      <span className={`badge-fap ${low ? 'badge-red' : 'badge-green'}`}>
                        {low ? 'Stock Bajo' : 'OK'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-fap btn-fap-outline" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setEditing(p)}>
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          className="btn-fap btn-fap-outline"
                          style={{ padding: '4px 10px', fontSize: 11, borderColor: 'rgba(192,57,43,0.4)', color: 'var(--fap-red-light)' }}
                          onClick={() => setDeleting(p)}
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
