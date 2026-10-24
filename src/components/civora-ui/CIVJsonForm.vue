<!--
  ~ This file is part of Civora UI.
  ~
  ~ Copyright (C) 2025 DKSR GmbH.
  ~
  ~ Civora UI is free software: you can redistribute it and/or modify
  ~ it under the terms of the GNU Affero General Public License as published by
  ~ the Free Software Foundation, version 3.
  ~
  ~ This program is distributed in the hope that it will be useful,
  ~ but WITHOUT ANY WARRANTY; without even the implied warranty of
  ~ MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  ~ GNU Affero General Public License for more details.
  ~
  ~ You should have received a copy of the GNU Affero General Public License
  ~ along with this program. If not, see <https://www.gnu.org/licenses/>.
-->

<script setup lang="ts">
import { computed, markRaw, onMounted, provide, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { JsonForms } from '@jsonforms/vue'
import { vanillaRenderers, defaultStyles, mergeStyles } from '@jsonforms/vue-vanilla'
import '@jsonforms/vue-vanilla/vanilla.css'
import { civArrayListEntry } from './json-form/CIVArrayList.entry'
import { civBooleanControlEntry } from './json-form/CIVBooleanControl.entry'
import { civEnumControlEntry } from './json-form/CIVEnumControl.entry'
import { civNumberControlEntry } from './json-form/CIVNumberControl.entry'
import { civStringControlEntry } from './json-form/CIVStringControl.entry'

// markRaw avoids Vue's "component made reactive" warning.
const renderers = markRaw([
  ...vanillaRenderers,
  civEnumControlEntry,
  civStringControlEntry,
  civNumberControlEntry,
  civBooleanControlEntry,
  civArrayListEntry,
])

const props = defineProps<{
  schema: Record<string, unknown>
  modelValue: Record<string, unknown>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, unknown>): void
  /** AJV validation errors of the whole form (nested included); empty array = valid. */
  (e: 'update:errors', value: unknown[]): void
}>()

const { t, te, locale } = useI18n()

// Minimal structural type: avoids importing @jsonforms/core (not a direct dependency).
type FormError = { keyword: string; message?: string; params?: Record<string, unknown> }
type I18nProp = InstanceType<typeof JsonForms>['$props']['i18n']

// Only strings under this namespace are translated; schema-derived labels fall through.
const NS = 'jsonForms.'

const i18n = computed(
  () =>
    ({
      locale: locale.value,
      translate: (key: string, defaultMessage?: string, values?: Record<string, unknown>) =>
        te(NS + key) ? t(NS + key, values ?? {}) : defaultMessage,
      translateError: (error: FormError) =>
        te(NS + 'error.' + error.keyword)
          ? t(NS + 'error.' + error.keyword, error.params ?? {})
          : error.message,
    }) as unknown as I18nProp,
)

// Append the global typography classes (style.css) to the vanilla renderer classes.
provide(
  'styles',
  mergeStyles(defaultStyles, {
    control: { label: 'title-sm', input: 'body-md', select: 'body-md', error: 'body-sm' },
  }),
)

const formRef = useTemplateRef<{ jsonforms?: { core?: { errors?: unknown[] } } }>('formRef')

// JsonForms only emits `change` on later changes, not on mount: report the initial errors here.
onMounted(() => {
  emit('update:errors', [...(formRef.value?.jsonforms?.core?.errors ?? [])])
})

function onChange({ data, errors }: { data: Record<string, unknown>; errors?: unknown[] }) {
  emit('update:errors', [...(errors ?? [])])
  if (JSON.stringify(data) !== JSON.stringify(props.modelValue)) {
    emit('update:modelValue', data)
  }
}
</script>

<template>
  <JsonForms
    ref="formRef"
    class="civ-json-form"
    :schema="schema"
    :data="modelValue"
    :renderers="renderers"
    :i18n="i18n"
    @change="onChange"
  />
</template>

<style scoped>
.civ-json-form,
:deep(.vertical-layout) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.vertical-layout-item) {
  display: flex;
  flex-direction: column;
}

:deep(.control) {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* CIV controls are a single child of .control, so the gap above never reaches label -> field. */
.civ-json-form :deep(.input-box),
.civ-json-form :deep(.dropdown-box) {
  gap: 8px;
}

/* Vanilla controls we do not override (date, time, multiline, oneOf-enum, ...). */
.civ-json-form :deep(.label) {
  color: var(--color-text-regular);
}

.civ-json-form :deep(.asterisk) {
  color: var(--color-danger-700);
  margin-left: 2px;
}

.civ-json-form :deep(.input),
.civ-json-form :deep(.select) {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-divider);
  border-radius: 6px;
  background: var(--color-bg-white);
  color: var(--color-text-regular);
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.civ-json-form :deep(.input:focus),
.civ-json-form :deep(.select:focus) {
  outline: none;
  border-color: var(--color-button-regular);
}

.civ-json-form :deep(.description:empty) {
  display: none;
}

.civ-json-form :deep(.error) {
  color: var(--color-danger-700);
}
</style>
