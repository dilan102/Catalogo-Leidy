export const ADMIN_CREDENTIALS = {
  username: 'Vivis',
  password: 'teamoo',
}

/* Secciones visibles en la pagina principal y en el menu. */
export const mainSections = [
  {
    id: 'ropa',
    name: 'Ropa',
    slug: 'ropa',
    description: 'Moda para toda la familia',
    image: '/Seccion_dama.png',
    kind: 'clothing',
  },
  {
    id: 'pinateria',
    name: 'Piñateria',
    slug: 'pinateria',
    description: 'Fiesta y celebracion',
    image: '/Seccion_piñateria.png',
    kind: 'flat',
  },
  {
    id: 'calzado',
    name: 'Calzado',
    slug: 'calzado',
    description: 'Zapatos para cada estilo',
    image: '/Seccion_calzado.png',
    kind: 'flat',
  },
  {
    id: 'accesorios',
    name: 'Accesorios',
    slug: 'accesorios',
    description: 'Detalles para completar el look',
    image: '/Seccion_accesorios.png',
    kind: 'flat',
  },
]

/* Grupos reales dentro de la seccion Ropa. */
export const clothingSections = [
  {
    id: 'dama',
    name: 'Dama',
    slug: 'dama',
    description: 'Catálogo de dama',
    image: '',
    subsections: [
      'Pantalones',
      'Shorts',
      'Camisas',
      'Chaquetas',
      'Sacos',
      'Blusas',
      'Vestidos',
      'Ropa deportiva',
      'Corsets',
      'Ropa interior',
      'Medias',
      'Zapatos',
      'Conjuntos',
      'Faldas',
      'Pijama',
      'Body',
    ],
  },
  {
    id: 'caballero',
    name: 'Caballero',
    slug: 'caballero',
    description: 'Catálogo de caballero',
    image: '',
    subsections: [
      'Pantalones',
      'Pantalonetas',
      'Camisas',
      'Sacos',
      'Chaquetas',
      'Medias',
      'Zapatos',
      'Ropa interior',
      'Ropa deportiva',
    ],
  },
  {
    id: 'nino',
    name: 'Niño',
    slug: 'nino',
    description: 'Catálogo de niño',
    image: '',
    subsections: [
      'Pantalones',
      'Zapatos',
      'Camisas',
      'Sacos',
      'Chaquetas',
      'Medias',
      'Ropa interior',
      'Conjuntos',
    ],
  },
  {
    id: 'nina',
    name: 'Niña',
    slug: 'nina',
    description: 'Catálogo de niña',
    image: '',
    subsections: [
      'Pantalones',
      'Camisas',
      'Chaquetas',
      'Sacos',
      'Blusas',
      'Zapatos',
      'Vestidos',
      'Ropa interior',
      'Medias',
      'Conjuntos',
    ],
  },
]

/* Secciones planas que no usan subsecciones visibles. */
export const flatSections = [
  {
    id: 'pinateria',
    name: 'Piñateria',
    slug: 'pinateria',
    description: 'Catálogo de piñateria',
    image: '/Seccion_piñateria.png',
    defaultSubsection: {
      id: 'pinateria-general',
      name: 'General',
      slug: 'general',
      description: 'Productos generales de Piñateria',
    },
  },
  {
    id: 'calzado',
    name: 'Calzado',
    slug: 'calzado',
    description: 'Catálogo de calzado',
    image: '/Seccion_calzado.png',
    defaultSubsection: {
      id: 'calzado-general',
      name: 'General',
      slug: 'general',
      description: 'Productos generales de Calzado',
    },
  },
  {
    id: 'accesorios',
    name: 'Accesorios',
    slug: 'accesorios',
    description: 'Catálogo de accesorios',
    image: '/Seccion_accesorios.png',
    defaultSubsection: {
      id: 'accesorios-general',
      name: 'General',
      slug: 'general',
      description: 'Productos generales de Accesorios',
    },
  },
]

export function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const catalogSections = clothingSections.map((section, sectionIndex) => ({
  ...section,
  order: sectionIndex,
  subsections: section.subsections.map((name, subsectionIndex) => ({
    id: `${section.slug}-${slugify(name)}`,
    sectionId: section.id,
    sectionSlug: section.slug,
    name,
    slug: slugify(name),
    description: `${name} de ${section.name}`,
    image: '',
    order: subsectionIndex,
  })),
}))

/* Alias explicito para la entrada principal del catalogo. */
export const catalogHomeSections = mainSections.map((section) => section)

/* Buscadores simples para reutilizar la configuracion de secciones en toda la app. */
export function getMainSectionBySlug(slug) {
  return mainSections.find((section) => section.slug === slug) || null
}

/* Devuelve la seccion plana que no expone subsecciones visibles. */
export function getFlatSectionBySlug(slug) {
  return flatSections.find((section) => section.slug === slug) || null
}

/* Devuelve el grupo de ropa que si tiene subsecciones visibles. */
export function getClothingSectionBySlug(slug) {
  return catalogSections.find((section) => section.slug === slug) || null
}

/* Devuelve la configuracion completa de cualquier seccion principal. */
export function getCatalogSectionBySlug(slug) {
  return getClothingSectionBySlug(slug) || getFlatSectionBySlug(slug) || getMainSectionBySlug(slug)
}

/* Indica si una seccion debe trabajar sin subsecciones visibles. */
export function isFlatCatalogSection(slug) {
  return Boolean(getFlatSectionBySlug(slug))
}

/* Alias pequeno para el subsector oculto de las secciones planas. */
export function getDefaultFlatSubsection(sectionSlug) {
  return getFlatSectionBySlug(sectionSlug)?.defaultSubsection || null
}

export function getAvailableSizes(sectionSlug, subsectionSlug) {
  /* Calzado usa una escala de tallas propia aunque viva como seccion plana. */
  if (sectionSlug === 'calzado') {
    return ['22', '24', '26', '28', '30', '32', '34', '36', '38', '40', '42', '44']
  }

  if (subsectionSlug === 'zapatos') {
    return ['21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43']
  }

  if (sectionSlug === 'nino' || sectionSlug === 'nina') {
    return ['2', '4', '6', '8', '10', '12', '14', '16']
  }

  return ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38']
}

export function createProduct({
  id,
  subsectionId,
  sectionSlug,
  subsectionSlug,
  name,
  description,
  price,
  tag,
  quantityAvailable,
  images,
  sizes,
  colors,
  isActive = true,
  isFeatured = false,
  order = 0,
}) {
  return {
    id: id || `product-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    subsectionId,
    sectionSlug,
    subsectionSlug,
    name: name.trim(),
    description: description.trim() || '',
    price: Number(price) || 0,
    tag: tag?.trim() || '',
    quantityAvailable: Number(quantityAvailable) || 0,
    images,
    sizes,
    colors,
    isActive,
    isFeatured,
    order: Number(order) || 0,
    createdAt: new Date().toISOString(),
  }
}
