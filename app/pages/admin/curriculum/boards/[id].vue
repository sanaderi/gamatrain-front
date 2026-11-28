<template>
  <div class="w-100 h-100 d-flex flex-column align-start justify-start">
    <div class="w-100 d-flex align-center ga-2 mb-2">
      <v-btn
        icon="md:arrow_back"
        variant="text"
        to="/admin/curriculum"
      />
      <div class="text-h6">
        {{ detail?.board.name ?? 'Board' }}
      </div>
      <v-chip
        v-if="detail?.board.legacyId"
        size="small"
        label
      >
        copied {{ detail.board.legacyId }}
      </v-chip>
      <v-chip
        v-if="detail"
        size="small"
        label
        :color="detail.board.isEnabled ? 'success' : undefined"
      >
        {{ detail.board.isEnabled ? 'Shown' : 'Hidden' }}
      </v-chip>
    </div>

    <v-tabs
      v-model="tab"
      color="primary"
      show-arrows
      class="mb-4"
    >
      <v-tab value="board">
        Board
      </v-tab>
      <v-tab value="levels">
        Levels &amp; subjects
      </v-tab>
      <v-tab value="filters">
        Filters
      </v-tab>
      <v-tab value="sessions">
        Sessions
      </v-tab>
      <v-tab value="variants">
        Variants
      </v-tab>
      <v-tab value="links">
        Topic links
      </v-tab>
      <v-tab value="seo">
        SEO
      </v-tab>
    </v-tabs>

    <v-window
      v-if="detail"
      v-model="tab"
      class="w-100"
    >
      <v-window-item value="board">
        <admin-curriculum-fields-form
          v-model="board"
          :fields="boardFields"
          :disabled="!canEdit"
        />
        <admin-curriculum-save-row
          :busy="busy"
          :disabled="!canEdit"
          @save="saveBoardForm"
        />
      </v-window-item>

      <v-window-item value="levels">
        <v-row>
          <v-col
            cols="12"
            md="5"
          >
            <admin-curriculum-items-table
              title="Levels (qualifications)"
              noun="level"
              :items="qualifications"
              :fields="CURRICULUM_QUALIFICATION_FIELDS"
              :new-item="() => ({ id: 0, boardId, slug: '', name: '', listOrder: qualifications.length })"
              :save="saveQualification"
              :remove="deleteQualification"
              :selected-id="qualificationId"
              :readonly="!canEdit"
              @select="selectQualification($event.id)"
              @changed="loadQualifications"
            />
          </v-col>
          <v-col
            cols="12"
            md="7"
          >
            <admin-curriculum-items-table
              v-if="qualificationId"
              title="Subjects of this level (syllabi)"
              noun="syllabus"
              :items="syllabi"
              :fields="syllabusFields"
              :new-item="() => ({ id: 0, qualificationId: qualificationId!, slug: '', name: '', listOrder: syllabi.length })"
              :save="saveSyllabus"
              :remove="deleteSyllabus"
              :open="openSyllabus"
              :readonly="!canEdit"
              @changed="loadSyllabi"
            />
            <div
              v-else
              class="text-grey600 pt-12 text-center"
            >
              Choose a level to see its subjects.
            </div>
          </v-col>
        </v-row>
      </v-window-item>

      <v-window-item value="filters">
        <v-row>
          <v-col
            cols="12"
            md="8"
          >
            <div class="text-body-2 text-grey600 mb-2">
              Which filters this board uses, named the way its students know them, in this order.
            </div>
            <admin-curriculum-rows-editor
              v-model="filters"
              :columns="filterColumns"
              :new-row="() => ({ key: '', label: '', style: 'Select', listOrder: filters.length, isEnabled: true })"
              :readonly="!canEdit"
            />
            <admin-curriculum-save-row
              :busy="busy"
              :disabled="!canEdit"
              @save="saveFilterRows"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            class="d-flex flex-column ga-2"
          >
            <v-select
              v-model="previewQualificationId"
              :items="qualificationItems"
              item-title="title"
              item-value="value"
              label="Preview with level"
              density="compact"
              variant="outlined"
              hide-details
              clearable
              @update:model-value="previewSyllabusId = null; loadPreviewSyllabi()"
            />
            <v-select
              v-model="previewSyllabusId"
              :items="previewSyllabi"
              item-title="title"
              item-value="value"
              label="Preview with subject"
              density="compact"
              variant="outlined"
              hide-details
              clearable
              :disabled="!previewQualificationId"
              @update:model-value="loadPanel"
            />
            <admin-curriculum-panel-preview :filters="panel" />
          </v-col>
        </v-row>
      </v-window-item>

      <v-window-item value="sessions">
        <div class="text-body-2 text-grey600 mb-2">
          When this board's exams are sat. Code goes into the paper code (M/J), the file letter into file names (s),
          months are what today's papers are matched by (5,6).
        </div>
        <admin-curriculum-rows-editor
          v-model="seriesTypes"
          :columns="seriesColumns"
          :new-row="() => ({ id: 0, name: '', isSupplementary: false, listOrder: seriesTypes.length })"
          :readonly="!canEdit"
        />
        <admin-curriculum-save-row
          :busy="busy"
          :disabled="!canEdit"
          @save="saveSeries"
        />
      </v-window-item>

      <v-window-item value="variants">
        <div class="text-body-2 text-grey600 mb-2">
          How this board's papers vary within one session: zone, time zone, set, group. A board with none shows no
          variant filter.
        </div>
        <v-card
          v-for="(kind, index) in variantKinds"
          :key="kind.id || `new-${index}`"
          rounded="lg"
          border
          flat
          class="mb-3"
        >
          <v-card-text>
            <v-row dense>
              <v-col
                cols="12"
                md="4"
              >
                <v-text-field
                  v-model="kind.key"
                  label="Key"
                  hint="zone, tz, set (its filter is variant.key)"
                  persistent-hint
                  density="compact"
                  variant="outlined"
                  :disabled="!canEdit"
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="kind.label"
                  label="Label"
                  density="compact"
                  variant="outlined"
                  :disabled="!canEdit"
                />
              </v-col>
              <v-col
                cols="12"
                md="2"
                class="text-end"
              >
                <v-btn
                  v-if="canEdit"
                  icon="md:delete"
                  variant="text"
                  color="error"
                  @click="variantKinds.splice(index, 1)"
                />
              </v-col>
            </v-row>
            <admin-curriculum-rows-editor
              v-model="kind.options"
              :columns="variantOptionColumns"
              :new-row="() => ({ id: 0, label: '', listOrder: kind.options.length })"
              :readonly="!canEdit"
            />
          </v-card-text>
        </v-card>
        <div class="d-flex ga-2">
          <v-btn
            v-if="canEdit"
            rounded="pill"
            variant="outlined"
            color="primary"
            prepend-icon="md:add"
            @click="variantKinds.push({ id: 0, key: '', label: '', listOrder: variantKinds.length, options: [] })"
          >
            Add a variant kind
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            variant="flat"
            rounded="pill"
            :loading="busy"
            :disabled="!canEdit"
            @click="saveVariants"
          >
            Save
          </v-btn>
        </div>
      </v-window-item>

      <v-window-item value="links">
        <div class="text-body-2 text-grey600 mb-4">
          How far each tab follows topic links: the board's own items, then GAMA's, then the other boards' linked to the
          same GAMA topic (exact matches only; partial ones are "related" on a page).
        </div>
        <v-row dense>
          <v-col
            v-for="item in tabs"
            :key="item.tab"
            cols="12"
            md="6"
          >
            <v-select
              v-model="item.scope"
              :items="CURRICULUM_LINK_SCOPES"
              item-title="title"
              item-value="value"
              :label="tabTitle(item.tab)"
              :hint="item.isDefault ? 'The default' : undefined"
              persistent-hint
              density="compact"
              variant="outlined"
              :disabled="!canEdit"
            />
          </v-col>
        </v-row>
        <div class="text-subtitle-1 font-weight-medium mt-4 mb-2">
          Order of the other boards
        </div>
        <div class="text-body-2 text-grey600 mb-2">
          These come first, in this order; any other linked board after them.
        </div>
        <admin-curriculum-rows-editor
          v-model="linkOrder"
          :columns="linkOrderColumns"
          :new-row="() => ({ boardId: null, listOrder: linkOrder.length })"
          :readonly="!canEdit"
        />
        <admin-curriculum-save-row
          :busy="busy"
          :disabled="!canEdit"
          @save="saveLinkRows"
        />
      </v-window-item>

      <v-window-item value="seo">
        <admin-curriculum-seo-templates
          v-if="tab === 'seo'"
          :board-id="boardId"
        />
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import type {
  CurriculumBoardDTO,
  CurriculumBoardDetailDTO,
  CurriculumBoardFilterDTO,
  CurriculumBoardTabDTO,
  CurriculumContentTab,
  CurriculumPanelFilterDTO,
  CurriculumQualificationDTO,
  CurriculumSeriesTypeDTO,
  CurriculumSubjectDTO,
  CurriculumSyllabusDTO,
  CurriculumVariantKindDTO,
  RowsEditorColumn,
} from '@/types'
import {
  ADMIN_PERMISSIONS,
  CURRICULUM_BOARD_FIELDS,
  CURRICULUM_FILTER_KEYS,
  CURRICULUM_FILTER_STYLES,
  CURRICULUM_LINK_SCOPES,
  CURRICULUM_QUALIFICATION_FIELDS,
  CURRICULUM_TABS,
  curriculumSyllabusFields,
} from '~/constants'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

