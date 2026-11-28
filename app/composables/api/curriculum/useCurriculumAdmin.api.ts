import type {
  ApiResult,
  CurriculumBoardDTO,
  CurriculumBoardDetailDTO,
  CurriculumBoardFilterDTO,
  CurriculumBoardTabDTO,
  CurriculumCheckDTO,
  CurriculumContentTab,
  CurriculumCopyIssueDTO,
  CurriculumDocumentTypeDTO,
  CurriculumLinkKind,
  CurriculumLinkedTopicsDTO,
  CurriculumPanelFilterDTO,
  CurriculumPaperDTO,
  CurriculumQualificationDTO,
  CurriculumSeoPage,
  CurriculumSeoResultDTO,
  CurriculumSeoTemplateDTO,
  CurriculumSeriesTypeDTO,
  CurriculumSubjectDTO,
  CurriculumSyllabusDTO,
  CurriculumTopicDTO,
  CurriculumTopicLinkDTO,
  CurriculumVariantKindDTO,
} from '@/types'

const BASE = '/api/v2/admin/curriculum'

type Body = Record<string, unknown>

/**
 * The curriculum model's admin API: boards and their profile, levels, subjects, syllabi, papers, topics and links, SEO
 * templates, and the previews. Copied rows are refused ("notNative") until the curriculum's writes switch; the
 * backend's message is shown as for every admin call.
 */
export const useCurriculumAdmin = () => {
  const { $toast } = useNuxtApp()
  const { handleApiResponseError, handleApiCatchError } = useApiErrorHandler()
  const busy = ref(false)

  const call = async <T>(request: () => Promise<ApiResult<T>>, success?: string): Promise<T | null> => {
    busy.value = true
    try {
      const response = await request()
      if (!response.succeeded) {
        handleApiResponseError(response)
        return null
      }

      if (success) $toast.success(success)
      return (response.data ?? true) as T
    }
    catch (err: unknown) {
      handleApiCatchError(err)
      return null
    }
    finally {
      busy.value = false
    }
  }

  const get = <T>(path: string, query?: Record<string, string | number>) => call(() => useApiService.get<ApiResult<T>>(`${BASE}/${path}`, query))
  // A new item (id 0) is posted, an existing one put; both answer the id.
  const save = (path: string, item: { id: number }, success = 'Saved.') => call(() => item.id
    ? useApiService.put<ApiResult<number>>(`${BASE}/${path}/${item.id}`, item as unknown as Body)
    : useApiService.post<ApiResult<number>>(`${BASE}/${path}`, item as unknown as Body), success)
  const put = (path: string, body: unknown, success = 'Saved.') => call(() => useApiService.put<ApiResult<boolean>>(`${BASE}/${path}`, body as Body), success)
  const remove = (path: string, id: number) => call(() => useApiService.remove<ApiResult<boolean>>(`${BASE}/${path}/${id}`), 'Removed.')

  return {
    busy,
    getBoards: () => get<CurriculumBoardDTO[]>('boards'),
    getBoard: (id: number) => get<CurriculumBoardDetailDTO>(`boards/${id}`),
    saveBoard: (board: CurriculumBoardDTO) => save('boards', board),
    deleteBoard: (id: number) => remove('boards', id),
    saveFilters: (boardId: number, filters: CurriculumBoardFilterDTO[]) => put(`boards/${boardId}/filters`, filters),
    saveLinks: (boardId: number, tabs: CurriculumBoardTabDTO[], linkOrder: number[]) => put(`boards/${boardId}/links`, { tabs, linkOrder }),
    saveSeriesTypes: (boardId: number, items: CurriculumSeriesTypeDTO[]) => put(`boards/${boardId}/series-types`, items),
    saveVariantKinds: (boardId: number, items: CurriculumVariantKindDTO[]) => put(`boards/${boardId}/variant-kinds`, items),
    getPanel: (boardId: number, qualificationId?: number, syllabusId?: number) => get<CurriculumPanelFilterDTO[]>(`boards/${boardId}/panel`, {
      ...(qualificationId ? { qualificationId } : {}),
      ...(syllabusId ? { syllabusId } : {}),
    }),
    getLinkedTopics: (boardId: number, topicId: number, tab: CurriculumContentTab) =>
      get<CurriculumLinkedTopicsDTO>(`boards/${boardId}/linked-topics/${topicId}`, { tab }),

    getQualifications: (boardId: number) => get<CurriculumQualificationDTO[]>(`boards/${boardId}/qualifications`),
    saveQualification: (item: CurriculumQualificationDTO) => save('qualifications', item),
    deleteQualification: (id: number) => remove('qualifications', id),
    getSubjects: () => get<CurriculumSubjectDTO[]>('subjects'),
    saveSubject: (item: CurriculumSubjectDTO) => save('subjects', item),
    deleteSubject: (id: number) => remove('subjects', id),
    getSyllabi: (qualificationId: number) => get<CurriculumSyllabusDTO[]>(`qualifications/${qualificationId}/syllabi`),
    saveSyllabus: (item: CurriculumSyllabusDTO) => save('syllabi', item),
    deleteSyllabus: (id: number) => remove('syllabi', id),
    getPapers: (syllabusId: number) => get<CurriculumPaperDTO[]>(`syllabi/${syllabusId}/papers`),
    savePapers: (syllabusId: number, items: CurriculumPaperDTO[]) => put(`syllabi/${syllabusId}/papers`, items),
    getDocumentTypes: () => get<CurriculumDocumentTypeDTO[]>('document-types'),
    saveDocumentType: (item: CurriculumDocumentTypeDTO) => save('document-types', item),
    deleteDocumentType: (id: number) => remove('document-types', id),

    getTopics: (syllabusId: number) => get<CurriculumTopicDTO[]>(`syllabi/${syllabusId}/topics`),
    saveTopic: (item: CurriculumTopicDTO) => save('topics', item),
    deleteTopic: (id: number) => remove('topics', id),
    getTopicLinks: (topicId: number) => get<CurriculumTopicLinkDTO[]>(`topics/${topicId}/links`),
    addTopicLink: (masterTopicId: number, topicId: number, kind: CurriculumLinkKind) =>
      call(() => useApiService.post<ApiResult<number>>(`${BASE}/topic-links`, { masterTopicId, topicId, kind }), 'Topics linked.'),
    deleteTopicLink: (id: number) => remove('topic-links', id),

    getSeoTemplates: (boardId?: number) => get<CurriculumSeoTemplateDTO[]>('seo-templates', boardId ? { boardId } : undefined),
    saveSeoTemplate: (item: CurriculumSeoTemplateDTO) => save('seo-templates', item),
    deleteSeoTemplate: (id: number) => remove('seo-templates', id),
    startCopy: () => call(() => useApiService.post<ApiResult<boolean>>(`${BASE}/copy`, {}), 'The copy started; check again in a minute.'),
    checkCopy: () => get<CurriculumCheckDTO>('copy/check'),
    getCopyIssues: (kind?: string) => get<CurriculumCopyIssueDTO[]>('copy/issues', kind ? { kind } : undefined),
    previewSeo: (page: CurriculumSeoPage, values: Record<string, string>, boardId?: number) => call(() => useApiService.post<ApiResult<CurriculumSeoResultDTO>>(
      `${BASE}/seo-preview?page=${page}${boardId ? `&boardId=${boardId}` : ''}`, values)),
  }
}
