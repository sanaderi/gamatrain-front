<template>
  <v-row dense>
    <v-col
      v-if="!fixedBoardId"
      cols="12"
      md="3"
    >
      <v-select
        v-model="boardId"
        :items="boards"
        item-title="title"
        item-value="value"
        label="Board"
        density="compact"
        variant="outlined"
        hide-details
        @update:model-value="pickBoard"
      />
    </v-col>
    <v-col
      cols="12"
      :md="fixedBoardId ? 4 : 3"
    >
      <v-select
        v-model="qualificationId"
        :items="qualifications"
        item-title="title"
        item-value="value"
        label="Level"
        density="compact"
        variant="outlined"
        hide-details
        :disabled="!boardId"
        @update:model-value="pickQualification"
      />
    </v-col>
    <v-col
      cols="12"
      :md="fixedBoardId ? 4 : 3"
    >
      <v-select
        v-model="syllabusId"
        :items="syllabi"
        item-title="title"
        item-value="value"
        label="Subject"
        density="compact"
        variant="outlined"
        hide-details
        :disabled="!qualificationId"
        @update:model-value="pickSyllabus"
      />
    </v-col>
    <v-col
      cols="12"
      :md="fixedBoardId ? 4 : 3"
    >
      <v-autocomplete
        :model-value="modelValue"
        :items="topics"
        item-title="title"
        item-value="value"
        label="Topic"
        density="compact"
        variant="outlined"
        hide-details
        :disabled="!syllabusId"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
// Picks a topic of any board (or of one fixed board, GAMA when linking another board's topic) step by step.
const props = defineProps<{ modelValue: number | null, boards?: { title: string, value: number }[], fixedBoardId?: number | null }>()
const emit = defineEmits<{ 'update:modelValue': [number | null] }>()

const api = useCurriculumAdmin()
type Option = { title: string, value: number }
const boardId = ref<number | null>(props.fixedBoardId ?? null)
const qualificationId = ref<number | null>(null)
const syllabusId = ref<number | null>(null)
const qualifications = ref<Option[]>([])
const syllabi = ref<Option[]>([])
const topics = ref<Option[]>([])

const pickBoard = async () => {
  qualificationId.value = null
  syllabusId.value = null
  syllabi.value = []
  topics.value = []
  emit('update:modelValue', null)
  qualifications.value = boardId.value ? ((await api.getQualifications(boardId.value)) ?? []).map(t => ({ title: t.name, value: t.id })) : []
}

const pickQualification = async () => {
  syllabusId.value = null
  topics.value = []
  emit('update:modelValue', null)
  syllabi.value = qualificationId.value
    ? ((await api.getSyllabi(qualificationId.value)) ?? []).map(t => ({ title: t.code ? `${t.name} (${t.code})` : t.name, value: t.id }))
    : []
}

const pickSyllabus = async () => {
  emit('update:modelValue', null)
  topics.value = syllabusId.value
    ? ((await api.getTopics(syllabusId.value)) ?? []).map(t => ({ title: t.parentTopicId ? `— ${t.name}` : t.name, value: t.id }))
    : []
}

watch(() => props.fixedBoardId, (id) => {
  boardId.value = id ?? null
  if (id) pickBoard()
}, { immediate: true })
</script>