const route = useRoute()
const boardId = Number(route.params.id)
const { can } = useAdminAccess()
const canEdit = computed(() => can(ADMIN_PERMISSIONS.curriculum.edit))
const api = useCurriculumAdmin()
const { busy } = api

const tab = ref('board')
const detail = ref<CurriculumBoardDetailDTO | null>(null)
const board = ref<CurriculumBoardDTO>({ id: boardId, slug: '', name: '', isMaster: false, isDefault: false, isEnabled: false, listOrder: 0 })
const filters = ref<CurriculumBoardFilterDTO[]>([])
const seriesTypes = ref<CurriculumSeriesTypeDTO[]>([])
const variantKinds = ref<CurriculumVariantKindDTO[]>([])
const tabs = ref<CurriculumBoardTabDTO[]>([])
const linkOrder = ref<{ boardId: number | null, listOrder: number }[]>([])
const otherBoards = ref<{ title: string, value: number }[]>([])
const qualifications = ref<CurriculumQualificationDTO[]>([])
const qualificationId = ref<number | null>(null)
const syllabi = ref<CurriculumSyllabusDTO[]>([])
const subjects = ref<CurriculumSubjectDTO[]>([])
const panel = ref<CurriculumPanelFilterDTO[]>([])
const previewQualificationId = ref<number | null>(null)
const previewSyllabusId = ref<number | null>(null)
const previewSyllabi = ref<{ title: string, value: number }[]>([])

