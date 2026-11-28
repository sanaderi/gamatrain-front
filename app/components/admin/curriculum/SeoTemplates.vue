<template>
  <div class="w-100 d-flex flex-column ga-4">
    <div class="text-body-2 text-grey600">
      <template v-if="boardId">
        This board's own titles and descriptions. A page without one here uses the default.
      </template>
      <template v-else>
        The default titles and descriptions of every board. A board can have its own for any page.
      </template>
      Values: <code>{board}</code>, <code>{qualification}</code>, <code>{subject}</code>, <code>{title}</code>, <code>{code}</code>…
      <code>[ ... ]</code> is dropped when a value in it is empty; <code>a || b</code> uses the first that has all its values.
    </div>

    <v-card
      v-for="(template, index) in templates"
      :key="template.id || `new-${index}`"
      rounded="lg"
      border
      flat
    >
      <v-card-text class="d-flex flex-column ga-3">
        <v-select
          v-model="template.page"
          :items="CURRICULUM_SEO_PAGES"
          item-title="title"
          item-value="value"
          label="Page"
          density="compact"
          variant="outlined"
          hide-details
          :disabled="Boolean(template.id)"
        />
        <v-textarea
          v-model="template.titleTemplate"
          label="Title"
          rows="1"
          auto-grow
          density="compact"
          variant="outlined"
          hide-details
        />
        <v-textarea
          v-model="template.descriptionTemplate"
          label="Description"
          rows="2"
          auto-grow
          density="compact"
          variant="outlined"
          hide-details
        />
        <div
          v-if="previews[index]"
          class="rounded-lg bg-grey50 pa-3"
        >
          <div class="text-primaryStrong text-body-1">
            {{ previews[index]!.title || '—' }}
          </div>
          <div class="text-body-2 text-grey700">
            {{ previews[index]!.description || '—' }}
          </div>
          <v-alert
            v-for="warning in previews[index]!.warnings"
            :key="warning"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-2"
          >
            {{ CURRICULUM_SEO_WARNINGS[warning] ?? warning }}
          </v-alert>
        </div>
        <div class="d-flex ga-2">
          <v-btn
            variant="outlined"
            rounded="pill"
            prepend-icon="md:visibility"
            :disabled="!template.page"
            @click="preview(index)"
          >
            Preview
          </v-btn>
          <v-spacer />
          <v-btn
            v-if="boardId && template.id"
            variant="text"
            color="error"
            @click="removeTemplate(template.id)"
          >
            Use the default
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            rounded="pill"
            :loading="busy"
            @click="saveTemplate(template)"
          >
            Save
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-expansion-panels variant="accordion">
      <v-expansion-panel title="Sample values for the preview">
        <v-expansion-panel-text>
          <v-row dense>
            <v-col
              v-for="key in Object.keys(sample)"
              :key="key"
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="sample[key]"
                :label="key"
                density="compact"
                variant="outlined"
                hide-details
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div v-if="boardId">
      <v-btn
        rounded="pill"
        variant="outlined"
        color="primary"
        prepend-icon="md:add"
        @click="templates.push({ id: 0, boardId, page: null, titleTemplate: '', descriptionTemplate: '' })"
      >
        Add a page of this board
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CurriculumSeoResultDTO, CurriculumSeoTemplateDTO } from '@/types'
import { CURRICULUM_SEO_PAGES, CURRICULUM_SEO_SAMPLE, CURRICULUM_SEO_WARNINGS } from '~/constants'

// The SEO templates of one board, or the defaults (no board), each with a preview the backend writes.
const props = defineProps<{ boardId?: number }>()

const { busy, getSeoTemplates, saveSeoTemplate, deleteSeoTemplate, previewSeo } = useCurriculumAdmin()
const templates = ref<CurriculumSeoTemplateDTO[]>([])
const previews = ref<Record<number, CurriculumSeoResultDTO | null>>({})
const sample = reactive<Record<string, string>>({ ...CURRICULUM_SEO_SAMPLE })

const load = async () => {
  templates.value = (await getSeoTemplates(props.boardId)) ?? []
  previews.value = {}
}

// The preview writes the saved template, so an unsaved edit is saved first.
const preview = async (index: number) => {
  const template = templates.value[index]
  if (!template?.page) return
  if (!(await saveTemplate(template, false))) return
  previews.value[index] = await previewSeo(template.page, sample, props.boardId)
}

const saveTemplate = async (template: CurriculumSeoTemplateDTO, reload = true) => {
  const id = await saveSeoTemplate(template)
  if (id === null) return false
  template.id = Number(id)
  if (reload) await load()
  return true
}

const removeTemplate = async (id: number) => {
  if (await deleteSeoTemplate(id) !== null) await load()
}

onMounted(load)
</script>
