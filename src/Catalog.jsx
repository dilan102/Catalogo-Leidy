import { useEffect, useMemo, useState } from 'react'
import {
  ADMIN_CREDENTIALS,
  catalogHomeSections,
  catalogSections,
  flatSections,
  getAvailableSizes,
  getClothingSectionBySlug,
  getDefaultFlatSubsection,
  getFlatSectionBySlug,
  isFlatCatalogSection,
} from './catalogData'
import {
  deleteProduct,
  getProductById,
  getProductsBySection,
  getProductsBySubsection,
  ensureCatalogStructure,
  isAdminAuthenticated,
  saveProduct,
  setAdminSession,
  uploadProductImages,
} from './catalogStore'
import SiteNavbar from './components/SiteNavbar'
import SiteFooter from './components/SiteFooter'
import './Catalog.css'

const whatsappNumber = '573142773014'

/* Navegacion SPA para que el navegador no recargue la pagina al cambiar de ruta. */
function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/* Formatea precios en moneda colombiana. */
function formatPrice(price) {
  if (!price) return 'Precio por confirmar'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price)
}

/* Renderiza una imagen o un espacio reservado cuando aun no hay archivo. */
function ImageSlot({ src, label, className = '' }) {
  if (src) {
    return <img className={`catalog-image ${className}`.trim()} src={src} alt={label} />
  }

  return (
    <div className={`catalog-image-slot ${className}`.trim()} aria-label={label}>
      <span>Imagen</span>
    </div>
  )
}

/* Convierte un slug de seccion en la ruta correcta del detalle. */
function getProductRoute(product) {
  if (isFlatCatalogSection(product.sectionSlug)) {
    return `/catalogo/${product.sectionSlug}/${product.id}`
  }

  return `/catalogo/ropa/${product.sectionSlug}/${product.subsectionSlug}/${product.id}`
}

/* Devuelve el nombre humano de la seccion principal. */
function getCatalogTitle(sectionSlug) {
  return (
    catalogHomeSections.find((section) => section.slug === sectionSlug)?.name ||
    flatSections.find((section) => section.slug === sectionSlug)?.name ||
    catalogSections.find((section) => section.slug === sectionSlug)?.name ||
    sectionSlug
  )
}

/* Busca el nombre visible de una subseccion de ropa a partir de su slug. */
function getClothingSubsectionTitle(sectionSlug, subsectionSlug) {
  return catalogSections.find((section) => section.slug === sectionSlug)?.subsections.find((item) => item.slug === subsectionSlug)?.name || subsectionSlug
}

/* Panel oculto del administrador sin control de roles por ahora. */
function AdminDashboard({ adminMode }) {
  return (
    <main className="catalog-page">
      <section className="catalog-title-block">
        <p>Panel oculto</p>
        <h1>Administrador</h1>
      </section>

      <section className="catalog-admin-note">
        Este panel no aparece en el menu. Solo entra por la URL y usa login cuando quieras editar.
      </section>

      <section className="catalog-grid catalog-section-grid">
        {catalogHomeSections.map((section) => (
          <button
            key={section.slug}
            type="button"
            className="catalog-section-card"
            onClick={() => navigate(section.slug === 'ropa' ? '/catalogo/ropa' : `/catalogo/${section.slug}`)}
          >
            <ImageSlot src={section.image} label={section.name} />
            <span>
              <strong>{section.name}</strong>
              <small>{section.description}</small>
            </span>
          </button>
        ))}
      </section>

      <section className="catalog-admin-note" style={{ marginTop: '24px' }}>
        Estado de sesión: {adminMode ? 'activo' : 'inactivo'}
      </section>
    </main>
  )
}

