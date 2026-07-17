/* Footer compartido para toda la web, inspirado en la composicion oscura de referencia. */
function FooterIcon({ type }) {
  const commonProps = {
    viewBox: '0 0 24 24',
    'aria-hidden': 'true',
  }

  if (type === 'instagram') {
    return (
      <svg {...commonProps}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    )
  }

  if (type === 'facebook') {
    return (
      <svg {...commonProps}>
        <path d="M14.5 8.5H16V5.5h-1.8c-2.2 0-3.7 1.7-3.7 4.1V12H8.2v3h2.3v5.5h3V15h2.6l.4-3H13.5v-2c0-.8.3-1.5 1-1.5z" />
      </svg>
    )
  }

  if (type === 'tiktok') {
    return (
      <svg {...commonProps}>
        <path d="M14.5 4.5v8.2a4.2 4.2 0 1 1-3.7-4.1v2.2a2.1 2.1 0 1 0 1.8 2.1V4.5h1.9c.5 2 1.8 3.7 4 4.3v2.1c-1.7-.3-3.2-1-4-2.2v5.5a4.1 4.1 0 1 1-3.9-4.1v2.2a2.1 2.1 0 1 0 1.9 2.1V4.5z" />
      </svg>
    )
  }

  if (type === 'phone') {
    return (
      <svg {...commonProps}>
        <path d="M7.5 5.5l3.2 3.2c.5.5.6 1.2.2 1.8l-1.1 1.9c1.4 2.8 3.5 4.9 6.3 6.3l1.9-1.1c.6-.3 1.3-.3 1.8.2l3.2 3.2c.6.6.6 1.4.1 2-1.2 1.4-2.7 2.1-4.4 2.1-7.4 0-13.4-6-13.4-13.4 0-1.7.7-3.2 2.1-4.4.6-.5 1.4-.5 2 .1z" />
      </svg>
    )
  }

  if (type === 'mail') {
    return (
      <svg {...commonProps}>
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="M5.5 7.5L12 12l6.5-4.5" />
      </svg>
    )
  }

  if (type === 'location') {
    return (
      <svg {...commonProps}>
        <path d="M12 20s5.5-5.3 5.5-10a5.5 5.5 0 1 0-11 0c0 4.7 5.5 10 5.5 10z" />
        <circle cx="12" cy="10" r="1.9" fill="currentColor" stroke="none" />
      </svg>
    )
  }

  if (type === 'clock') {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="7.5" />
        <path d="M12 8.5V12l2.5 1.8" />
      </svg>
    )
  }

  if (type === 'whatsapp') {
    return (
      <svg {...commonProps}>
        <path d="M12 4.5a7.5 7.5 0 0 0-6.5 11.2L4.7 20l4.5-1.1A7.5 7.5 0 1 0 12 4.5z" />
        <path d="M9.1 8.7c.2-.4.5-.6.9-.6h.7c.3 0 .5.2.6.5l.4 1.2c.1.3 0 .6-.2.8l-.6.6c.5 1 1.4 1.9 2.4 2.4l.6-.6c.2-.2.5-.3.8-.2l1.2.4c.3.1.5.3.5.6v.7c0 .4-.2.7-.6.9-.5.2-1.1.3-1.6.1-2.9-.8-5.3-3.2-6.1-6.1-.2-.5-.1-1.1.1-1.6z" />
      </svg>
    )
  }

  return (
    <svg {...commonProps}>
      <path d="M4 12l4 4 12-12" />
      <path d="M5.5 12c0-3.6 2.9-6.5 6.5-6.5S18.5 8.4 18.5 12 15.6 18.5 12 18.5 5.5 15.6 5.5 12z" />
    </svg>
  )
}