useHead(() => ({ title: detail.value ? `${detail.value.board.name} · Curriculum` : 'Curriculum' }))

const boardFields = CURRICULUM_BOARD_FIELDS.map(t => ({ ...t, wide: t.key === 'codeTemplate' }))
const syllabusFields = computed(() => curriculumSyllabusFields(subjects.value.map(t => ({ title: t.name, value: t.id }))))
const qualificationItems = computed(() => qualifications.value.map(t => ({ title: t.name, value: t.id })))
const filterKeys = computed(() => [
  ...CURRICULUM_FILTER_KEYS,
  ...variantKinds.value.filter(t => t.key).map(t => ({ value: `variant.${t.key}`, title: `Variant: ${t.label || t.key}` })),
])
const filterColumns = computed<RowsEditorColumn[]>(() => [
  { key: 'key', title: 'Filter', type: 'select', items: filterKeys.value },
  { key: 'label', title: 'Label visitors see', placeholder: 'Exam, Session, Paper…' },
  { key: 'style', title: 'Style', type: 'select', items: CURRICULUM_FILTER_STYLES },
  { key: 'isEnabled', title: 'On', type: 'switch' },
])
const seriesColumns = computed<RowsEditorColumn[]>(() => [
  { key: 'name', title: 'Name', placeholder: 'May/June' },
  { key: 'code', title: 'Code', placeholder: 'M/J' },
  { key: 'fileCode', title: 'File letter', placeholder: 's' },
  { key: 'seoName', title: 'In titles', placeholder: 'May June' },
  { key: 'months', title: 'Months', placeholder: '5,6' },
  { key: 'qualificationId', title: 'Only for level', type: 'select', items: qualificationItems.value, clearable: true },
  { key: 'isSupplementary', title: 'Resit', type: 'switch' },
])
const variantOptionColumns: RowsEditorColumn[] = [
  { key: 'label', title: 'Label', placeholder: 'Zone 2' },
  { key: 'code', title: 'Code', placeholder: '2' },
]
const linkOrderColumns = computed<RowsEditorColumn[]>(() => [{ key: 'boardId', title: 'Board', type: 'select', items: otherBoards.value }])
const tabTitle = (value: CurriculumContentTab) => CURRICULUM_TABS.find(t => t.value === value)?.title ?? value

