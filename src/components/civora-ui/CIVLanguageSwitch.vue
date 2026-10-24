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

<template>
  <div v-if="displayOptions.length > 1" class="language-switch" ref="dropdownRef">
    <button
      ref="buttonRef"
      class="language-button"
      @click="toggleDropdown"
      @keydown.down.prevent="openAndFocusFirst"
      @keydown.up.prevent="openAndFocusLast"
      :aria-label="t('aria-labels.language-switch', { lang: currentLanguageLabel })"
      :aria-expanded="isDropdownOpen.toString()"
      aria-haspopup="menu"
      aria-controls="language-dropdown">
      <img class="globe-icon" src="../../assets/icons/globe_icon_2.svg" aria-hidden="true" />
      <span class="body-lg">{{ currentLanguageLabel }}</span>
    </button>

    <ul
      v-if="isDropdownOpen && displayOptions.length > 0"
      class="language-dropdown"
      id="language-dropdown"
      role="menu"
      @keydown.down.prevent="focusItem(focusedIndex + 1)"
      @keydown.up.prevent="focusItem(focusedIndex - 1)"
      @keydown.home.prevent="focusItem(0)"
      @keydown.end.prevent="focusItem(displayOptions.length - 1)"
      @keydown.esc.prevent="closeAndFocusButton"
      @keydown.tab="closeDropdown">
      <li
        v-for="(language, index) in displayOptions"
        :key="index"
        :ref="el => setItemRef(el, index)"
        class="dropdown-item"
        role="menuitem"
        tabindex="-1"
        @click="selectLanguage(language)"
        @keydown.enter.prevent="selectLanguage(language)"
        @keydown.space.prevent="selectLanguage(language)">
        {{ languageNames[language] }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { setLocale, SUPPORTED_LOCALES } from "@/i18n.js";
import { useI18n } from "vue-i18n";

const isDropdownOpen = ref(false)
const currentLanguageLabel = ref('Deutsch')
const displayOptions = SUPPORTED_LOCALES || ['de']
const dropdownRef = ref(null)
const buttonRef = ref(null)
const itemRefs = ref([])
const focusedIndex = ref(-1)
const { locale, t } = useI18n();
const languageNames = {
  de: 'Deutsch',
  en: 'English',
  cs: 'Čeština',
}

const setItemRef = (el, index) => {
  if (el) itemRefs.value[index] = el
}

const focusItem = (index) => {
  const total = displayOptions.length
  if (total === 0) return
  const next = (index + total) % total
  focusedIndex.value = next
  nextTick(() => itemRefs.value[next]?.focus())
}

const openDropdown = async (initialIndex) => {
  if (!isDropdownOpen.value) {
    isDropdownOpen.value = true
    await nextTick()
  }
  focusItem(initialIndex)
}

const openAndFocusFirst = () => openDropdown(0)
const openAndFocusLast = () => openDropdown(displayOptions.length - 1)

const closeDropdown = () => {
  isDropdownOpen.value = false
  focusedIndex.value = -1
  itemRefs.value = []
}

const closeAndFocusButton = () => {
  closeDropdown()
  nextTick(() => buttonRef.value?.focus())
}

const toggleDropdown = () => {
  if (isDropdownOpen.value) closeDropdown()
  else isDropdownOpen.value = true
}

const selectLanguage = (lang) => {
  setLocale(lang)
  closeAndFocusButton()
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  currentLanguageLabel.value = languageNames[locale.value]
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
watch(locale, (newLocale) => {
  currentLanguageLabel.value = languageNames[newLocale];
})
</script>

<style scoped>
.globe-icon {
  width: 20px;
}
.language-switch {
  position: relative;
  display: inline-block;
}
.language-button {
  width: 125px;
  display: flex;
  align-items: center;
  background-color: var(--color-bg-darker);
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
  z-index: 1100;
  gap: 8px;
}
.language-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: var(--color-bg-white);
  border: none;
  padding: 0;
  list-style: none;
  z-index: 1100;
  width: 125px;
}

.dropdown-item {
  padding: 8px 16px;
  cursor: pointer;
}
.dropdown-item:hover,
.dropdown-item:focus {
  background-color: var(--color-neutral-200);
}
</style>
