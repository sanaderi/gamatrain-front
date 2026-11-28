<template>
  <div class="w-100 h-100 d-flex flex-column align-start justify-start">
    <div class="w-100 d-flex align-center ga-2 mb-2">
      <v-btn
        icon="md:arrow_back"
        variant="text"
        :to="`/admin/curriculum/boards/${boardId}`"
      />
      <div class="text-h6">
        {{ syllabus ? (syllabus.code ? `${syllabus.name} (${syllabus.code})` : syllabus.name) : 'Subject' }}
      </div>
      <span class="text-body-2 text-grey600">{{ board?.name }}</span>
    </div>

    <v-tabs
      v-model="tab"
      color="primary"
      class="mb-4"
    >
      <v-tab value="topics">
        Topics &amp; links
      </v-tab>
      <v-tab value="papers">
        Papers
      </v-tab>
    </v-tabs>

    <v-window
      v-model="tab"
      class="w-100"
    >
      <v-window-item value="papers">
        <div class="text-body-2 text-grey600 mb-2">
          The parts of this subject sat on their own. The short label is what the chip shows and what goes into the paper
          code (4 → 0580/42).
        </div>
        <admin-curriculum-rows-editor
          v-model="papers"
          :columns="paperColumns"
          :new-row="() => ({ id: 0, name: '', shortLabel: '', listOrder: papers.length })"
          :readonly="!canEdit"
        />
        <admin-curriculum-save-row
          :busy="busy"
          :disabled="!canEdit"
          @save="savePaperRows"
        />
      </v-window-item>

      <v-window-item value="topics">
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <admin-curriculum-items-table
              title="Topics"
              noun="topic"
              :items="topics"
              :fields="topicFields"
              :new-item="() => ({ id: 0, syllabusId, name: '', isUnit: false, listOrder: topics.length })"
              :save="saveTopic"
              :remove="deleteTopic"
              :selected-id="topicId"
              :readonly="!canEdit"
              @select="selectTopic($event.id)"
              @changed="loadTopics"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="d-flex flex-column ga-4"
          >
            <template v-if="topicId">
              <div class="text-subtitle-1 font-weight-medium">
                Links of “{{ topics.find(t => t.id === topicId)?.name }}”
              </div>
              <v-list
                density="compact"
                class="rounded-lg border"
              >
                <v-list-item
                  v-for="link in links"
                  :key="link.id"
                  :title="board?.isMaster ? link.topicName ?? '' : link.masterTopicName ?? ''"
                  :subtitle="board?.isMaster ? `${link.topicBoardName} · ${link.topicSyllabusName}` : 'GAMA'"
                >
                  <template #append>
                    <v-chip
                      size="x-small"
                      label
                      :color="link.kind === 'Exact' ? 'success' : 'warning'"
                      class="mr-2"
                    >
                      {{ link.kind }}
                    </v-chip>
                    <v-btn
                      v-if="canEdit"
                      icon="md:delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="removeLink(link.id)"
                    />
                  </template>
                </v-list-item>
                <v-list-item
                  v-if="!links.length"
                  title="Not linked yet."
                />
              </v-list>

              <v-card
                v-if="canEdit"
                rounded="lg"
                border
                flat
              >
                <v-card-title class="text-subtitle-1">
                  {{ board?.isMaster ? 'Link another board\'s topic' : 'Link to a GAMA topic' }}
                </v-card-title>
                <v-card-text class="d-flex flex-column ga-3">
                  <admin-curriculum-topic-picker
                    v-model="linkTopicId"
                    :boards="otherBoards"
                    :fixed-board-id="board?.isMaster ? null : masterBoardId"
                  />
                  <div class="d-flex ga-2 align-center">
                    <v-btn-toggle
                      v-model="linkKind"
                      mandatory
                      density="compact"
                      color="primary"
                      variant="outlined"
                    >
                      <v-btn value="Exact">
                        Exact
                      </v-btn>
                      <v-btn value="Partial">
                        Partial
                      </v-btn>
                    </v-btn-toggle>
                    <v-spacer />
                    <v-btn
                      color="primary"
                      variant="flat"
                      rounded="pill"
                      :disabled="!linkTopicId"
                      :loading="busy"
                      @click="addLink"
                    >
                      Link
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>

              <div>
                <div class="d-flex align-center ga-2 mb-2">
                  <div class="text-subtitle-1 font-weight-medium">
                    What visitors get
                  </div>
                  <v-spacer />
                  <v-select
                    v-model="previewTab"
                    :items="CURRICULUM_TABS"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    max-width="260"
                    @update:model-value="loadLinked"
                  />
                </div>
                <v-list
                  v-if="linked"
                  density="compact"
                  class="rounded-lg border"
                >
                  <template
                    v-for="group in linked.groups"
                    :key="`${group.source}-${group.boardId}`"
                  >
                    <v-list-subheader>{{ CURRICULUM_LINK_SOURCES[group.source] }} · {{ group.boardName }}</v-list-subheader>
                    <v-list-item
                      v-for="topic in group.topics"
                      :key="topic.id"
                      :title="topic.name ?? ''"
                    />
                  </template>
                  <template v-if="linked.related.length">
                    <v-list-subheader>Related (partial matches, shown on the page only)</v-list-subheader>
                    <v-list-item
                      v-for="topic in linked.related"
                      :key="topic.id"
                      :title="topic.name ?? ''"
                    />
                  </template>
                </v-list>
              </div>
            </template>
            <div
              v-else
              class="text-grey600 pt-12 text-center"
            >
              Choose a topic to see and edit its links.
            </div>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import type {
  CurriculumBoardDTO,
  CurriculumContentTab,
  CurriculumLinkKind,
  CurriculumLinkedTopicsDTO,
  CurriculumPaperDTO,
  CurriculumSyllabusDTO,
  CurriculumTopicDTO,
  CurriculumTopicLinkDTO,
  RowsEditorColumn,
} from '@/types'
import { ADMIN_PERMISSIONS, CURRICULUM_LINK_SOURCES, CURRICULUM_TABS, curriculumTopicFields } from '~/constants'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