const load = async () => {
  const [found, boards, allSubjects] = await Promise.all([api.getBoard(boardId), api.getBoards(), api.getSubjects()])
  if (!found) return
  detail.value = found
  board.value = { ...found.board }
  filters.value = found.filters.map(t => ({ ...t }))
  seriesTypes.value = found.seriesTypes.map(t => ({ ...t }))
  variantKinds.value = found.variantKinds.map(t => ({ ...t, options: t.options.map(o => ({ ...o })) }))
  tabs.value = found.tabs.map(t => ({ ...t }))
  linkOrder.value = found.linkOrder.map((id, index) => ({ boardId: id, listOrder: index }))
  otherBoards.value = (boards ?? []).filter(t => t.id !== boardId).map(t => ({ title: t.name, value: t.id }))
  subjects.value = allSubjects ?? []
  await Promise.all([loadQualifications(), loadPanel()])
}

const loadQualifications = async () => {
  qualifications.value = (await api.getQualifications(boardId)) ?? []
}

const selectQualification = async (id: number) => {
  qualificationId.value = id
  await loadSyllabi()
}

const loadSyllabi = async () => {
  syllabi.value = qualificationId.value ? (await api.getSyllabi(qualificationId.value)) ?? [] : []
}

const loadPreviewSyllabi = async () => {
  previewSyllabi.value = previewQualificationId.value
    ? ((await api.getSyllabi(previewQualificationId.value)) ?? []).map(t => ({ title: t.code ? `${t.name} (${t.code})` : t.name, value: t.id }))
    : []
  await loadPanel()
}

const loadPanel = async () => {
  panel.value = (await api.getPanel(boardId, previewQualificationId.value ?? undefined, previewSyllabusId.value ?? undefined)) ?? []
}

const saveBoardForm = async () => {
  if (await api.saveBoard(board.value) !== null) await load()
}

const saveFilterRows = async () => {
  if (await api.saveFilters(boardId, filters.value) !== null) await loadPanel()
}

const saveSeries = async () => {
  if (await api.saveSeriesTypes(boardId, seriesTypes.value) !== null) await load()
}

const saveVariants = async () => {
  const kinds = variantKinds.value.map((t, index) => ({ ...t, listOrder: index }))
  if (await api.saveVariantKinds(boardId, kinds) !== null) await load()
}

const saveLinkRows = async () => {
  const order = linkOrder.value.map(t => t.boardId).filter((t): t is number => t !== null)
  if (await api.saveLinks(boardId, tabs.value, order) !== null) await load()
}

const saveQualification = (item: CurriculumQualificationDTO) => api.saveQualification(item)
const deleteQualification = (id: number) => api.deleteQualification(id)
const saveSyllabus = (item: CurriculumSyllabusDTO) => api.saveSyllabus(item)
const deleteSyllabus = (id: number) => api.deleteSyllabus(id)
const openSyllabus = (item: CurriculumSyllabusDTO) => navigateTo({ path: `/admin/curriculum/syllabi/${item.id}`, query: { boardId, qualificationId: item.qualificationId } })

onMounted(load)
</script>
