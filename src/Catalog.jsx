import { useEffect, useMemo, useState } from 'react'
import { ADMIN_CREDENTIALS, catalogSections, getAvailableSizes } from './catalogData'
import {
  deleteProduct,
  getProductById,
  getProductsBySubsection,
  getStoredProducts,
  isAdminAuthenticated,
  readFilesAsDataUrls,
  saveProduct,
  setAdminSession,
} from './catalogStore'
import './Catalog.css'

const whatsappNumber = '573142773014'

function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function formatPrice(price) {
  if (!price) return 'Precio por confirmar'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price)
}

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

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setAdminSession(true)
      onLogin()
      navigate('/catalogo')
      return
    }
    setError('Credenciales incorrectas')
  }

  return (
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
  )
}

function CatalogHeader({ adminMode, onLogout }) {
  return (
    <header className="catalog-header">
      <button type="button" className="catalog-brand-button" onClick={() => navigate('/')}>
        <img src="/Logo_leidy.png" alt="" />
        <span>Leidy Montañez</span>
      </button>
      <nav>
        <button type="button" onClick={() => navigate('/catalogo')}>Ropa</button>
        {adminMode ? (
          <button type="button" onClick={onLogout}>Salir admin</button>
        ) : null}
      </nav>
    </header>
  )
}

