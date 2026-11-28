<template>
  <div class="w-100 d-flex flex-column ga-4">
    <div class="text-body-2 text-grey600">
      Fills the model from today's lists (boards, levels, subjects, topics, papers, variants, file types, topic links and
      the schools' boards). It can run again at any time: copied rows are updated, never removed, and nothing visitors see
      changes. Rows it can't place without guessing are listed below for review.
    </div>

    <div class="d-flex ga-2">
      <v-btn
        v-if="canCopy"
        color="primary"
        variant="flat"
        rounded="pill"
        prepend-icon="md:sync"
        :loading="busy"
        @click="start"
      >
        Run the copy
      </v-btn>
      <v-btn
        variant="outlined"
        rounded="pill"
        prepend-icon="md:refresh"
        :loading="busy"
        @click="load"
      >
        Check again
      </v-btn>
    </div>

    <template v-if="check">
      <div class="text-subtitle-1 font-weight-medium">
        Lists: copied against the source
      </div>
      <v-table
        density="compact"
        class="rounded-lg border"
      >
        <thead>
          <tr>
            <th>List</th>
            <th class="text-end">
              Source
            </th>
            <th class="text-end">
              Copied
            </th>
            <th class="text-end">
              Missing
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in check.lists"
            :key="row.kind"
          >
            <td>{{ KIND_TITLES[row.kind] ?? row.kind }}</td>
            <td class="text-end">
              {{ row.source }}
            </td>
            <td class="text-end">
              {{ row.copied }}
            </td>
            <td class="text-end">
              <v-chip
                size="small"
                label
                :color="row.missing ? 'warning' : 'success'"
              >
                {{ row.missing }}
              </v-chip>
            </td>
          </tr>
        </tbody>
      </v-table>

      <div class="text-subtitle-1 font-weight-medium">
        Content: placed in the model
      </div>
      <v-table
        density="compact"
        class="rounded-lg border"
      >
        <thead>
          <tr>
            <th>Content</th>
            <th class="text-end">
              Total
            </th>
            <th class="text-end">
              Placed
            </th>
            <th>Left out by</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in check.content"
            :key="row.content"
          >
            <td>{{ CONTENT_TITLES[row.content] ?? row.content }}</td>
            <td class="text-end">
              {{ row.total }}
            </td>
            <td class="text-end">
              {{ row.placed }} ({{ percent(row.placed, row.total) }})
            </td>
            <td>
              <v-chip
                v-for="(count, part) in row.unplaced"
                :key="part"
                size="x-small"
                label
                class="mr-1"
              >
                {{ KIND_TITLES[part] ?? part }}: {{ count }}
              </v-chip>
            </td>
          </tr>
        </tbody>
      </v-table>
    </template>

    <div class="d-flex align-center ga-2">
      <div class="text-subtitle-1 font-weight-medium">
        For review ({{ check?.issues ?? issues.length }})
      </div>
      <v-spacer />
      <v-select
        v-model="kind"
        :items="kindItems"
        item-title="title"
        item-value="value"
        label="Kind"
        density="compact"
        variant="outlined"
        hide-details
        clearable
        max-width="240"
        @update:model-value="loadIssues"
      />
    </div>
    <v-data-table
      :headers="issueHeaders"
      :items="issues"
      density="compact"
      class="rounded-lg border"
    >
      <template #[`item.kind`]="{ value }">
        {{ KIND_TITLES[value] ?? value }}
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import type { CurriculumCheckDTO, CurriculumCopyIssueDTO } from '@/types'
import { ADMIN_PERMISSIONS } from '~/constants'

// The copy from today's lists (phase 2): run it, compare the counts, and review what it could not place.
const KIND_TITLES: Record<string, string> = {
  board: 'Boards',
  qualification: 'Levels',
  syllabus: 'Subjects (syllabi)',
  subject: 'Subjects across boards',
  topic: 'Topics',
  paper: 'Papers',
  resourceType: 'Resource types',
  variant: 'Variants',
  documentType: 'Document types',
  series: 'Sessions',
  filter: 'Filters',
  seo: 'SEO texts',
  link: 'Topic links',
  school: 'School boards',
}
const CONTENT_TITLES: Record<string, string> = { pastPapers: 'Past papers', tutorials: 'Tutorials', exams: 'Exams' }

const { can } = useAdminAccess()
const canCopy = computed(() => can(ADMIN_PERMISSIONS.curriculum.copy))
const { busy, startCopy, checkCopy, getCopyIssues } = useCurriculumAdmin()

const check = ref<CurriculumCheckDTO | null>(null)
const issues = ref<CurriculumCopyIssueDTO[]>([])
const kind = ref<string | null>(null)
const kindItems = Object.entries(KIND_TITLES).map(([value, title]) => ({ value, title }))
const issueHeaders = [
  { title: 'Kind', key: 'kind' },
  { title: 'Source id', key: 'sourceId' },
  { title: 'What to check', key: 'message', sortable: false },
]

const percent = (part: number, total: number) => (total ? `${Math.floor((part / total) * 1000) / 10}%` : '—')

const loadIssues = async () => {
  issues.value = (await getCopyIssues(kind.value ?? undefined)) ?? []
}

const load = async () => {
  check.value = await checkCopy()
  await loadIssues()
}

const start = async () => {
  await startCopy()
}

onMounted(load)
</script>
