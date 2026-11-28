<template>
  <div class="w-100">
    <v-table
      density="compact"
      class="rounded-lg border"
    >
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
          >
            {{ column.title }}
          </th>
          <th class="text-end">
            <v-btn
              v-if="!readonly"
              icon="md:add"
              size="small"
              variant="text"
              color="primary"
              @click="add"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in modelValue"
          :key="index"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="py-1"
          >
            <v-switch
              v-if="column.type === 'switch'"
              :model-value="Boolean(cell(row, column.key))"
              color="primary"
              density="compact"
              hide-details
              :disabled="readonly"
              @update:model-value="set(index, column.key, $event)"
            />
            <v-select
              v-else-if="column.type === 'select'"
              :model-value="cell(row, column.key)"
              :items="column.items ?? []"
              item-title="title"
              item-value="value"
              density="compact"
              variant="outlined"
              hide-details
              :clearable="column.clearable"
              :disabled="readonly"
              @update:model-value="set(index, column.key, $event)"
            />
            <v-text-field
              v-else
              :model-value="cell(row, column.key)"
              :type="column.type === 'number' ? 'number' : 'text'"
              :placeholder="column.placeholder"
              density="compact"
              variant="outlined"
              hide-details
              :disabled="readonly"
              @update:model-value="set(index, column.key, column.type === 'number' ? toNumber($event) : $event)"
            />
          </td>
          <td class="text-end text-no-wrap">
            <template v-if="!readonly">
              <v-btn
                icon="md:arrow_upward"
                size="small"
                variant="text"
                :disabled="index === 0"
                @click="move(index, -1)"
              />
              <v-btn
                icon="md:arrow_downward"
                size="small"
                variant="text"
                :disabled="index === modelValue.length - 1"
                @click="move(index, 1)"
              />
              <v-btn
                icon="md:delete"
                size="small"
                variant="text"
                color="error"
                @click="removeAt(index)"
              />
            </template>
          </td>
        </tr>
        <tr v-if="!modelValue.length">
          <td
            :colspan="columns.length + 1"
            class="text-center text-grey600 py-4"
          >
            {{ emptyText }}
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup lang="ts" generic="T extends object">
import type { RowsEditorColumn } from '@/types'

// An editable list (filters, sessions, papers, variant options...): inline fields, add, remove and reorder. The row
// order becomes each row's listOrder when the list is saved, so no one types order numbers.

const props = withDefaults(defineProps<{
  modelValue: T[]
  columns: RowsEditorColumn[]
  newRow: () => T
  readonly?: boolean
  emptyText?: string
}>(), { readonly: false, emptyText: 'Nothing yet.' })

const emit = defineEmits<{ 'update:modelValue': [T[]] }>()

const update = (rows: T[]) => emit('update:modelValue', rows.map((row, index) => ({ ...row, listOrder: index })))
const set = (index: number, key: string, value: unknown) => update(props.modelValue.map((row, i) => (i === index ? { ...row, [key]: value } : row)))
const add = () => update([...props.modelValue, props.newRow()])
const removeAt = (index: number) => update(props.modelValue.filter((_, i) => i !== index))
const move = (index: number, step: number) => {
  const rows = [...props.modelValue]
  const [row] = rows.splice(index, 1)
  rows.splice(index + step, 0, row!)
  update(rows)
}
const toNumber = (value: string) => (value === '' ? null : Number(value))
const cell = (row: T, key: string) => (row as Record<string, unknown>)[key] as never
</script>
