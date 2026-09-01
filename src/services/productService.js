/**
 * productService.js
 * Centralized API calls for the Product / Inventory module (FAPARCA)
 */

const BASE_URL = process.env.REACT_APP_API_URL;

// Origin (without the /faparca/api suffix) used to resolve relative image paths
const API_ORIGIN = BASE_URL.replace(/\/faparca\/api\/?$/, '');

const jsonHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.msg || `HTTP ${res.status}`);
  }
  return res.json();
}

// Builds a full URL for an image path returned by the API (e.g. "uploads/products/xyz.png")
export function productImageUrl(image) {
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  return `${API_ORIGIN}/${image}`;
}

// Converts form state into a FormData payload (multipart, supports image file)
function buildFormData(product) {
  const fd = new FormData();
  fd.append('name', product.name || '');
  fd.append('code', product.code || '');
  if (product.category_id !== '' && product.category_id != null) fd.append('category_id', product.category_id);
  if (product.unit_id !== '' && product.unit_id != null) fd.append('unit_id', product.unit_id);
  fd.append('description', product.description || '');
  fd.append('stock', product.stock === '' || product.stock == null ? '0' : product.stock);
  if (product.min_stock !== '' && product.min_stock != null) fd.append('min_stock', product.min_stock);
  if (product.price !== '' && product.price != null) fd.append('price', product.price);
  if (product.imageFile) fd.append('image', product.imageFile);
  if (product.removeImage) fd.append('remove_image', 'true');
  return fd;
}

// ─── Products ─────────────────────────────────────────────────
export async function getProducts() {
  const res = await fetch(`${BASE_URL}/product`, { headers: jsonHeaders });
  return handleResponse(res);
}

export async function getProductById(id) {
  const res = await fetch(`${BASE_URL}/product/${id}`, { headers: jsonHeaders });
  return handleResponse(res);
}

export async function createProduct(product) {
  const res = await fetch(`${BASE_URL}/product`, {
    method: 'POST',
    body: buildFormData(product),
  });
  return handleResponse(res);
}

export async function updateProduct(id, product) {
  const res = await fetch(`${BASE_URL}/product/${id}`, {
    method: 'PUT',
    body: buildFormData(product),
  });
  return handleResponse(res);
}

export async function deleteProduct(id) {
  const res = await fetch(`${BASE_URL}/product/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

// ─── Categories (mill lines) — backed by the product_category table ──
export async function getProductCategories() {
  const res = await fetch(`${BASE_URL}/product-category`, { headers: jsonHeaders });
  return handleResponse(res);
}

// Fallback used only if the API is unreachable (mirrors sql/product_module.sql seed data)
export const DEMO_CATEGORIES = [
  { id: 1, name: 'Trigo Blando', code: 'soft_wheat', color: 'var(--fap-yellow-light)' },
  { id: 2, name: 'Trigo Durum', code: 'durum_wheat', color: 'var(--fap-red-light)' },
  { id: 3, name: 'Harina', code: 'flour', color: 'var(--fap-green-light)' },
  { id: 4, name: 'Afrecho', code: 'bran', color: 'var(--fap-blue-light)' },
  { id: 5, name: 'Otro', code: 'other', color: 'var(--fap-text-muted)' },
];

export const badgeClassByCode = {
  soft_wheat: 'badge-yellow',
  durum_wheat: 'badge-red',
  flour: 'badge-green',
  bran: 'badge-blue',
  other: '',
};

// ─── Units — backed by the product_unit table ────────────────
export async function getProductUnits() {
  const res = await fetch(`${BASE_URL}/product-unit`, { headers: jsonHeaders });
  return handleResponse(res);
}

// Fallback used only if the API is unreachable (mirrors sql/product_module.sql seed data)
export const DEMO_UNITS = [
  { id: 1, name: 'Tonelada', abbreviation: 'ton' },
  { id: 2, name: 'Kilogramo', abbreviation: 'kg' },
  { id: 3, name: 'Saco', abbreviation: 'saco' },
  { id: 4, name: 'Bulto', abbreviation: 'bulto' },
  { id: 5, name: 'Litro', abbreviation: 'lt' },
  { id: 6, name: 'Unidad', abbreviation: 'unidad' },
];

// Initial empty form state
export const INITIAL_PRODUCT_FORM = {
  name: '',
  code: '',
  category_id: '',
  unit_id: '',
  description: '',
  stock: '',
  min_stock: '',
  price: '',
  imageFile: null,
  removeImage: false,
};
