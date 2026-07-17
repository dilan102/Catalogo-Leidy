export const ADMIN_CREDENTIALS = {
  username: 'Vivis',
  password: 'teamoo',
}

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

export function getAvailableSizes(sectionSlug, subsectionSlug) {
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
    images,
    sizes,
    colors,
    isActive,
    isFeatured,
    order: Number(order) || 0,
    createdAt: new Date().toISOString(),
  }
}
