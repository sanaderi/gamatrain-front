// The curriculum model's admin API (backend docs/business/curriculum.md). Enumerations travel as their names.

export type CurriculumFilterStyle = 'Select' | 'Chips'
export type CurriculumLinkScope = 'Own' | 'OwnAndMaster' | 'All'
export type CurriculumContentTab = 'PastPapers' | 'StudyMaterials' | 'Exams' | 'Tutorials'
export type CurriculumLinkKind = 'Exact' | 'Partial'
export type CurriculumSeoPage
  = | 'PastPaperList' | 'StudyMaterialList' | 'ExamList' | 'TutorialList'
    | 'PastPaper' | 'Exam' | 'Tutorial' | 'StudyMaterial'
    | 'BoardPage' | 'QualificationPage' | 'SyllabusPage'

export interface CurriculumBoardDTO {
  id: number
  legacyId?: number | null
  slug: string
  name: string
  shortName?: string | null
  countryCode?: string | null
  parentBoardId?: number | null
  logo?: string | null
  website?: string | null
  isMaster: boolean
  isDefault: boolean
  isEnabled: boolean
  listOrder: number
  codeTemplate?: string | null
  languageId?: number | null
}

export interface CurriculumBoardFilterDTO {
  key: string
  label: string
  style: CurriculumFilterStyle
  listOrder: number
  isEnabled: boolean
}

export interface CurriculumBoardTabDTO {
  tab: CurriculumContentTab
  scope: CurriculumLinkScope
  isDefault?: boolean
}

export interface CurriculumSeriesTypeDTO {
  id: number
  qualificationId?: number | null
  name: string
  code?: string | null
  fileCode?: string | null
  seoName?: string | null
  months?: string | null
  isSupplementary: boolean
  listOrder: number
}

export interface CurriculumVariantOptionDTO {
  id: number
  legacyId?: number | null
  label: string
  code?: string | null
  listOrder: number
}

export interface CurriculumVariantKindDTO {
  id: number
  key: string
  label: string
  listOrder: number
  options: CurriculumVariantOptionDTO[]
}

export interface CurriculumSeoTemplateDTO {
  id: number
  boardId?: number | null
  page: CurriculumSeoPage | null
  titleTemplate: string
  descriptionTemplate: string
}

export interface CurriculumBoardDetailDTO {
  board: CurriculumBoardDTO
  filters: CurriculumBoardFilterDTO[]
  tabs: CurriculumBoardTabDTO[]
  linkOrder: number[]
  seriesTypes: CurriculumSeriesTypeDTO[]
  variantKinds: CurriculumVariantKindDTO[]
  seoTemplates: CurriculumSeoTemplateDTO[]
}

export interface CurriculumQualificationDTO {
  id: number
  legacyId?: number | null
  boardId: number
  slug: string
  name: string
  shortName?: string | null
  languageId?: number | null
  listOrder: number
}

export interface CurriculumSubjectDTO {
  id: number
  slug: string
  name: string
  picture?: string | null
  listOrder: number
}

export interface CurriculumSyllabusDTO {
  id: number
  legacyId?: number | null
  qualificationId: number
  subjectId?: number | null
  code?: string | null
  slug: string
  name: string
  yearFrom?: number | null
  yearTo?: number | null
  picture?: string | null
  listOrder: number
}

export interface CurriculumPaperDTO {
  id: number
  legacyId?: number | null
  name: string
  shortLabel: string
  tier?: string | null
  listOrder: number
}

export interface CurriculumDocumentTypeDTO {
  id: number
  legacyId?: number | null
  code: string
  name: string
  shortLabel?: string | null
  icon?: string | null
  listOrder: number
}

export interface CurriculumTopicDTO {
  id: number
  legacyId?: number | null
  syllabusId: number
  parentTopicId?: number | null
  name: string
  isUnit: boolean
  listOrder: number
}

export interface CurriculumTopicLinkDTO {
  id: number
  masterTopicId: number
  topicId: number
  kind: CurriculumLinkKind
  masterTopicName?: string | null
  topicName?: string | null
  topicBoardId: number
  topicBoardName?: string | null
  topicSyllabusName?: string | null
  legacyRelationId?: number | null
}

export interface CurriculumPanelFilterDTO {
  key: string
  label: string
  style: CurriculumFilterStyle
  options: { value: string, label: string }[]
}

export interface CurriculumLinkedTopicDTO {
  id: number
  name?: string | null
  legacyId?: number | null
}

/** One group of a linked list; `source` is own, gama or otherBoard. */
export interface CurriculumLinkedGroupDTO {
  source: 'own' | 'gama' | 'otherBoard'
  boardId: number
  boardName?: string | null
  topics: CurriculumLinkedTopicDTO[]
}

export interface CurriculumLinkedTopicsDTO {
  tab: CurriculumContentTab
  scope: CurriculumLinkScope
  groups: CurriculumLinkedGroupDTO[]
  related: CurriculumLinkedTopicDTO[]
}

export interface CurriculumSeoResultDTO {
  title?: string | null
  description?: string | null
  warnings: string[]
}

/** One field of a curriculum item in the admin's forms and lists. */
export interface CurriculumField {
  key: string
  title: string
  type?: 'text' | 'number' | 'switch' | 'select' | 'textarea'
  items?: { title: string, value: unknown }[]
  hint?: string
  required?: boolean
  wide?: boolean
  /** Shown as a column of the item list too (the default). */
  inTable?: boolean
}

/** One column of an editable list in the curriculum admin. */
export interface RowsEditorColumn {
  key: string
  title: string
  type?: 'text' | 'number' | 'switch' | 'select'
  items?: { title: string, value: unknown }[]
  placeholder?: string
  clearable?: boolean
}

export interface CurriculumCheckRowDTO {
  kind: string
  source: number
  copied: number
  missing: number
}

export interface CurriculumCoverageDTO {
  content: string
  total: number
  placed: number
  unplaced: Record<string, number>
}

/** The count check of the copy (phase 2): every list's missing must be 0 before anything switches. */
export interface CurriculumCheckDTO {
  lists: CurriculumCheckRowDTO[]
  content: CurriculumCoverageDTO[]
  issues: number
}

export interface CurriculumCopyIssueDTO {
  id: number
  kind: string
  sourceId?: number | null
  message: string
}