/* Navegacion SPA minima para el footer, igual que el menu superior. */
function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export default function SiteFooter() {
  /* Enlaces visibles en la columna de navegacion. */
  const navigationLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Catálogo', href: '/catalogo' },
    { label: 'Ropa', href: '/catalogo/ropa' },
    { label: 'Piñateria', href: '/catalogo/pinateria' },
    { label: 'Calzado', href: '/catalogo/calzado' },
    { label: 'Accesorios', href: '/catalogo/accesorios' },
  ]

  /* Categorias visibles para mantener el footer cercano a la referencia. */
  const categoryLinks = [
    { label: 'Ropa formal', href: '/catalogo/ropa' },
    { label: 'Calzado', href: '/catalogo/calzado' },
    { label: 'Accesorios', href: '/catalogo/accesorios' },
    { label: 'Piñateria', href: '/catalogo/pinateria' },
  ]

  /* Bloque de ayuda e informacion comercial. */
  const infoLinks = [
    { label: 'Envíos y entregas', href: '/catalogo' },
    { label: 'Cambios y devoluciones', href: '/catalogo' },
    { label: 'Preguntas frecuentes', href: '/catalogo' },
  ]

  return (
    <footer className="site-footer" aria-label="Pie de página">
      {/* Fondo decorativo tomado de la carpeta public/Footer. */}
      <div className="site-footer-bg" aria-hidden="true"></div>

      <div className="site-footer-inner">
        {/* Columna de marca, descripcion y redes. */}
        <section className="site-footer-brand">
          {/* La corona va arriba del nombre y sustituye el logo en el footer. */}
          <img className="site-footer-corona" src="/Footer/Corona.png" alt="" aria-hidden="true" />
          <h2>
            <span>LEIDY</span>
            <span>MONTAÑEZ</span>
          </h2>
          <p>ELEGANCIA EN CADA DETALLE</p>
          <p>
            Descubre una selección pensada para acompañarte con estilo, presencia y detalles que
            hacen la diferencia.
          </p>

          <div className="site-footer-socials" aria-label="Redes sociales">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <FooterIcon type="instagram" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <FooterIcon type="facebook" />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok">
              <FooterIcon type="tiktok" />
            </a>
            <a href="https://wa.me/573142773014" target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <FooterIcon type="whatsapp" />
            </a>
          </div>
        </section>

        {/* Columnas de enlaces, replicando la lectura vertical de la referencia. */}
        <section className="site-footer-columns" aria-label="Enlaces del pie de página">
          <div className="site-footer-column">
            <h3>Navegación</h3>
            <ul>
              {navigationLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(event) => {
                      event.preventDefault()
                      navigate(link.href)
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer-column">
            <h3>Categorías</h3>
            <ul>
              {categoryLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(event) => {
                      event.preventDefault()
                      navigate(link.href)
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer-column">
            <h3>Información</h3>
            <ul>
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(event) => {
                      event.preventDefault()
                      navigate(link.href)
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer-column site-footer-contact">
            <h3>Contáctanos</h3>
            <ul>
              <li>
                <span className="site-footer-icon-label">
                  <FooterIcon type="phone" />
                  +57 314 277 3014
                </span>
              </li>
              <li>
                <span className="site-footer-icon-label">
                  <FooterIcon type="mail" />
                  <a href="mailto:hola@leidymontanez.com">hola@leidymontanez.com</a>
                </span>
              </li>
              <li>
                <span className="site-footer-icon-label">
                  <FooterIcon type="location" />
                  Colombia
                </span>
              </li>
              <li>
                <span className="site-footer-icon-label">
                  <FooterIcon type="clock" />
                  <span className="site-footer-hours">Lun - Vie: 9:00 AM - 6:00 PM</span>
                </span>
                <span className="site-footer-hours">Sáb: 9:00 AM - 2:00 PM</span>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <div className="site-footer-divider" aria-hidden="true">
        <img src="/Footer/Linea_inferior.png" alt="" />
      </div>

      <p className="site-footer-copy">© 2026 Leidy Montañez. Todos los derechos reservados.</p>
    </footer>
  )
}
