<template>
  <div class="d-flex mt-3">
    <v-spacer />
    <v-btn
      color="primary"
      variant="flat"
      rounded="pill"
      :loading="busy"
      :disabled="disabled"
      @click="emit('save')"
    >
      Save
    </v-btn>
  </div>
</template>

<script setup lang="ts">
// The Save button under each editor of a curriculum page.
defineProps<{ busy?: boolean, disabled?: boolean }>()
const emit = defineEmits<{ save: [] }>()
</script>