const route = useRoute()
const syllabusId = Number(route.params.id)
const boardId = Number(route.query.boardId)
const qualificationId = Number(route.query.qualificationId)
const { can } = useAdminAccess()
const canEdit = computed(() => can(ADMIN_PERMISSIONS.curriculum.edit))
const api = useCurriculumAdmin()
const { busy } = api

const tab = ref('topics')
const board = ref<CurriculumBoardDTO | null>(null)
const masterBoardId = ref<number | null>(null)
const otherBoards = ref<{ title: string, value: number }[]>([])
const syllabus = ref<CurriculumSyllabusDTO | null>(null)
const papers = ref<CurriculumPaperDTO[]>([])
const topics = ref<CurriculumTopicDTO[]>([])
const topicId = ref<number | null>(null)
const links = ref<CurriculumTopicLinkDTO[]>([])
const linkTopicId = ref<number | null>(null)
const linkKind = ref<CurriculumLinkKind>('Exact')
const previewTab = ref<CurriculumContentTab>('Tutorials')
const linked = ref<CurriculumLinkedTopicsDTO | null>(null)

useHead(() => ({ title: syllabus.value ? `${syllabus.value.name} · Curriculum` : 'Curriculum' }))

const paperColumns: RowsEditorColumn[] = [
  { key: 'name', title: 'Name', placeholder: 'Paper 4' },
  { key: 'shortLabel', title: 'Short label', placeholder: '4' },
  { key: 'tier', title: 'Tier', placeholder: 'Extended, HL…' },
]
const topicFields = computed(() => curriculumTopicFields(topics.value.filter(t => !t.parentTopicId && t.id !== topicId.value).map(t => ({ title: t.name, value: t.id }))))

const load = async () => {
  const [boards, syllabusList, paperList] = await Promise.all([api.getBoards(), api.getSyllabi(qualificationId), api.getPapers(syllabusId)])
  board.value = boards?.find(t => t.id === boardId) ?? null
  masterBoardId.value = boards?.find(t => t.isMaster)?.id ?? null
  otherBoards.value = (boards ?? []).filter(t => !t.isMaster && t.id !== boardId).map(t => ({ title: t.name, value: t.id }))
  syllabus.value = syllabusList?.find(t => t.id === syllabusId) ?? null
  papers.value = paperList ?? []
  await loadTopics()
}

const loadTopics = async () => {
  topics.value = (await api.getTopics(syllabusId)) ?? []
}

const selectTopic = async (id: number) => {
  topicId.value = id
  linkTopicId.value = null
  await Promise.all([loadLinks(), loadLinked()])
}

const loadLinks = async () => {
  links.value = topicId.value ? (await api.getTopicLinks(topicId.value)) ?? [] : []
}

const loadLinked = async () => {
  linked.value = topicId.value ? await api.getLinkedTopics(boardId, topicId.value, previewTab.value) : null
}

// A link always has GAMA's topic as the master: on GAMA this topic is it, on another board the picked one is.
const addLink = async () => {
  if (!topicId.value || !linkTopicId.value) return
  const [master, other] = board.value?.isMaster ? [topicId.value, linkTopicId.value] : [linkTopicId.value, topicId.value]
  if (await api.addTopicLink(master, other, linkKind.value) !== null) {
    linkTopicId.value = null
    await Promise.all([loadLinks(), loadLinked()])
  }
}

const removeLink = async (id: number) => {
  if (await api.deleteTopicLink(id) !== null) await Promise.all([loadLinks(), loadLinked()])
}

const savePaperRows = async () => {
  if (await api.savePapers(syllabusId, papers.value) !== null) papers.value = (await api.getPapers(syllabusId)) ?? []
}

const saveTopic = (item: CurriculumTopicDTO) => api.saveTopic(item)
const deleteTopic = (id: number) => api.deleteTopic(id)

onMounted(load)
</script>
