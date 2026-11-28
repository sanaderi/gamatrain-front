<template>
  <v-container
    v-if="landing"
    class="py-6"
  >
    <v-breadcrumbs
      :items="breadcrumbs"
      class="px-0"
    />

    <div class="d-flex align-center ga-3 mb-2">
      <v-avatar
        v-if="landing.board.logo"
        :image="landing.board.logo"
        size="48"
        rounded="lg"
      />
      <h1 class="text-h5 text-md-h4 font-weight-bold text-brandNavy">
        {{ heading }}
      </h1>
    </div>
    <p
      v-if="landing.seo?.description"
      class="text-body-1 text-grey700 mb-6"
    >
      {{ landing.seo.description }}
    </p>

    <v-row>
      <v-col
        cols="12"
        md="8"
      >
        <v-card
          rounded="lg"
          border
          flat
          class="mb-6"
        >
          <v-card-text class="d-flex flex-wrap align-center ga-3">
            <div class="text-h6 text-brandNavy">
              {{ landing.paperCount }} past papers
            </div>
            <v-spacer />
            <v-btn
              color="primary"
              variant="flat"
              rounded="pill"
              :to="searchLink('paper')"
            >
              Past papers
            </v-btn>
            <v-btn
              variant="outlined"
              rounded="pill"
              :to="searchLink('quizhub')"
            >
              Exams
            </v-btn>
            <v-btn
              variant="outlined"
              rounded="pill"
              :to="searchLink('tutorial')"
            >
              Revision notes
            </v-btn>
          </v-card-text>
        </v-card>

        <h2 class="text-h6 font-weight-bold text-brandNavy mb-3">
          {{ childrenTitle }}
        </h2>
        <v-list
          v-if="landing.children.length"
          density="comfortable"
          class="rounded-lg border"
        >
          <v-list-item
            v-for="child in landing.children"
            :key="child.id"
            :to="childLink(child)"
            :title="child.code ? `${child.name} (${child.code})` : child.name ?? ''"
            :class="{ 'ps-8': landing.subject && child.parentId }"
          />
        </v-list>
        <p
          v-else
          class="text-grey600"
        >
          Coming soon.
        </p>
      </v-col>

      <v-col
        cols="12"
        md="4"
      >
        <h2 class="text-h6 font-weight-bold text-brandNavy mb-3">
          Schools teaching {{ landing.board.name }}
        </h2>
        <v-list
          v-if="landing.schools.length"
          density="compact"
          class="rounded-lg border"
        >
          <v-list-item
            v-for="school in landing.schools"
            :key="school.id"
            :to="`/school/${school.id}`"
            :title="school.name ?? ''"
            :subtitle="school.city ?? undefined"
            prepend-icon="md:school_outlined"
          />
        </v-list>
        <p
          v-else
          class="text-grey600"
        >
          No school listed yet.
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { CurriculumLandingDTO, CurriculumPublicItemDTO } from '@/types'

// A board, qualification or syllabus page (/boards/cambridge/igcse/0580-mathematics), from the curriculum model. It exists
// only once the backend's curriculum switch is on; before that the address is not found.
const route = useRoute()
const slugs = computed(() => ([route.params.path].flat().filter(Boolean) as string[]).slice(0, 3))

const { data: landing } = await useAsyncData(
  () => `curriculum-landing-${slugs.value.join('/')}`,
  () => curriculumGet<CurriculumLandingDTO>(`landing/${slugs.value.join('/')}`),
  { watch: [slugs] },
)

if (!landing.value || ([route.params.path].flat().filter(Boolean)).length > 3) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found', fatal: true })
}

const heading = computed(() => {
  const value = landing.value!
  if (value.subject) return `${value.board.name} ${value.level?.name} ${value.subject.name}${value.subject.code ? ` (${value.subject.code})` : ''}`
  if (value.level) return `${value.board.name} ${value.level.name}`
  return value.board.name ?? ''
})

const childrenTitle = computed(() => {
  if (landing.value?.subject) return 'Topics'
  return landing.value?.level ? 'Subjects' : 'Levels'
})

const base = computed(() => `/boards/${landing.value!.board.slug}`)
const breadcrumbs = computed(() => {
  const value = landing.value!
  const items = [{ title: 'Boards', to: '/search', disabled: false }, { title: value.board.name ?? '', to: base.value, disabled: !value.level }]
  if (value.level) items.push({ title: value.level.name ?? '', to: `${base.value}/${value.level.slug}`, disabled: !value.subject })
  if (value.subject) items.push({ title: value.subject.name ?? '', to: route.path, disabled: true })
  return items
})

// Today's search takes the lookup ids, which every item carries.
const searchLink = (type: string) => ({
  path: '/search',
  query: {
    type,
    section: landing.value?.board.legacyId ?? undefined,
    base: landing.value?.level?.legacyId ?? undefined,
    lesson: landing.value?.subject?.legacyId ?? undefined,
  },
})

const childLink = (child: CurriculumPublicItemDTO) => {
  const value = landing.value!
  if (value.subject) return { path: '/search', query: { type: 'tutorial', section: value.board.legacyId ?? undefined, base: value.level?.legacyId ?? undefined, lesson: value.subject.legacyId ?? undefined, topic: child.legacyId ?? undefined } }
  return value.level ? `${base.value}/${value.level.slug}/${child.slug}` : `${base.value}/${child.slug}`
}

const host = useRequestURL().host
useHead(() => ({
  title: landing.value?.seo?.title ?? heading.value,
  link: [{ rel: 'canonical', href: `https://${host}${route.path}` }],
  meta: [
    { key: 'description', name: 'description', content: landing.value?.seo?.description ?? '' },
    { key: 'og:title', property: 'og:title', content: landing.value?.seo?.title ?? heading.value },
    { key: 'og:description', property: 'og:description', content: landing.value?.seo?.description ?? '' },
  ],
}))
</script>
