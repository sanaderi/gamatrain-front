import type { CurriculumContentTab, CurriculumFilterStyle, CurriculumLinkScope, CurriculumSeoPage } from '@/types'

// Labels for the curriculum admin (backend docs/business/curriculum.md). The values are the backend's names.

export const CURRICULUM_FILTER_KEYS = [
  { value: 'level', title: 'Level (qualification)' },
  { value: 'subject', title: 'Subject (syllabus)' },
  { value: 'year', title: 'Year' },
  { value: 'series', title: 'Session (series)' },
  { value: 'paper', title: 'Paper' },
  { value: 'tier', title: 'Tier' },
  { value: 'language', title: 'Language' },
]

export const CURRICULUM_FILTER_STYLES: { value: CurriculumFilterStyle, title: string }[] = [
  { value: 'Select', title: 'Dropdown' },
  { value: 'Chips', title: 'Chips' },
]

export const CURRICULUM_TABS: { value: CurriculumContentTab, title: string }[] = [
  { value: 'PastPapers', title: 'Past papers' },
  { value: 'StudyMaterials', title: 'Study materials' },
  { value: 'Exams', title: 'Exam Hub' },
  { value: 'Tutorials', title: 'Tutorials (and lesson tree)' },
]

export const CURRICULUM_LINK_SCOPES: { value: CurriculumLinkScope, title: string }[] = [
  { value: 'Own', title: 'Own only' },
  { value: 'OwnAndMaster', title: 'Own → GAMA' },
  { value: 'All', title: 'Own → GAMA → other boards' },
]

export const CURRICULUM_SEO_PAGES: { value: CurriculumSeoPage, title: string }[] = [
  { value: 'PastPaperList', title: 'Search: past papers' },
  { value: 'StudyMaterialList', title: 'Search: study materials' },
  { value: 'ExamList', title: 'Search: Exam Hub' },
  { value: 'TutorialList', title: 'Search: tutorials' },
  { value: 'PastPaper', title: 'Past paper page' },
  { value: 'StudyMaterial', title: 'Study material page' },
  { value: 'Exam', title: 'Exam page' },
  { value: 'Tutorial', title: 'Tutorial page' },
  { value: 'BoardPage', title: 'Board landing page' },
  { value: 'QualificationPage', title: 'Qualification landing page' },
  { value: 'SyllabusPage', title: 'Syllabus landing page' },
]

/** Sample values for the SEO preview, one per placeholder the defaults use. */
export const CURRICULUM_SEO_SAMPLE: Record<string, string> = {
  board: 'Cambridge',
  qualification: 'IGCSE',
  subject: 'Mathematics',
  classification: '',
  series: 'May June',
  year: '2023',
  title: 'Mathematics (0580) Paper 4',
  code: '0580/42/M/J/23',
  syllabusCode: '0580',
  paper: '4',
  paperVariant: '42',
  seriesCode: 'M/J',
  yy: '23',
  files: '',
  kind: 'Past Paper',
  format: 'Free Online Test with Answers',
  facts: '40 questions, 45 min',
  cta: 'Take it free online for your score, rank and the correct answers.',
  qualifications: 'IGCSE, O Level and AS & A Level',
  yearFrom: '2013',
  yearTo: '2025',
  city: 'Lahore',
}

export const CURRICULUM_SEO_WARNINGS: Record<string, string> = {
  missing: 'A value the template needs is missing, so nothing is written.',
  titleLong: 'Title over 60 characters: search results cut it.',
  descriptionLong: 'Description over 160 characters: search results cut it.',
  descriptionShort: 'Description under 70 characters: search engines may write their own.',
}

export const CURRICULUM_LINK_SOURCES: Record<string, string> = {
  own: 'Own',
  gama: 'From GAMA',
  otherBoard: 'Same topic in other boards',
}
