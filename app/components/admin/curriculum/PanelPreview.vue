<template>
  <v-card
    rounded="lg"
    border
    flat
  >
    <v-card-title class="d-flex align-center text-subtitle-1">
      Live preview
      <v-spacer />
      <span class="text-caption text-grey600">visitors see this</span>
    </v-card-title>
    <v-divider />
    <v-card-text class="d-flex flex-column ga-3">
      <div
        v-for="filter in filters"
        :key="filter.key"
      >
        <div class="text-caption text-grey600 mb-1">
          {{ filter.label }}
        </div>
        <v-chip-group
          v-if="filter.style === 'Chips'"
          column
        >
          <v-chip
            size="small"
            variant="flat"
            color="primary"
          >
            All
          </v-chip>
          <v-chip
            v-for="option in filter.options"
            :key="option.value"
            size="small"
            variant="outlined"
          >
            {{ option.label }}
          </v-chip>
        </v-chip-group>
        <v-select
          v-else
          :items="filter.options"
          item-title="label"
          item-value="value"
          :placeholder="filter.options.length ? 'Choose' : 'Filled from the papers'"
          density="compact"
          variant="outlined"
          hide-details
        />
      </div>
      <div
        v-if="!filters.length"
        class="text-grey600"
      >
        No filter is turned on yet.
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { CurriculumPanelFilterDTO } from '@/types'

// The board's filter panel as the backend will send it to the website: the same order, labels and styles.
defineProps<{ filters: CurriculumPanelFilterDTO[] }>()
</script>
