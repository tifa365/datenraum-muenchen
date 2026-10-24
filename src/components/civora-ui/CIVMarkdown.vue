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
import { computed } from 'vue'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

const props = defineProps<{
  content: string
}>()

const sanitizedContent = computed(() => {
  if (!props.content) return ''

  return DOMPurify.sanitize(marked.parse(props.content, { async: false }))
})
</script>

<template>
  <div
    class="civ-markdown"
    v-html="sanitizedContent" />
</template>

<style scoped>
.civ-markdown {
  min-width: 0;
  font-family: var(--font-family), sans-serif;
  font-size: var(--body-lg-font-size);
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: 0.5px;
}

.civ-markdown :deep(h1),
.civ-markdown :deep(h2),
.civ-markdown :deep(h3),
.civ-markdown :deep(h4),
.civ-markdown :deep(h5),
.civ-markdown :deep(h6) {
  font-family: var(--font-family), sans-serif;
  font-style: normal;
  overflow-wrap: anywhere;
}

.civ-markdown :deep(h1) {
  font-size: var(--display-lg-font-size);
  font-weight: 600;
  line-height: 74px;
  letter-spacing: -0.25px;
}

.civ-markdown :deep(h2) {
  font-size: var(--display-md-font-size);
  font-weight: 400;
  line-height: 52px;
  letter-spacing: normal;
}

.civ-markdown :deep(h3) {
  font-size: var(--display-sm-font-size);
  font-weight: 600;
  line-height: 44px;
  letter-spacing: normal;
}

.civ-markdown :deep(h4) {
  font-size: var(--headline-sm-font-size);
  font-weight: 400;
  line-height: 32px;
  letter-spacing: normal;
}

.civ-markdown :deep(h5) {
  font-size: var(--headline-md-font-size);
  font-weight: 600;
  line-height: 36px;
  letter-spacing: normal;
}

.civ-markdown :deep(h6) {
  font-size: var(--headline-lg-font-size);
  font-weight: 400;
  line-height: 40px;
  letter-spacing: normal;
}

.civ-markdown :deep(p),
.civ-markdown :deep(blockquote),
.civ-markdown :deep(li),
.civ-markdown :deep(a) {
  font-family: var(--font-family), sans-serif;
  font-size: var(--body-lg-font-size);
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: 0.5px;
}

.civ-markdown :deep(h1),
.civ-markdown :deep(h2),
.civ-markdown :deep(h3),
.civ-markdown :deep(h4),
.civ-markdown :deep(h5),
.civ-markdown :deep(h6),
.civ-markdown :deep(p),
.civ-markdown :deep(blockquote),
.civ-markdown :deep(ul),
.civ-markdown :deep(ol),
.civ-markdown :deep(pre) {
  margin: 0 0 16px;
}

.civ-markdown :deep(ul),
.civ-markdown :deep(ol) {
  padding-left: 24px;
}

.civ-markdown :deep(ul) {
  list-style-type: disc;
}

.civ-markdown :deep(ol) {
  list-style-type: decimal;
}

.civ-markdown :deep(li + li),
.civ-markdown :deep(li > ul),
.civ-markdown :deep(li > ol) {
  margin-top: 4px;
}

.civ-markdown :deep(blockquote) {
  padding-left: 16px;
  border-left: 4px solid var(--color-divider);
}

.civ-markdown :deep(blockquote > :last-child) {
  margin-bottom: 0;
}

.civ-markdown :deep(pre) {
  box-sizing: border-box;
  max-width: 100%;
  padding: 16px;
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-neutral-200);
  color: var(--color-text-light);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.civ-markdown :deep(code) {
  padding: 2px 4px;
  border-radius: 3px;
  background-color: var(--color-neutral-200);
  color: var(--color-text-light);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 0.875em;
  overflow-wrap: anywhere;
}

.civ-markdown :deep(pre code) {
  padding: 0;
  border-radius: 0;
  background-color: transparent;
  color: inherit;
  font-size: inherit;
  white-space: inherit;
}

.civ-markdown :deep(a) {
  color: var(--color-info-700);
  text-decoration: underline;
  overflow-wrap: anywhere;
}

.civ-markdown :deep(em) {
  font-style: italic;
}

.civ-markdown :deep(strong) {
  font-weight: 700;
}

.civ-markdown :deep(img) {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.civ-markdown :deep(hr) {
  width: 100%;
  margin: 24px 0;
  border: 0;
  border-top: 1px solid var(--color-divider);
}

.civ-markdown :deep(:last-child) {
  margin-bottom: 0;
}
</style>