function CatalogHome({ adminMode }) {
  return (
    <main className="catalog-page">
      <section className="catalog-title-block">
        <p>Catálogo</p>
        <h1>Ropa</h1>
      </section>

      {adminMode && (
        <div className="catalog-admin-note">
          Modo administrador activo. Entra a cualquier subsección para crear productos.
        </div>
      )}

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

function SectionPage({ section }) {
  return (
    <main className="catalog-page">
      <Breadcrumb items={[['Ropa', '/catalogo'], [section.name]]} />
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

function Breadcrumb({ items }) {
  return (
    <p className="catalog-breadcrumb">
      <button type="button" onClick={() => navigate('/')}>Inicio</button>
      {' / '}
      {items.map((item, index) => {
        const [label, href] = Array.isArray(item) ? item : [item]
        return (
          <span key={`${label}-${index}`}>
            {href ? <button type="button" onClick={() => navigate(href)}>{label}</button> : label}
            {index < items.length - 1 ? ' / ' : ''}
          </span>
        )
      })}
    </p>
  )
}

function ProductCard({ product, adminMode, onEdit, onDelete }) {
  const images = product.images || []

  return (
    <article className="catalog-product-card">
      <button type="button" onClick={() => navigate(`/catalogo/ropa/${product.sectionSlug}/${product.subsectionSlug}/${product.id}`)}>
        <div className="catalog-product-image-wrap">
          <ImageSlot src={images[0]} label={product.name} />
        </div>
        <div className="catalog-product-info">
          <h3>{product.name}</h3>
          <p>{formatPrice(product.price)}</p>
          <div>
            {product.sizes.slice(0, 5).map((size) => (
              <span key={size}>{size}</span>
            ))}
          </div>
        </div>
      </button>
      {adminMode && (
        <footer>
          <button type="button" onClick={() => onEdit(product)}>Editar</button>
          <button type="button" onClick={() => onDelete(product)}>Eliminar</button>
        </footer>
      )}
    </article>
  )
}

function ProductForm({ section, subsection, editingProduct, onCancel, onSaved }) {
  const availableSizes = useMemo(() => getAvailableSizes(section.slug, subsection.slug), [section.slug, subsection.slug])
  const [formState, setFormState] = useState({
    name: editingProduct?.name || '',
    description: editingProduct?.description || '',
    price: editingProduct?.price || '',
    sizes: editingProduct?.sizes || [],
    colors: editingProduct?.colors?.join(', ') || '',
    isActive: editingProduct?.isActive ?? true,
    isFeatured: editingProduct?.isFeatured ?? false,
    order: editingProduct?.order || 0,
  })
  const [existingImages, setExistingImages] = useState(editingProduct?.images || [])
  const [newImages, setNewImages] = useState([])
  const [error, setError] = useState('')

  const selectedSizes = new Set(formState.sizes)

  const toggleSize = (size) => {
    setFormState((current) => ({
      ...current,
      sizes: selectedSizes.has(size)
        ? current.sizes.filter((item) => item !== size)
        : [...current.sizes, size],
    }))
  }

  const handleFiles = async (files) => {
    const urls = await readFilesAsDataUrls(Array.from(files))
    setNewImages(urls)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const images = [...existingImages, ...newImages]

    if (!formState.name.trim()) {
      setError('El nombre del producto es obligatorio.')
      return
    }

    saveProduct({
      id: editingProduct?.id,
      subsectionId: subsection.id,
      sectionSlug: section.slug,
      subsectionSlug: subsection.slug,
      name: formState.name,
      description: formState.description,
      price: formState.price,
      images,
      sizes: formState.sizes,
      colors: formState.colors.split(',').map((color) => color.trim()).filter(Boolean),
      isActive: formState.isActive,
      isFeatured: formState.isFeatured,
      order: formState.order,
    })
    onSaved()
  }

  return (
    <section className="catalog-product-form">
      <h2>{editingProduct ? 'Editar producto' : 'Agregar producto'} a {subsection.name}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <span>Nombre del producto</span>
          <input value={formState.name} onChange={(event) => setFormState({ ...formState, name: event.target.value })} placeholder="Ej: Blusa deportiva" required />
        </label>

        <label>
          <span>Precio</span>
          <input type="number" min="0" value={formState.price} onChange={(event) => setFormState({ ...formState, price: event.target.value })} placeholder="Ej: 45000" />
        </label>

        <label className="catalog-wide-field">
          <span>Descripción</span>
          <textarea value={formState.description} onChange={(event) => setFormState({ ...formState, description: event.target.value })} rows={4} placeholder="Describe las características del producto" />
        </label>

        {existingImages.length > 0 && (
          <div className="catalog-wide-field">
            <span className="catalog-field-title">Imágenes actuales</span>
            <div className="catalog-edit-images">
              {existingImages.map((image, index) => (
                <article key={`${image}-${index}`}>
                  <ImageSlot src={image} label={`${formState.name} ${index + 1}`} />
                  <button type="button" onClick={() => setExistingImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
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
            {newImages.map((image, index) => <ImageSlot key={`${image}-${index}`} src={image} label={`Preview ${index + 1}`} />)}
          </div>
        )}

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

        <label>
          <span>Colores</span>
          <input value={formState.colors} onChange={(event) => setFormState({ ...formState, colors: event.target.value })} placeholder="Rojo, Negro, Blanco" />
        </label>

        <label>
          <span>Orden</span>
          <input type="number" value={formState.order} onChange={(event) => setFormState({ ...formState, order: event.target.value })} />
        </label>

        <div className="catalog-form-checks">
          <label>
            <input type="checkbox" checked={formState.isActive} onChange={(event) => setFormState({ ...formState, isActive: event.target.checked })} />
            <span>Producto activo</span>
          </label>
          <label>
            <input type="checkbox" checked={formState.isFeatured} onChange={(event) => setFormState({ ...formState, isFeatured: event.target.checked })} />
            <span>Destacado</span>
          </label>
        </div>

        {error && <p className="catalog-form-error">{error}</p>}

        <footer>
          <button type="button" onClick={onCancel}>Cancelar</button>
          <button type="submit">Guardar producto</button>
        </footer>
      </form>
    </section>
  )
}

function SubsectionPage({ section, subsection, adminMode }) {
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const refreshProducts = () => {
    setProducts(getProductsBySubsection(section.slug, subsection.slug))
  }

  useEffect(() => {
    refreshProducts()
  }, [section.slug, subsection.slug])

  const handleDelete = (product) => {
    if (!window.confirm('¿Eliminar este producto?')) return
    deleteProduct(product.id)
    refreshProducts()
  }

  return (
    <main className="catalog-page">
      <Breadcrumb items={[['Ropa', '/catalogo'], [section.name, `/catalogo/ropa/${section.slug}`], [subsection.name]]} />
      <section className="catalog-subsection-heading">
        <div>
          <p>{section.name}</p>
          <h1>{subsection.name}</h1>
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
          section={section}
          subsection={subsection}
          editingProduct={editingProduct}
          onCancel={() => {
            setShowForm(false)
            setEditingProduct(null)
          }}
          onSaved={() => {
            setShowForm(false)
            setEditingProduct(null)
            refreshProducts()
          }}
        />
      )}

      {products.length > 0 ? (
        <section className="catalog-product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              adminMode={adminMode}
              onEdit={(item) => {
                setEditingProduct(item)
                setShowForm(true)
                window.setTimeout(() => document.querySelector('.catalog-product-form')?.scrollIntoView({ behavior: 'smooth' }), 50)
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

function ProductPage({ product }) {
  const [imageIndex, setImageIndex] = useState(0)
  const images = product.images || []
  const selectedImage = images[imageIndex]
  const whatsappMessage = `Hola, quisiera mas información acerca de este producto: ${product.name}${product.price ? `\nPrecio: ${formatPrice(product.price)}` : ''}${product.colors?.[0] ? `\nColor: ${product.colors[0]}` : ''}${product.sizes?.length ? `\nTallas disponibles: ${product.sizes.slice(0, 5).join(', ')}` : ''}${product.description ? `\nDetalles: ${product.description}` : ''}`

  return (
    <main className="catalog-page">
      <Breadcrumb items={[['Ropa', '/catalogo'], [product.sectionSlug, `/catalogo/ropa/${product.sectionSlug}`], [product.subsectionSlug, `/catalogo/ropa/${product.sectionSlug}/${product.subsectionSlug}`], [product.name]]} />
      <section className="catalog-detail">
        <div>
          <ImageSlot src={selectedImage} label={product.name} />
          {images.length > 1 && (
            <div className="catalog-detail-thumbs">
              {images.map((image, index) => (
                <button key={`${image}-${index}`} type="button" className={index === imageIndex ? 'is-active' : ''} onClick={() => setImageIndex(index)}>
                  <ImageSlot src={image} label={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
        <article>
          <p>Producto</p>
          <h1>{product.name}</h1>
          <strong>{formatPrice(product.price)}</strong>
          {product.description && <p>{product.description}</p>}
          {product.sizes?.length > 0 && (
            <div className="catalog-pill-list">
              {product.sizes.map((size) => <span key={size}>{size}</span>)}
            </div>
          )}
          {product.colors?.length > 0 && (
            <div className="catalog-pill-list">
              {product.colors.map((color) => <span key={color}>{color}</span>)}
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

export default function Catalog({ route }) {
  const [adminMode, setAdminMode] = useState(false)
  const [, setStoreVersion] = useState(0)

  useEffect(() => {
    setAdminMode(isAdminAuthenticated())
  }, [])

  if (route.pathname === '/admin/login') {
    return <AdminLogin onLogin={() => setAdminMode(true)} />
  }

  const parts = route.pathname.split('/').filter(Boolean)
  const sectionSlug = parts[2]
  const subsectionSlug = parts[3]
  const productId = parts[4]
  const section = catalogSections.find((item) => item.slug === sectionSlug)
  const subsection = section?.subsections.find((item) => item.slug === subsectionSlug)
  const product = productId ? getProductById(productId) : null

  const handleLogout = () => {
    setAdminSession(false)
    setAdminMode(false)
    setStoreVersion((current) => current + 1)
  }

  return (
    <div className="catalog-shell">
      <CatalogHeader adminMode={adminMode} onLogout={handleLogout} />
      {productId && product ? <ProductPage product={product} /> : null}
      {productId && !product ? <main className="catalog-page"><p className="catalog-empty">Producto no encontrado.</p></main> : null}
      {!productId && section && subsection ? <SubsectionPage section={section} subsection={subsection} adminMode={adminMode} /> : null}
      {!productId && section && !subsection ? <SectionPage section={section} /> : null}
      {!productId && !section ? <CatalogHome adminMode={adminMode} productsCount={getStoredProducts().length} /> : null}
    </div>
  )
}
