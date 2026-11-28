<template>
  <div class="w-100 h-100 d-flex flex-column align-start justify-start">
    <div class="w-100 text-body-2 text-grey600 mb-2">
      Any exam board, defined as data: its filters, sessions, papers, topic links and SEO texts. Nothing here is shown to
      visitors yet; the website switches to it after the data is copied in and checked.
    </div>

    <v-tabs
      v-model="tab"
      color="primary"
      class="mb-4"
    >
      <v-tab value="boards">
        Boards
      </v-tab>
      <v-tab value="subjects">
        Subjects
      </v-tab>
      <v-tab value="documents">
        Document types
      </v-tab>
      <v-tab value="seo">
        Default SEO
      </v-tab>
    </v-tabs>

    <v-window
      v-model="tab"
      class="w-100"
    >
      <v-window-item value="boards">
        <admin-curriculum-items-table
          title="Boards"
          noun="board"
          :items="boards"
          :fields="CURRICULUM_BOARD_FIELDS"
          :new-item="newBoard"
          :save="saveAndOpen"
          :remove="deleteBoard"
          :open="openBoard"
          :readonly="!canEdit"
          empty-text="No board yet: add one, or wait for the copy of today's boards."
          @changed="load"
        />
      </v-window-item>
      <v-window-item value="subjects">
        <admin-curriculum-items-table
          title="Subjects across boards"
          noun="subject"
          :items="subjects"
          :fields="CURRICULUM_SUBJECT_FIELDS"
          :new-item="() => ({ id: 0, slug: '', name: '', listOrder: subjects.length })"
          :save="saveSubject"
          :remove="deleteSubject"
          :readonly="!canEdit"
          @changed="load"
        />
      </v-window-item>
      <v-window-item value="documents">
        <admin-curriculum-items-table
          title="Document types"
          noun="document type"
          :items="documentTypes"
          :fields="CURRICULUM_DOCUMENT_TYPE_FIELDS"
          :new-item="() => ({ id: 0, code: '', name: '', listOrder: documentTypes.length })"
          :save="saveDocumentType"
          :remove="deleteDocumentType"
          :readonly="!canEdit"
          @changed="load"
        />
      </v-window-item>
      <v-window-item value="seo">
        <admin-curriculum-seo-templates v-if="tab === 'seo'" />
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import type { CurriculumBoardDTO, CurriculumDocumentTypeDTO, CurriculumSubjectDTO } from '@/types'
import { ADMIN_PERMISSIONS, CURRICULUM_BOARD_FIELDS, CURRICULUM_DOCUMENT_TYPE_FIELDS, CURRICULUM_SUBJECT_FIELDS } from '~/constants'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

useHead({ title: 'Curriculum' })

const { can } = useAdminAccess()
const canEdit = computed(() => can(ADMIN_PERMISSIONS.curriculum.edit))
const { getBoards, saveBoard, deleteBoard, getSubjects, saveSubject, deleteSubject, getDocumentTypes, saveDocumentType, deleteDocumentType } = useCurriculumAdmin()

const tab = ref('boards')
const boards = ref<CurriculumBoardDTO[]>([])
const subjects = ref<CurriculumSubjectDTO[]>([])
const documentTypes = ref<CurriculumDocumentTypeDTO[]>([])

const load = async () => {
  const [b, s, d] = await Promise.all([getBoards(), getSubjects(), getDocumentTypes()])
  boards.value = b ?? []
  subjects.value = s ?? []
  documentTypes.value = d ?? []
}

const newBoard = (): CurriculumBoardDTO => ({ id: 0, slug: '', name: '', isMaster: false, isDefault: false, isEnabled: false, listOrder: boards.value.length })
const openBoard = (board: CurriculumBoardDTO) => navigateTo(`/admin/curriculum/boards/${board.id}`)

// A new board goes straight to its profile (filters, sessions, levels...), the rest of the wizard.
const saveAndOpen = async (board: CurriculumBoardDTO) => {
  const id = await saveBoard(board)
  if (id !== null && !board.id) await navigateTo(`/admin/curriculum/boards/${id}`)
  return id
}

onMounted(load)
</script>
