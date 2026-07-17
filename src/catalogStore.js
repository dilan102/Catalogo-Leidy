import { createClient } from './lib/supabase/client.js'
import { catalogSections, createProduct } from './catalogData'

const SESSION_KEY = 'leidy_catalog_admin_session_v1'
const IMAGE_BUCKET = 'product-images'

function hasSupabaseConfig() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
}

function getSupabase() {
  if (!hasSupabaseConfig()) {
    throw new Error('Falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY.')
  }

  return createClient()
}

function normalizeProduct(product, fallback = {}) {
  const sectionSlug = product.subsection?.section?.slug || fallback.sectionSlug || product.sectionSlug || ''
  const subsectionSlug = product.subsection?.slug || fallback.subsectionSlug || product.subsectionSlug || ''

  return {
    id: product.id,
    subsectionId: product.subsection_id || product.subsectionId,
    sectionSlug,
    subsectionSlug,
    name: product.name || '',
    description: product.description || '',
    price: product.price || 0,
    images: product.images || [],
    sizes: product.sizes || [],
    colors: product.colors || [],
    isActive: product.is_active ?? product.isActive ?? true,
    isFeatured: product.is_featured ?? product.isFeatured ?? false,
    order: product.order || 0,
    createdAt: product.created_at || product.createdAt,
  }
}

async function getSubsectionRecord(sectionSlug, subsectionSlug) {
  const supabase = getSupabase()

  const { data: section, error: sectionError } = await supabase
    .from('sections')
    .select('id, slug')
    .eq('slug', sectionSlug)
    .single()

  if (sectionError || !section) {
    throw new Error(`No existe la sección "${sectionSlug}" en Supabase.`)
  }

  const { data: subsection, error: subsectionError } = await supabase
    .from('subsections')
    .select('id, slug, section_id')
    .eq('section_id', section.id)
    .eq('slug', subsectionSlug)
    .single()

  if (subsectionError || !subsection) {
    throw new Error(`No existe la subsección "${subsectionSlug}" en Supabase.`)
  }

  return subsection
}

let catalogStructurePromise = null

export async function ensureCatalogStructure() {
  if (catalogStructurePromise) {
    return catalogStructurePromise
  }

  catalogStructurePromise = (async () => {
    const supabase = getSupabase()

    for (const section of catalogSections) {
      let { data: dbSection, error: sectionError } = await supabase
        .from('sections')
        .select('id')
        .eq('slug', section.slug)
        .maybeSingle()

      if (sectionError) {
        throw new Error(`No se pudo revisar la sección "${section.name}": ${sectionError.message}`)
      }

      if (!dbSection) {
        const { data: insertedSection, error: insertSectionError } = await supabase
          .from('sections')
          .insert({
            name: section.name,
            slug: section.slug,
            description: section.description,
            image_url: section.image || null,
            order: section.order,
            is_active: true,
          })
          .select('id')
          .single()

        if (insertSectionError) {
          throw new Error(`No se pudo crear la sección "${section.name}": ${insertSectionError.message}`)
        }

        dbSection = insertedSection
      }

      for (const subsection of section.subsections) {
        const { data: dbSubsection, error: subsectionError } = await supabase
          .from('subsections')
          .select('id')
          .eq('section_id', dbSection.id)
          .eq('slug', subsection.slug)
          .maybeSingle()

        if (subsectionError) {
          throw new Error(`No se pudo revisar la subsección "${subsection.name}": ${subsectionError.message}`)
        }

        if (!dbSubsection) {
          const { error: insertSubsectionError } = await supabase
            .from('subsections')
            .insert({
              section_id: dbSection.id,
              name: subsection.name,
              slug: subsection.slug,
              description: subsection.description,
              image_url: subsection.image || null,
              order: subsection.order,
              is_active: true,
            })

          if (insertSubsectionError) {
            throw new Error(`No se pudo crear la subsección "${subsection.name}": ${insertSubsectionError.message}`)
          }
        }
      }
    }
  })()

  try {
    await catalogStructurePromise
  } catch (error) {
    catalogStructurePromise = null
    throw error
  }
}

export async function getStoredProducts() {
  if (!hasSupabaseConfig()) {
    return []
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('products')
    .select('*, subsection:subsections(slug, section:sections(slug))')
    .eq('is_active', true)
    .order('order')

  if (error) {
    throw new Error(`No se pudieron cargar productos: ${error.message}`)
  }

  return (data || []).map((product) => normalizeProduct(product))
}

export async function saveProduct(productInput) {
  const product = createProduct(productInput)
  const subsection = await getSubsectionRecord(product.sectionSlug, product.subsectionSlug)
  const supabase = getSupabase()

  const payload = {
    subsection_id: subsection.id,
    name: product.name,
    description: product.description || null,
    price: product.price || null,
    images: product.images || [],
    sizes: product.sizes || [],
    colors: product.colors || [],
    is_active: product.isActive,
    is_featured: product.isFeatured,
    order: product.order,
  }

  if (productInput.id) {
    payload.id = productInput.id
  }

  const { data, error } = await supabase
    .from('products')
    .upsert(payload)
    .select('*, subsection:subsections(slug, section:sections(slug))')
    .single()

  if (error) {
    throw new Error(`No se pudo guardar el producto: ${error.message}`)
  }

  return normalizeProduct(data, product)
}

export async function deleteProduct(productId) {
  const supabase = getSupabase()
  const { error } = await supabase.from('products').delete().eq('id', productId)

  if (error) {
    throw new Error(`No se pudo eliminar el producto: ${error.message}`)
  }
}

export async function getProductsBySubsection(sectionSlug, subsectionSlug) {
  const subsection = await getSubsectionRecord(sectionSlug, subsectionSlug)
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('subsection_id', subsection.id)
    .eq('is_active', true)
    .order('order')

  if (error) {
    throw new Error(`No se pudieron cargar productos: ${error.message}`)
  }

  return (data || []).map((product) => normalizeProduct(product, { sectionSlug, subsectionSlug }))
}

export async function getProductById(productId) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('products')
    .select('*, subsection:subsections(slug, section:sections(slug))')
    .eq('id', productId)
    .single()

  if (error || !data) {
    return null
  }

  return normalizeProduct(data)
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

function sanitizeFileName(value) {
  return value
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-_.]/g, '')
    .toLowerCase()
}

export async function uploadProductImages(files, sectionSlug) {
  const supabase = getSupabase()

  return Promise.all(
    files.map(async (file) => {
      const filePath = `${sectionSlug}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`
      const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(filePath, file, {
        cacheControl: '31536000',
        upsert: false,
      })

      if (error) {
        throw new Error(`No se pudo subir "${file.name}": ${error.message}`)
      }

      const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(filePath)
      return data.publicUrl
    }),
  )
}
