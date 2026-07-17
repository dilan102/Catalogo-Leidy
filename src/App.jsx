import { useEffect, useRef, useState } from 'react'
import ScrollStack, { ScrollStackItem } from './components/ScrollStack'
import Catalog from './Catalog'
import SiteNavbar from './components/SiteNavbar'
import SiteFooter from './components/SiteFooter'
import './App.css'

/* Cambia de ruta sin recargar la pagina y fuerza el re-render del router artesanal. */
function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function App() {
  /* El navbar compartido maneja su propio estado de menu. */
  const [activeService, setActiveService] = useState(null)
  /* Estado local de la ruta para que los pushState se reflejen en pantalla. */
  const [locationState, setLocationState] = useState({
    pathname: window.location.pathname,
    search: window.location.search,
  })
  const serviceAnimationTimeout = useRef(null)

  /* Servicios mostrados en la pantalla principal. */
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
      href: '/catalogo/ropa',
    },
    {
      title: 'Piñateria',
      image: '/Seccion_piñateria.png',
      href: '/catalogo/pinateria',
    },
    {
      title: 'Calzado',
      image: '/Seccion_calzado.png',
      href: '/catalogo/calzado',
    },
    {
      title: 'Accesorios',
      image: '/Seccion_accesorios.png',
      href: '/catalogo/accesorios',
    },
  ]

  useEffect(() => {
    /* Escucha navegacion interna para volver a pintar la vista correcta. */
    const handlePopState = () => {
      setLocationState({
        pathname: window.location.pathname,
        search: window.location.search,
      })
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      if (serviceAnimationTimeout.current) {
        clearTimeout(serviceAnimationTimeout.current)
      }
      window.removeEventListener('popstate', handlePopState)
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

  if (locationState.pathname.startsWith('/catalogo') || locationState.pathname.startsWith('/admin')) {
    return <Catalog route={locationState} />
  }

  return (
    <main className="site-shell">
      {/* Navbar compartido para toda la web. */}
      <SiteNavbar />

      {/* Hero principal */}
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
                  <button
                    type="button"
                    className="style-card style-card-link"
                    key={category.title}
                    onClick={() => navigate(category.href)}
                  >
                    <div className="style-card-image">
                      <img src={category.image} alt={category.title} />
                    </div>
                    <h3>{category.title}</h3>
                  </button>
                ))}
              </div>
            </section>
          </ScrollStackItem>
        </ScrollStack>
      </div>

      {/* Footer compartido para cerrar la pagina principal con la misma estetica del catalogo. */}
      <SiteFooter />
    </main>
  )
}

export default App
