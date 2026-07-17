import { useEffect, useRef, useState } from 'react'
import ScrollStack, { ScrollStackItem } from './components/ScrollStack'
import Catalog from './Catalog'
import './App.css'


function App() {
  const [route, setRoute] = useState({
    pathname: window.location.pathname,
    search: window.location.search,
  })

  // Estado que controla si el menu de pantalla completa esta abierto
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeService, setActiveService] = useState(null)
  const serviceAnimationTimeout = useRef(null)

  // Links temporales del menu; por ahora apuntan a enlaces vacios
  const menuLinks = ['Inicio', 'Catalogo', 'Testimonios', 'Contactanos']
  const services = [
    {
      id: 'destellos',
      title: 'Destellos',
      text: 'No vendemos solo cosas bonitas, tambien de calidad',
      icon: (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M32 8l4.8 14.2L51 27l-14.2 4.8L32 46l-4.8-14.2L13 27l14.2-4.8z" />
          <path d="M50 8l1.8 5.2L57 15l-5.2 1.8L50 22l-1.8-5.2L43 15l5.2-1.8z" />
          <path d="M16 42l2.2 6.2L24 50l-5.8 1.8L16 58l-2.2-6.2L8 50l5.8-1.8z" />
        </svg>
      ),
    },
    {
      id: 'entregas',
      title: 'Entregas',
      text: 'Entrega eficaz y a la puerta de su casa',
      icon: (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M8 22h32v24H8z" />
          <path d="M40 30h10l6 8v8H40z" />
          <path d="M18 50a4 4 0 1 0 0-.1M48 50a4 4 0 1 0 0-.1" />
          <path d="M14 30h15M14 38h10" />
        </svg>
      ),
    },
    {
      id: 'dinero',
      title: 'Dinero',
      text: 'Cuidamos no solo tu imagen, tambien tu bolsillo',
      icon: (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M10 18h44v30H10z" />
          <path d="M18 26c4 0 8-4 8-8M46 26c-4 0-8-4-8-8M18 40c4 0 8 4 8 8M46 40c-4 0-8 4-8 8" />
          <path d="M32 41c5 0 9-4 9-8s-4-8-9-8-9 4-9 8 4 8 9 8z" />
          <path d="M32 27v12M28 31c0-2 2-4 5-4M36 35c0 2-2 4-5 4" />
        </svg>
      ),
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      text: (
        <>
          Si tienes alguna duda contactanos por Whatsapp{' '}
          <a href="https://wa.me/573142773014" target="_blank" rel="noreferrer">
            aqui
          </a>
        </>
      ),
      icon: (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M14 18h36a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H27l-13 8V24a6 6 0 0 1 6-6z" />
          <path d="M24 31h20M24 39h14" />
        </svg>
      ),
    },
  ]
  const howSteps = [
    {
      number: '01',
      title: 'Explora el catálogo',
      text: 'Navega las prendas disponibles',
    },
    {
      number: '02',
      title: 'Añade lo que te gusta',
      text: 'Se guarda en tu carrito, sin compromiso ni pago',
    },
    {
      number: '03',
      title: 'Envía tu selección por WhatsApp',
      text: 'Un clic arma el mensaje con tus productos',
    },
    {
      number: '04',
      title: 'Te confirmamos Disponibilidad y Precio',
      text: 'Analizamos tu pedido y te damos solución a tus preguntas',
    },
  ]
  const styleCategories = [
    {
      title: 'Ropa',
      image: '/Seccion_dama.png',
      href: '/catalogo',
    },
    {
      title: 'Piñateria',
      image: '/Seccion_piñateria.png',
    },
    {
      title: 'Zapateria',
      image: '/Seccion_calzado.png',
    },
    {
      title: 'Accesorios',
      image: '/Seccion_accesorios.png',
    },
  ]

  useEffect(() => {
    const handleRouteChange = () => {
      setRoute({
        pathname: window.location.pathname,
        search: window.location.search,
      })
    }

    window.addEventListener('popstate', handleRouteChange)

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      if (serviceAnimationTimeout.current) {
        clearTimeout(serviceAnimationTimeout.current)
      }
    }
  }, [])

  const animateServiceButton = (serviceId) => {
    if (serviceAnimationTimeout.current) {
      clearTimeout(serviceAnimationTimeout.current)
    }

    setActiveService(serviceId)
    serviceAnimationTimeout.current = setTimeout(() => {
      setActiveService(null)
    }, 700)
  }

  const scrollToStyleSection = (event) => {
    event.preventDefault()
    document.getElementById('encuentra-tu-estilo')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  if (route.pathname.startsWith('/catalogo') || route.pathname === '/admin/login') {
    return <Catalog route={route} />
  }

  return (
    // Contenedor principal de la pagina
    <main className="site-shell">
      {/* Navbar oscuro y compacto sobre el hero */}
      <header className="site-navbar" aria-label="Navegación principal">
        {/* Logo y nombre de la marca */}
        <a className="brand" href="/" aria-label="Leidy Montañez inicio">
          <img className="brand-logo" src="/Logo_leidy.png" alt="" />
          <span className="brand-name">Leidy Montañez</span>
        </a>

        {/* Acciones del navbar: catalogo/carrito y menu */}
        <nav className="navbar-actions" aria-label="Acciones principales">
          {/* Boton/enlace de catalogo con icono de carrito */}
          <a className="cart-link" href="/catalogo" aria-label="Ver catálogo">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path d="M7 9h6l5.4 23.5h18.5l4-15.5H17" />
              <path d="M21 40a2.8 2.8 0 1 0 0-.1M36 40a2.8 2.8 0 1 0 0-.1" />
            </svg>
          </a>

          {/* Boton que abre y cierra el menu de pantalla completa */}
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

      {/* Menu desplegable a pantalla completa */}
      <aside
        id="main-menu"
        className={`fullscreen-menu ${isMenuOpen ? 'is-open' : ''}`}
        aria-hidden={!isMenuOpen}
      >
        {/* Fondo del menu con blur suave */}
        <div className="fullscreen-menu-bg" aria-hidden="true"></div>

        {/* Lista centrada de enlaces temporales */}
        <nav className="fullscreen-menu-nav" aria-label="Menú principal">
          {menuLinks.map((link) => (
            <a key={link} href="#" onClick={() => setIsMenuOpen(false)}>
              {link}
            </a>
          ))}
        </nav>
      </aside>

      {/* Hero principal inspirado en la referencia enviada */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-parallax hero-bg-layer" aria-hidden="true"></div>
        <div className="hero-parallax hero-glow-layer" aria-hidden="true"></div>
        <div className="hero-parallax hero-depth-layer" aria-hidden="true"></div>

        {/* Capa central con el texto y el boton del hero */}
        <div className="hero-copy">
          {/* Titulo principal del hero */}
          <h1 id="hero-title">Hecho para ti, único como tú</h1>

          {/* Subtitulo del hero */}
          <p>Encuentra tu próxima prenda favorita</p>

          {/* Boton principal hacia la seccion de estilos */}
          <a className="shop-button" href="#encuentra-tu-estilo" onClick={scrollToStyleSection}>
            ¿Catalogo?
          </a>
        </div>
      </section>

      {/* Contenido bajo el hero con el fondo principal del body */}
      <div className="body-content">
        <ScrollStack
          className="page-scroll-stack"
          itemDistance={0}
          itemScale={0}
          itemStackDistance={0}
          stackPosition="0%"
          scaleEndPosition="0%"
          baseScale={1}
          rotationAmount={0}
          blurAmount={0}
          useWindowScroll
        >
          <ScrollStackItem itemClassName="page-stack-card services-stack-card">
            {/* Seccion de servicios bajo el hero */}
            <section className="services-section" aria-labelledby="services-title">
              <h2 id="services-title">Servicios</h2>

              <div className="services-grid">
                {services.map((service) => (
                  <article className="service-item" key={service.id}>
                    <button
                      className={`service-button ${activeService === service.id ? 'is-active' : ''}`}
                      type="button"
                      aria-label={service.title}
                      aria-pressed={activeService === service.id}
                      onClick={() => animateServiceButton(service.id)}
                    >
                      {service.icon}
                    </button>

                    <h3>{service.title}</h3>
                    <p>{service.text}</p>
                  </article>
                ))}
              </div>
            </section>
          </ScrollStackItem>

          <ScrollStackItem itemClassName="page-stack-card how-stack-card">
            {/* Paso a paso de compra y entrega */}
            <section className="how-section" aria-labelledby="how-title">
              <h2 id="how-title">Como funciona</h2>

              <div className="how-grid">
                {howSteps.map((step) => (
                  <article className="how-card" key={step.number}>
                    <span className="how-number">{step.number}</span>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </article>
                ))}
              </div>
            </section>
          </ScrollStackItem>

          <ScrollStackItem itemClassName="page-stack-card style-stack-card">
            {/* Seccion de categorias estilo coleccion */}
            <section className="style-section" id="encuentra-tu-estilo" aria-labelledby="style-title">
              <h2 id="style-title">Encuentra tu estilo</h2>
              <p>
                Explora nuestras colecciones y descubre el proximo producto para hacerte sentir especial.
              </p>

              <div className="style-grid">
                {styleCategories.map((category) => (
                  category.href ? (
                    <a className="style-card style-card-link" href={category.href} key={category.title}>
                      <div className="style-card-image">
                        <img src={category.image} alt={category.title} />
                      </div>
                      <h3>{category.title}</h3>
                    </a>
                  ) : (
                    <article className="style-card" key={category.title}>
                      <div className="style-card-image">
                        <img src={category.image} alt={category.title} />
                      </div>
                      <h3>{category.title}</h3>
                    </article>
                  )
                ))}
              </div>
            </section>
          </ScrollStackItem>
        </ScrollStack>
      </div>
    </main>
  )
}

export default App
