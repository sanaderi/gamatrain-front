<template>
  <v-row dense>
    <v-col
      v-for="field in fields"
      :key="field.key"
      cols="12"
      :md="field.wide ? 12 : 6"
    >
      <v-switch
        v-if="field.type === 'switch'"
        :model-value="Boolean(value(field.key))"
        :label="field.title"
        :hint="field.hint"
        :persistent-hint="Boolean(field.hint)"
        :disabled="disabled"
        color="primary"
        density="compact"
        @update:model-value="set(field.key, $event)"
      />
      <v-autocomplete
        v-else-if="field.type === 'select'"
        :model-value="value(field.key)"
        :items="field.items ?? []"
        item-title="title"
        item-value="value"
        :label="field.title"
        :hint="field.hint"
        :persistent-hint="Boolean(field.hint)"
        :clearable="!field.required"
        :disabled="disabled"
        variant="outlined"
        density="compact"
        @update:model-value="set(field.key, $event)"
      />
      <v-textarea
        v-else-if="field.type === 'textarea'"
        :model-value="value(field.key)"
        :label="field.title"
        :hint="field.hint"
        :persistent-hint="Boolean(field.hint)"
        :disabled="disabled"
        rows="2"
        auto-grow
        variant="outlined"
        density="compact"
        @update:model-value="set(field.key, $event)"
      />
      <v-text-field
        v-else
        :model-value="value(field.key)"
        :type="field.type === 'number' ? 'number' : 'text'"
        :label="field.title"
        :hint="field.hint"
        :persistent-hint="Boolean(field.hint)"
        :disabled="disabled"
        variant="outlined"
        density="compact"
        @update:model-value="set(field.key, field.type === 'number' ? toNumber($event) : $event)"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
// The fields of one curriculum item (a board, a level, a syllabus...) from a list of field definitions.
import type { CurriculumField } from '@/types'

const props = defineProps<{ modelValue: object, fields: CurriculumField[], disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [object] }>()

const value = (key: string) => (props.modelValue as Record<string, unknown>)[key] as never
const set = (key: string, next: unknown) => emit('update:modelValue', { ...props.modelValue, [key]: next })
const toNumber = (next: string) => (next === '' ? null : Number(next))
</script>
