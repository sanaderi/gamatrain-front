<template>
  <div class="w-100">
    <div class="d-flex align-center ga-2 mb-2">
      <div class="text-subtitle-1 font-weight-medium">
        {{ title }}
      </div>
      <v-spacer />
      <v-btn
        v-if="!readonly"
        rounded="pill"
        color="primary"
        variant="outlined"
        prepend-icon="md:add"
        @click="openEditor()"
      >
        Add
      </v-btn>
    </div>

    <v-data-table
      :headers="headers"
      :items="items"
      :items-per-page="-1"
      density="compact"
      hide-default-footer
      class="rounded-lg border"
      :row-props="rowProps"
      @click:row="(_: unknown, { item }: { item: T }) => emit('select', item)"
    >
      <template
        v-for="field in switchFields"
        :key="field.key"
        #[`item.${field.key}`]="{ value }"
      >
        <v-icon
          v-if="value"
          icon="md:check"
          color="success"
          size="small"
        />
      </template>
      <template #[`item.legacyId`]="{ value }">
        <v-chip
          v-if="value"
          size="x-small"
          label
        >
          copied {{ value }}
        </v-chip>
      </template>
      <template #[`item.actions`]="{ item }">
        <div class="d-flex justify-end text-no-wrap">
          <v-btn
            v-if="open"
            icon="md:open_in_new"
            size="small"
            variant="text"
            @click.stop="open(item)"
          />
          <v-btn
            v-if="!readonly"
            icon="md:edit"
            size="small"
            variant="text"
            @click.stop="openEditor(item)"
          />
          <v-btn
            v-if="!readonly && remove"
            icon="md:delete"
            size="small"
            variant="text"
            color="error"
            @click.stop="confirmRemove = item"
          />
        </div>
      </template>
      <template #no-data>
        <div class="text-grey600 py-4">
          {{ emptyText }}
        </div>
      </template>
    </v-data-table>

    <v-dialog
      v-model="showEditor"
      max-width="720"
    >
      <v-card rounded="lg">
        <v-card-title>{{ editing && (editing as { id?: number }).id ? `Edit ${noun}` : `Add ${noun}` }}</v-card-title>
        <v-card-text>
          <admin-curriculum-fields-form
            v-if="editing"
            v-model="editing"
            :fields="fields"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showEditor = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="saving"
            @click="submit"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <admin-common-delete-modal
      :model-value="Boolean(confirmRemove)"
      :loading="saving"
      @update:model-value="confirmRemove = $event ? confirmRemove : null"
      @confirm="submitRemove"
    />
  </div>
</template>

<script setup lang="ts" generic="T extends { id: number }">
import type { CurriculumField } from '@/types'

// A curriculum list (boards, levels, syllabi, subjects, document types, topics) with an add/edit dialog. Copied rows
// show a "copied" chip; the backend refuses their edits until the curriculum's writes switch.
const props = withDefaults(defineProps<{
  title: string
  noun: string
  items: T[]
  fields: CurriculumField[]
  newItem: () => T
  save: (item: T) => Promise<unknown>
  remove?: (id: number) => Promise<unknown>
  open?: (item: T) => void
  selectedId?: number | null
  readonly?: boolean
  emptyText?: string
}>(), { remove: undefined, open: undefined, selectedId: null, readonly: false, emptyText: 'Nothing yet.' })

const emit = defineEmits<{ changed: [], select: [T] }>()

const headers = computed(() => [
  ...props.fields.filter(t => t.inTable !== false).map(t => ({ title: t.title, key: t.key })),
  { title: '', key: 'legacyId', sortable: false },
  { title: '', key: 'actions', sortable: false, align: 'end' as const },
])
const switchFields = computed(() => props.fields.filter(t => t.type === 'switch'))
const rowProps = ({ item }: { item: T }) => ({ class: item.id === props.selectedId ? 'bg-primary50 cursor-pointer' : 'cursor-pointer' })

const showEditor = ref(false)
const editing = ref<T | null>(null)
const saving = ref(false)
const confirmRemove = ref<T | null>(null)

const openEditor = (item?: T) => {
  editing.value = item ? { ...item } : props.newItem()
  showEditor.value = true
}

const submit = async () => {
  if (!editing.value) return
  saving.value = true
  const result = await props.save(editing.value as T)
  saving.value = false
  if (result !== null) {
    showEditor.value = false
    emit('changed')
  }
}

const submitRemove = async () => {
  if (!confirmRemove.value || !props.remove) return
  saving.value = true
  const result = await props.remove(confirmRemove.value.id)
  saving.value = false
  confirmRemove.value = null
  if (result !== null) emit('changed')
}
</script>
