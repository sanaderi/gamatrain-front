import type { CurriculumField } from '@/types'

// The fields of each curriculum item in the admin's forms and lists. Slugs go into the public URLs
// (/boards/cambridge/igcse/0580): lower case, digits and dashes.

const SLUG_HINT = 'In the address: lower case, digits and dashes (cambridge, igcse, 0580-mathematics).'

export const CURRICULUM_BOARD_FIELDS: CurriculumField[] = [
  { key: 'name', title: 'Name', required: true },
  { key: 'slug', title: 'Slug', required: true, hint: SLUG_HINT },
  { key: 'shortName', title: 'Short name', hint: 'In the filter panel\'s logo box (CIE, IB).' },
  { key: 'countryCode', title: 'Country', hint: 'Two letters (TZ, PK); empty for an international board.' },
  { key: 'logo', title: 'Logo', inTable: false },
  { key: 'website', title: 'Website', inTable: false },
  { key: 'codeTemplate', title: 'Paper code template', inTable: false, hint: 'e.g. {syllabusCode}/{paperVariant}/{seriesCode}/{yy} → 0580/42/M/J/23' },
  { key: 'isEnabled', title: 'Shown to visitors', type: 'switch' },
  { key: 'isMaster', title: 'GAMA (master board)', type: 'switch', inTable: false, hint: 'The board every other board\'s topics link to. Only one.' },
  { key: 'isDefault', title: 'Default board', type: 'switch', inTable: false, hint: 'Chosen when a visitor has chosen none. Only one.' },
]

export const CURRICULUM_QUALIFICATION_FIELDS: CurriculumField[] = [
  { key: 'name', title: 'Name', required: true, hint: 'IGCSE, CSEE (Form 4), Class 12…' },
  { key: 'slug', title: 'Slug', required: true, hint: SLUG_HINT },
  { key: 'shortName', title: 'Short name' },
]

export const CURRICULUM_SUBJECT_FIELDS: CurriculumField[] = [
  { key: 'name', title: 'Name', required: true, hint: 'The same for every board: Mathematics, Physics…' },
  { key: 'slug', title: 'Slug', required: true, hint: SLUG_HINT },
  { key: 'picture', title: 'Picture', inTable: false },
]

export const CURRICULUM_DOCUMENT_TYPE_FIELDS: CurriculumField[] = [
  { key: 'name', title: 'Name', required: true, hint: 'Question paper, Mark scheme, Insert…' },
  { key: 'code', title: 'Code', required: true, hint: 'In file names: qp, ms, in, sf.' },
  { key: 'shortLabel', title: 'Short label', hint: 'QP, MS, IN…' },
  { key: 'icon', title: 'Icon', inTable: false, hint: 'A full icon name (md:description).' },
]

export const curriculumSyllabusFields = (subjects: { title: string, value: unknown }[]): CurriculumField[] => [
  { key: 'name', title: 'Name', required: true, hint: 'Mathematics, Physics…' },
  { key: 'code', title: 'Code', hint: 'The board\'s code: 0580, 031, WMA11.' },
  { key: 'slug', title: 'Slug', required: true, hint: SLUG_HINT },
  { key: 'subjectId', title: 'Subject across boards', type: 'select', items: subjects, inTable: false },
  { key: 'yearFrom', title: 'First exam year', type: 'number', inTable: false },
  { key: 'yearTo', title: 'Last exam year', type: 'number', inTable: false },
]

export const curriculumTopicFields = (units: { title: string, value: unknown }[]): CurriculumField[] => [
  { key: 'name', title: 'Name', required: true, wide: true },
  { key: 'parentTopicId', title: 'Unit', type: 'select', items: units, hint: 'Empty for a unit; a chapter is in a unit.' },
  { key: 'isUnit', title: 'Heads a section', type: 'switch', inTable: false },
]
