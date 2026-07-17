import { useState } from 'react'

/* Navbar compartido para todo el sitio, con el mismo menu y estilo de la home. */
export default function SiteNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  /* Enrutador simple para mantener la app como SPA sin recargar la pagina. */
  const navigate = (path) => {
    window.history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
    setIsMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* Enlaces visibles del menu principal, sincronizados con las paginas reales. */
  const menuLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Ropa', href: '/catalogo/ropa' },
    { label: 'Piñateria', href: '/catalogo/pinateria' },
    { label: 'Calzado', href: '/catalogo/calzado' },
    { label: 'Accesorios', href: '/catalogo/accesorios' },
  ]

  return (
    <>
      {/* Barra superior fija compartida entre home, catalogo y login. */}
      <header className="site-navbar" aria-label="Navegación principal">
        {/* Marca principal del sitio. */}
        <a
          className="brand"
          href="/"
          aria-label="Leidy Montañez inicio"
          onClick={(event) => {
            event.preventDefault()
            navigate('/')
          }}
        >
          <img className="brand-logo" src="/Logo_leidy.png" alt="" />
          <span className="brand-name">Leidy Montañez</span>
        </a>

        {/* Acciones principales del navbar. */}
        <nav className="navbar-actions" aria-label="Acciones principales">
          {/* Acceso al catalogo con el mismo icono de carrito. */}
          <a
            className="cart-link"
            href="/catalogo"
            aria-label="Ver catálogo"
            onClick={(event) => {
              event.preventDefault()
              navigate('/catalogo')
            }}
          >
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path d="M7 9h6l5.4 23.5h18.5l4-15.5H17" />
              <path d="M21 40a2.8 2.8 0 1 0 0-.1M36 40a2.8 2.8 0 1 0 0-.1" />
            </svg>
          </a>

          {/* Boton circular que abre y cierra el menu. */}
          <button
            className={`menu-button ${isMenuOpen ? 'is-open' : ''}`}
            type="button"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
            aria-controls="main-menu"
            onClick={() => setIsMenuOpen((currentState) => !currentState)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
      </header>

      {/* Menu de pantalla completa reutilizado en todo el sitio. */}
      <aside
        id="main-menu"
        className={`fullscreen-menu ${isMenuOpen ? 'is-open' : ''}`}
        aria-hidden={!isMenuOpen}
      >
        {/* Fondo visual del menu. */}
        <div className="fullscreen-menu-bg" aria-hidden="true"></div>

        {/* Lista central de enlaces temporales. */}
        <nav className="fullscreen-menu-nav" aria-label="Menú principal">
          {menuLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => {
                event.preventDefault()
                navigate(link.href)
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </aside>
    </>
  )
}
