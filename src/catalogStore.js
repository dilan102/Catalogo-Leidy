import { createProduct } from './catalogData'

const PRODUCTS_KEY = 'leidy_catalog_products_v1'
const SESSION_KEY = 'leidy_catalog_admin_session_v1'

export function getStoredProducts() {
  try {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveStoredProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
}

export function saveProduct(productInput) {
  const products = getStoredProducts()
  const product = createProduct(productInput)
  const existingIndex = products.findIndex((item) => item.id === product.id)

  if (existingIndex >= 0) {
    products[existingIndex] = { ...products[existingIndex], ...product }
  } else {
    products.unshift(product)
  }

  saveStoredProducts(products)
  return product
}

export function deleteProduct(productId) {
  const products = getStoredProducts().filter((product) => product.id !== productId)
  saveStoredProducts(products)
}

export function getProductsBySubsection(sectionSlug, subsectionSlug) {
  return getStoredProducts()
    .filter((product) => product.sectionSlug === sectionSlug && product.subsectionSlug === subsectionSlug && product.isActive)
    .sort((first, second) => first.order - second.order)
}

export function getProductById(productId) {
  return getStoredProducts().find((product) => product.id === productId) || null
}

export function setAdminSession(isAuthenticated) {
  if (isAuthenticated) {
    localStorage.setItem(SESSION_KEY, 'true')
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

export function isAdminAuthenticated() {
  return localStorage.getItem(SESSION_KEY) === 'true'
}

export function readFilesAsDataUrls(files) {
  return Promise.all(
    files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        }),
    ),
  )
}