/* Formulario compartido para crear y editar productos en ropa o en secciones planas. */
function ProductForm({ section, subsection, scopeLabel, editingProduct, onCancel, onSaved }) {
  /* Piñateria y accesorios usan campos planos; calzado tambien muestra tallas. */
  const isFlatSection = isFlatCatalogSection(section.slug)
  const isCalzadoSection = section.slug === 'calzado'
  const showSizeField = !isFlatSection || isCalzadoSection
  const availableSizes = useMemo(
    () => (showSizeField ? getAvailableSizes(section.slug, subsection.slug) : []),
    [section.slug, subsection.slug, showSizeField],
  )
  const [formState, setFormState] = useState({
    name: editingProduct?.name || '',
    description: editingProduct?.description || '',
    price: editingProduct?.price || '',
    tag: editingProduct?.tag || subsection.name || section.name || '',
    quantityAvailable: editingProduct?.quantityAvailable ?? '',
    sizes: editingProduct?.sizes || [],
    isActive: editingProduct?.isActive ?? true,
    isFeatured: editingProduct?.isFeatured ?? false,
  })
  const [existingImages, setExistingImages] = useState(editingProduct?.images || [])
  const [newImages, setNewImages] = useState([])
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  /* Mantiene marcada o desmarcada cada talla seleccionada. */
  const selectedSizes = new Set(formState.sizes)

  const toggleSize = (size) => {
    setFormState((current) => ({
      ...current,
      sizes: selectedSizes.has(size)
        ? current.sizes.filter((item) => item !== size)
        : [...current.sizes, size],
    }))
  }

  /* Sube imagenes al bucket de Supabase para usarlas en el producto. */
  const handleFiles = async (files) => {
    setError('')
    try {
      const urls = await uploadProductImages(Array.from(files), section.slug)
      setNewImages(urls)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'No se pudieron subir las imágenes.')
    }
  }

  /* Guarda el producto con el mismo id cuando esta en modo edicion. */
  const handleSubmit = async (event) => {
    event.preventDefault()
    const images = [...existingImages, ...newImages]

    if (!formState.name.trim()) {
      setError('El nombre del producto es obligatorio.')
      return
    }

    setIsSaving(true)
    setError('')
    try {
      await saveProduct({
        id: editingProduct?.id,
        subsectionId: subsection.id,
        sectionSlug: section.slug,
        subsectionSlug: subsection.slug,
        name: formState.name,
        description: formState.description,
        price: formState.price,
        tag: formState.tag,
        quantityAvailable: formState.quantityAvailable,
        images,
        sizes: formState.sizes,
        isActive: formState.isActive,
        isFeatured: formState.isFeatured,
      })
      onSaved()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el producto.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="catalog-product-form">
      <h2>
        {editingProduct ? 'Editar producto' : 'Agregar producto'} a {scopeLabel}
      </h2>
      <form onSubmit={handleSubmit}>
        <label>
          <span>Nombre del producto</span>
          <input
            value={formState.name}
            onChange={(event) => setFormState({ ...formState, name: event.target.value })}
            placeholder="Ej: Blusa deportiva"
            required
          />
        </label>

        <label>
          <span>Precio</span>
          <input
            type="number"
            min="0"
            value={formState.price}
            onChange={(event) => setFormState({ ...formState, price: event.target.value })}
            placeholder="Ej: 45000"
          />
        </label>

        <label className="catalog-wide-field">
          <span>Descripción</span>
          <textarea
            value={formState.description}
            onChange={(event) => setFormState({ ...formState, description: event.target.value })}
            rows={4}
            placeholder="Describe las características del producto"
          />
        </label>

        <label>
          <span>Etiqueta</span>
          <input
            value={formState.tag}
            onChange={(event) => setFormState({ ...formState, tag: event.target.value })}
            placeholder="Ej: Nuevo"
          />
        </label>

        {isFlatSection && (
          <label>
            <span>Cantidad disponible</span>
            <input
              type="number"
              min="0"
              value={formState.quantityAvailable}
              onChange={(event) => setFormState({ ...formState, quantityAvailable: event.target.value })}
              placeholder="Ej: 12"
            />
          </label>
        )}

        {existingImages.length > 0 && (
          <div className="catalog-wide-field">
            <span className="catalog-field-title">Imágenes actuales</span>
            <div className="catalog-edit-images">
              {existingImages.map((image, index) => (
                <article key={`${image}-${index}`}>
                  <ImageSlot src={image} label={`${formState.name} ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => setExistingImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    Eliminar
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}

        <label className="catalog-wide-field">
          <span>{editingProduct ? 'Agregar nuevas fotos' : 'Fotos del producto'}</span>
          <input type="file" accept="image/*" multiple onChange={(event) => handleFiles(event.target.files || [])} />
        </label>

        {newImages.length > 0 && (
          <div className="catalog-wide-field catalog-preview-grid">
            {newImages.map((image, index) => (
              <ImageSlot key={`${image}-${index}`} src={image} label={`Preview ${index + 1}`} />
            ))}
          </div>
        )}

        {showSizeField && (
          <div className="catalog-wide-field">
            <span className="catalog-field-title">Tallas disponibles</span>
            <div className="catalog-size-list">
              {availableSizes.map((size) => (
                <label key={size}>
                  <input type="checkbox" checked={selectedSizes.has(size)} onChange={() => toggleSize(size)} />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="catalog-form-checks">
          <label>
            <input
              type="checkbox"
              checked={formState.isActive}
              onChange={(event) => setFormState({ ...formState, isActive: event.target.checked })}
            />
            <span>Producto activo</span>
          </label>
        </div>

        {error && <p className="catalog-form-error">{error}</p>}

        <footer>
          <button type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar producto'}
          </button>
        </footer>
      </form>
    </section>
  )
}

/* Tarjeta de producto que siempre apunta al detalle correcto segun la seccion. */
function ProductCard({ product, adminMode, onEdit, onDelete }) {
  const images = product.images || []

  return (
    <article className="catalog-product-card">
      <button type="button" onClick={() => navigate(getProductRoute(product))}>
        <div className="catalog-product-image-wrap">
          {/* Etiqueta pequena en la esquina superior izquierda del producto. */}
          {product.tag ? <span className="catalog-product-tag">{product.tag}</span> : null}
          <ImageSlot src={images[0]} label={product.name} />
        </div>
        <div className="catalog-product-info">
          <h3>{product.name}</h3>
          <p>{formatPrice(product.price)}</p>
          <small>ID: {product.id}</small>
          <div>
            {(product.sizes || []).slice(0, 5).map((size) => (
              <span key={size}>{size}</span>
            ))}
          </div>
        </div>
      </button>
      {adminMode && (
        <footer>
          <button type="button" onClick={() => onEdit(product)}>
            Editar
          </button>
          <button type="button" onClick={() => onDelete(product)}>
            Eliminar
          </button>
        </footer>
      )}
    </article>
  )
}

/* Lista de productos reutilizable para ropa y para las secciones planas. */
function ProductListPage({ section, subsection, adminMode, breadcrumbItems, loadProducts, scopeLabel }) {
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productsError, setProductsError] = useState('')

  const refreshProducts = async () => {
    setLoadingProducts(true)
    setProductsError('')
    try {
      setProducts(await loadProducts())
    } catch (error) {
      setProducts([])
      setProductsError(error instanceof Error ? error.message : 'No se pudieron cargar productos.')
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    void refreshProducts()
  }, [section.slug, subsection.slug])

  const handleDelete = async (product) => {
    if (!window.confirm('¿Eliminar este producto?')) return

    try {
      await deleteProduct(product.id)
      await refreshProducts()
    } catch (error) {
      setProductsError(error instanceof Error ? error.message : 'No se pudo eliminar el producto.')
    }
  }

  return (
    <main className="catalog-page">
      <Breadcrumb items={breadcrumbItems} />
      <section className="catalog-subsection-heading">
        <div>
          <p>{section.name}</p>
          <h1>{scopeLabel}</h1>
        </div>
        <span>{products.length} productos</span>
        {adminMode && (
          <button
            type="button"
            onClick={() => {
              setEditingProduct(null)
              setShowForm((current) => !current)
            }}
          >
            {showForm ? 'Cerrar formulario' : 'Agregar producto'}
          </button>
        )}
      </section>

      {adminMode && showForm && (
        <ProductForm
          key={editingProduct?.id || 'new-product'}
          section={section}
          subsection={subsection}
          scopeLabel={scopeLabel}
          editingProduct={editingProduct}
          onCancel={() => {
            setShowForm(false)
            setEditingProduct(null)
          }}
          onSaved={() => {
            setShowForm(false)
            setEditingProduct(null)
            void refreshProducts()
          }}
        />
      )}

      {loadingProducts ? (
        <p className="catalog-empty">Cargando productos...</p>
      ) : productsError ? (
        <p className="catalog-empty">{productsError}</p>
      ) : products.length > 0 ? (
        <section className="catalog-product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              adminMode={adminMode}
              onEdit={(item) => {
                setEditingProduct(item)
                setShowForm(true)
                window.setTimeout(
                  () => document.querySelector('.catalog-product-form')?.scrollIntoView({ behavior: 'smooth' }),
                  50,
                )
              }}
              onDelete={handleDelete}
            />
          ))}
        </section>
      ) : (
        <p className="catalog-empty">No hay productos aún.</p>
      )}
    </main>
  )
}

/* Pagina de ropa que abre los cuatro grupos originales. */
function RopaLandingPage() {
  return (
    <main className="catalog-page">
      <section className="catalog-title-block">
        <p>Catálogo</p>
        <h1>Ropa</h1>
      </section>

      <section className="catalog-grid catalog-section-grid">
        {catalogSections.map((section) => (
          <button
            type="button"
            className="catalog-section-card"
            key={section.id}
            onClick={() => navigate(`/catalogo/ropa/${section.slug}`)}
          >
            <ImageSlot src={section.image} label={section.name} />
            <span>
              <strong>{section.name}</strong>
              <small>{section.description}</small>
            </span>
          </button>
        ))}
      </section>
    </main>
  )
}

/* Pagina de una subseccion concreta dentro de Ropa. */
function ClothingSubsectionPage({ section, subsection, adminMode }) {
  return (
    <ProductListPage
      section={section}
      subsection={subsection}
      adminMode={adminMode}
      breadcrumbItems={[
        ['Catálogo', '/catalogo'],
        ['Ropa', '/catalogo/ropa'],
        [section.name, `/catalogo/ropa/${section.slug}`],
        [subsection.name],
      ]}
      scopeLabel={subsection.name}
      loadProducts={() => getProductsBySubsection(section.slug, subsection.slug)}
    />
  )
}

/* Pagina intermedia de cada grupo de ropa con todas sus subsecciones. */
function ClothingSectionPage({ section }) {
  return (
    <main className="catalog-page">
      <Breadcrumb items={[['Catálogo', '/catalogo'], ['Ropa', '/catalogo/ropa'], [section.name]]} />
      <section className="catalog-title-block">
        <p>Ropa</p>
        <h1>{section.name}</h1>
      </section>

      <section className="catalog-grid catalog-subsection-grid">
        {section.subsections.map((subsection) => (
          <button
            type="button"
            className="catalog-subsection-card"
            key={subsection.id}
            onClick={() => navigate(`/catalogo/ropa/${section.slug}/${subsection.slug}`)}
          >
            <ImageSlot src={subsection.image} label={subsection.name} />
            <span>
              <strong>{subsection.name}</strong>
              <small>{subsection.description}</small>
            </span>
          </button>
        ))}
      </section>
    </main>
  )
}

/* Pagina plana para Piñateria, Calzado y Accesorios sin subsecciones visibles. */
function FlatSectionPage({ section, adminMode }) {
  const subsection = getDefaultFlatSubsection(section.slug)

  return (
    <ProductListPage
      section={section}
      subsection={subsection}
      adminMode={adminMode}
      breadcrumbItems={[['Catálogo', '/catalogo'], [section.name]]}
      scopeLabel={section.name}
      loadProducts={() => getProductsBySection(section.slug)}
    />
  )
}

/* Breadcrumb reusable para no repetir la navegacion superior. */
function Breadcrumb({ items }) {
  return (
    <p className="catalog-breadcrumb">
      <button type="button" onClick={() => navigate('/')}>
        Inicio
      </button>
      {' / '}
      {items.map((item, index) => {
        const [label, href] = Array.isArray(item) ? item : [item]
        return (
          <span key={`${label}-${index}`}>
            {href ? (
              <button type="button" onClick={() => navigate(href)}>
                {label}
              </button>
            ) : (
              label
            )}
            {index < items.length - 1 ? ' / ' : ''}
          </span>
        )
      })}
    </p>
  )
}

/* Pantalla inicial del catalogo con acceso a las cuatro secciones principales. */
function CatalogHome() {
  return (
    <main className="catalog-page">
      <section className="catalog-title-block">
        <p>Catálogo</p>
        <h1>Explora por sección</h1>
      </section>

      <section className="catalog-grid catalog-section-grid">
        {catalogHomeSections.map((section) => (
          <button
            type="button"
            className="catalog-section-card"
            key={section.id}
            onClick={() => navigate(section.slug === 'ropa' ? '/catalogo/ropa' : `/catalogo/${section.slug}`)}
          >
            <ImageSlot src={section.image} label={section.name} />
            <span>
              <strong>{section.name}</strong>
              <small>{section.description}</small>
            </span>
          </button>
        ))}
      </section>
    </main>
  )
}

/* Login oculto del panel administrativo. */
function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setAdminSession(true)
      onLogin()
      navigate('/admin')
      return
    }

    setError('Credenciales incorrectas')
  }

  return (
    <div className="catalog-shell">
      <SiteNavbar />
      <main className="catalog-login-page">
        <section className="catalog-login-card">
          <h1>Acceso Admin</h1>
          <p>Leidy Montañez</p>
          <form onSubmit={handleSubmit}>
            <label>
              <span>Usuario</span>
              <input value={username} onChange={(event) => setUsername(event.target.value)} required />
            </label>
            <label>
              <span>Contraseña</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            {error && <strong>{error}</strong>}
            <button type="submit">Ingresar</button>
          </form>
          <button className="catalog-text-button" type="button" onClick={() => navigate('/catalogo')}>
            Volver al catálogo
          </button>
        </section>
      </main>
    </div>
  )
}

/* Detalle de producto con la ruta correcta segun sea ropa o una seccion plana. */
function ProductPage({ product }) {
  const [imageIndex, setImageIndex] = useState(0)
  const images = product.images || []
  const selectedImage = images[imageIndex]
  const isFlatSection = isFlatCatalogSection(product.sectionSlug)
  const whatsappMessage = `Hola, quisiera mas información acerca de este producto: ${product.name}${
    product.price ? `\nPrecio: ${formatPrice(product.price)}` : ''
  }${product.sizes?.length ? `\nTallas disponibles: ${product.sizes.slice(0, 5).join(', ')}` : ''}${
    product.description ? `\nDetalles: ${product.description}` : ''
  }`

  return (
    <main className="catalog-page">
      <Breadcrumb
        items={
          isFlatSection
            ? [['Catálogo', '/catalogo'], [getCatalogTitle(product.sectionSlug), `/catalogo/${product.sectionSlug}`], [product.name]]
            : [
                ['Catálogo', '/catalogo'],
                ['Ropa', '/catalogo/ropa'],
                [getCatalogTitle(product.sectionSlug), `/catalogo/ropa/${product.sectionSlug}`],
                [
                  getClothingSubsectionTitle(product.sectionSlug, product.subsectionSlug),
                  `/catalogo/ropa/${product.sectionSlug}/${product.subsectionSlug}`,
                ],
                [product.name],
              ]
        }
      />
      <section className="catalog-detail">
        <div>
          <ImageSlot src={selectedImage} label={product.name} />
          {images.length > 1 && (
            <div className="catalog-detail-thumbs">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={index === imageIndex ? 'is-active' : ''}
                  onClick={() => setImageIndex(index)}
                >
                  <ImageSlot src={image} label={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
        <article>
          <p>Producto</p>
          <h1>{product.name}</h1>
          <small className="catalog-product-id">ID: {product.id}</small>
          <strong>{formatPrice(product.price)}</strong>
          {product.description && <p>{product.description}</p>}
          {product.sizes?.length > 0 && (
            <div className="catalog-pill-list">
              {product.sizes.map((size) => (
                <span key={size}>{size}</span>
              ))}
            </div>
          )}
          {product.colors?.length > 0 && (
            <div className="catalog-pill-list">
              {product.colors.map((color) => (
                <span key={color}>{color}</span>
              ))}
            </div>
          )}
          <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noreferrer">
            ¿Quieres este producto?
          </a>
        </article>
      </section>
    </main>
  )
}

/* Carga de un producto por id para abrir el detalle correcto. */
function ProductRoute({ productId }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadProduct() {
      setLoading(true)
      try {
        const result = await getProductById(productId)
        if (!cancelled) {
          setProduct(result)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadProduct()

    return () => {
      cancelled = true
    }
  }, [productId])

  if (loading) {
    return (
      <main className="catalog-page">
        <p className="catalog-empty">Cargando producto...</p>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="catalog-page">
        <p className="catalog-empty">Producto no encontrado.</p>
      </main>
    )
  }

  return <ProductPage product={product} />
}

export default function Catalog({ route }) {
  const [adminMode, setAdminMode] = useState(false)
  const [structureReady, setStructureReady] = useState(false)
  const [structureError, setStructureError] = useState('')

  useEffect(() => {
    /* Se conserva la sesion de admin, pero no se usa ningun rol todavia. */
    setAdminMode(isAdminAuthenticated())
    /* Asegura que Supabase tenga creadas las secciones nuevas y sus subsecciones ocultas. */
    void ensureCatalogStructure()
      .then(() => {
        setStructureReady(true)
      })
      .catch((error) => {
        setStructureError(error instanceof Error ? error.message : 'No se pudo preparar la estructura del catálogo.')
      })
  }, [])

  if (!structureReady && !structureError) {
    return (
      <div className="catalog-shell">
        <SiteNavbar />
        <main className="catalog-page">
          <p className="catalog-empty">Preparando catálogo...</p>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (structureError) {
    return (
      <div className="catalog-shell">
        <SiteNavbar />
        <main className="catalog-page">
          <p className="catalog-empty">{structureError}</p>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (route.pathname === '/admin/login') {
    return <AdminLogin onLogin={() => setAdminMode(true)} />
  }

  const parts = route.pathname.split('/').filter(Boolean)
  const catalogParts = parts[0] === 'catalogo' ? parts.slice(1) : []
  const topLevelSlug = catalogParts[0]
  let pageContent = null

  if (route.pathname === '/admin') {
    pageContent = <AdminDashboard adminMode={adminMode} />
  } else if (catalogParts.length === 0) {
    pageContent = <CatalogHome />
  } else if (topLevelSlug === 'ropa') {
    if (catalogParts.length === 1) {
      pageContent = <RopaLandingPage />
    } else {
      const sectionSlug = catalogParts[1]
      const subsectionSlug = catalogParts[2]
      const productId = catalogParts[3]
      const section = sectionSlug ? getClothingSectionBySlug(sectionSlug) : null

      pageContent = !section ? (
        <main className="catalog-page">
          <p className="catalog-empty">Sección no encontrada.</p>
        </main>
      ) : productId ? (
        <ProductRoute productId={productId} />
      ) : subsectionSlug ? (
        section.subsections.find((item) => item.slug === subsectionSlug) ? (
          <ClothingSubsectionPage
            section={section}
            subsection={section.subsections.find((item) => item.slug === subsectionSlug)}
            adminMode={adminMode}
          />
        ) : (
          <main className="catalog-page">
            <p className="catalog-empty">Subsección no encontrada.</p>
          </main>
        )
      ) : (
        <ClothingSectionPage section={section} />
      )
    }
  } else {
    const flatSection = getFlatSectionBySlug(topLevelSlug)
    if (flatSection) {
      const productId = catalogParts[1]
      pageContent = productId ? <ProductRoute productId={productId} /> : <FlatSectionPage section={flatSection} adminMode={adminMode} />
    } else {
      pageContent = <CatalogHome />
    }
  }

  return (
    <div className="catalog-shell">
      <SiteNavbar />
      {pageContent}
      <SiteFooter />
    </div>
  )
}
