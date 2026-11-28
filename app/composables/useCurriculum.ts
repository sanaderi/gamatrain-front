import type {
  ApiResult,
  CurriculumAnswer,
  CurriculumPublicFilterDTO,
  CurriculumPublicItemDTO,
  CurriculumSeoPage,
  CurriculumSeoResultDTO,
} from '@/types'

const BASE = '/api/v2/curriculum'

/**
 * Reads the curriculum model. The backend's `Migration:Routes:Curriculum.Website` is the one switch: an answer is used
 * only when it says `native`, and null otherwise (or on any error), so the caller keeps today's code as the fallback.
 */
// While the switch is off, the answer says so: remembered for a few minutes, so lists don't ask twice each time.
const OFF_FOR_MS = 5 * 60 * 1000
let offUntil = 0

export const curriculumGet = async <T>(path: string, query?: Record<string, string | number | boolean | undefined | null>): Promise<T | null> => {
  if (Date.now() < offUntil) return null
  try {
    const params = Object.fromEntries(Object.entries(query ?? {}).filter(([, value]) => value !== undefined && value !== null && value !== ''))
    const response = await useApiService.get<ApiResult<CurriculumAnswer<T>>>(`${BASE}/${path}`, params as Record<string, string>, { public: true, credentials: 'omit' })
    if (response?.succeeded && response.data && !response.data.native) offUntil = Date.now() + OFF_FOR_MS
    return response?.succeeded && response.data?.native ? response.data.data : null
  }
  catch {
    return null
  }
}

/** The search's page kind per service, for its SEO texts. */
export const CURRICULUM_LIST_PAGES: Record<string, CurriculumSeoPage> = {
  'paper': 'PastPaperList',
  'study-materials': 'StudyMaterialList',
  'quizhub': 'ExamList',
  'tutorial': 'TutorialList',
}

/** The chosen board's filter panel (options and counts) for the search, or null to keep the website's own lists. */
export const useCurriculumPanel = () => {
  const route = useRoute()
  const key = computed(() => {
    const { section, base, lesson, type } = route.query
    return section ? `curriculum-panel-${section}-${base ?? ''}-${lesson ?? ''}-${type ?? ''}` : ''
  })
  const request = useAsyncData(
    () => key.value || 'curriculum-panel-none',
    () => key.value
      ? curriculumGet<CurriculumPublicFilterDTO[]>('filters', {
          section: String(route.query.section),
          base: route.query.base ? String(route.query.base) : undefined,
          lesson: route.query.lesson ? String(route.query.lesson) : undefined,
          isPaper: route.query.type !== 'study-materials',
        })
      : Promise.resolve(null),
    { watch: [key], default: () => null },
  )

  const filter = (prefix: string) => request.data.value?.find(t => t.key === prefix || t.key.startsWith(`${prefix}.`)) ?? null
  return { panel: request.data, filter, ready: request }
}

/** A page's SEO title and description from the backend's templates, or null to keep the page's own. Await `ready` in the
 * page's setup so the texts are in the server-rendered HTML. */
export const useCurriculumSeo = (source: () => { page: CurriculumSeoPage, section?: string | number | null, values: Record<string, string | null | undefined> } | null) => {
  const params = computed(source)
  const key = computed(() => (params.value ? `curriculum-seo-${JSON.stringify(params.value)}` : ''))
  const request = useAsyncData(
    () => key.value || 'curriculum-seo-none',
    () => params.value
      ? curriculumGet<CurriculumSeoResultDTO>('seo', { page: params.value.page, section: params.value.section ?? undefined, ...params.value.values })
      : Promise.resolve(null),
    { watch: [key], default: () => null },
  )
  return { seo: computed(() => (request.data.value?.title ? request.data.value : null)), ready: request }
}

/** A past paper's SEO texts worked out by the backend from the model. */
export const useCurriculumPaperSeo = (paperId: () => string | number | undefined) => {
  const id = computed(paperId)
  const request = useAsyncData(
    () => `curriculum-paper-seo-${id.value ?? 'none'}`,
    () => (id.value ? curriculumGet<CurriculumSeoResultDTO>(`seo/paper/${id.value}`) : Promise.resolve(null)),
    { watch: [id], default: () => null },
  )
  return { seo: computed(() => (request.data.value?.title ? request.data.value : null)), ready: request }
}

/** What a list item's `link_source` means, for its label. */
export const CURRICULUM_LINK_LABELS: Record<string, string> = {
  gama: 'From GAMA',
  otherBoard: 'Same topic, other board',
}

/**
 * A form's list by today's ids (base: a board's levels, lesson: a level's subjects, topic: a subject's topics) from the
 * curriculum model, in the shape of `search/types`, or null to keep reading `search/types`. The ids are the lookup ids,
 * so a form saves the same values as before.
 */
export const curriculumTypeList = async (type: 'base' | 'lesson' | 'topic', parent: string | number | null | undefined) => {
  if (!parent) return null
  const items = await curriculumGet<CurriculumPublicItemDTO[]>('types', { type, parent: String(parent) })
  return items?.map(t => ({
    id: String(t.legacyId),
    title: t.code ? `${t.name} (${t.code})` : t.name ?? '',
    ...(type === 'topic' ? { season: t.isUnit, parent: String(parent) } : {}),
  })) ?? null
}

// Today's search/types parent parameter of each list the model answers.
const TYPE_PARENTS: Record<string, string> = { base: 'section_id', lesson: 'base_id', topic: 'lesson_id' }

/**
 * `search/types` for a board's levels, a level's subjects or a subject's topics, answered from the curriculum model when
 * its switch is on (same ids, same shape), else null. Every list on the site loads through it, so they all switch at once.
 */
export const curriculumSearchTypes = async (request: string, params?: Record<string, unknown>) => {
  if (!request.startsWith('/api/v2/search/types')) return null
  const query = { ...Object.fromEntries(new URLSearchParams(request.split('?')[1] ?? '')), ...params } as Record<string, unknown>
  const type = String(query.type ?? '')
  const parentKey = TYPE_PARENTS[type]
  if (!parentKey || !query[parentKey]) return null
  const items = await curriculumTypeList(type as 'base' | 'lesson' | 'topic', String(query[parentKey]))
  return items ? { succeeded: true, status: 200, data: items } : null
}
