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
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import CIVButton from './CIVButton.vue';

const props = defineProps({
  placeholder: String,
  label: String,
  helperText: String,
  classList: String,
  hasClearButton: {
    type: Boolean,
    default: true
  },
  onClear: Function,
  onSearch: Function,
  onIconSearch: Function,
  iconPrefix: {
    type: String,
    default: 'src/assets/icons/Search.svg'
  },
  hasSearchButton: {
    type: Boolean,
    default: true
  },
  hasMetaData: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'large',
    validator: (value: string) => ['small', 'large'].includes(value)
  }
})

const showMeta = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const toggleMeta = () => {
  showMeta.value = !showMeta.value
}

const onClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    showMeta.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})

const searchValue = defineModel<string>()
const prefixIcon = computed(() => props.iconPrefix ? 'url(' + props.iconPrefix + ')' : '')

const handleClick = () => {
  if (!props.onSearch) return;
  return props.onSearch(searchValue.value)
}

const handleIconSearch = () => {
  if (!props.onIconSearch) return;
  return props.onIconSearch(searchValue.value)
}

const handleClear = () => {
  searchValue.value = ''
  if (!props.onClear) return;
  return props.onClear()
}
</script>

<template>
  <div :class="[$style.searchInputContent, classList, $style['input-' + size]]" ref="containerRef">
    <label v-if="props.label" class="label-md" :class="$style.labelText" for="search">{{ props.label }}</label>

    <div :class="$style.inputWrapper">
      <div :class="$style.inputGroup" :style="{height: !hasSearchButton ? '' : '50px'}">
        <div :class="[$style.prefixIcon, $style.iconStyle]" @click="handleIconSearch" />
        <input v-model="searchValue" id="search" type="text" :placeholder="props.placeholder" class="body-md"
          :class="[$style.customComponents, $style.searchInput]">
        <div :class="$style.searchInputButton">
          <div v-if="props.hasClearButton && searchValue" :class="[$style.iconStyle, $style.closeIcon]"
            @click="handleClear"></div>
          <CIVButton v-if="props.hasSearchButton" :label="$t('landing-page.hero.search')" @click="handleClick" />
        </div>
        <div v-if="props.hasMetaData" :class="$style.metaData">
          <div :class="$style.metaDataHeader" tabindex="0" @click="toggleMeta">
            <span class="body-lg" :class="$style.metaDataTitle">{{$t('message.metadata.metadata')}}</span>
            <div :class="[$style.iconStyle, $style.dropDownIcon]"></div>
          </div>
        </div>
      </div>
      <div v-show="showMeta" v-if="props.hasMetaData" :class="$style.metaDataContent">
        <slot name="metaDataContent"></slot>
      </div>
    </div>
    <p v-if="props.helperText" class="label-md" :class="$style.helperText" for="search">{{ props.helperText }}</p>
  </div>
</template>

<style module>
.searchInputContent {
  position: relative;
  width: 100%;
  display: flex;
  gap: 4px;
  flex-direction: column;
  color: var(--color-primary-800);
}

.searchInput::placeholder {
  color: var(--color-icons) ;
}

.inputWrapper {
  position: relative;
  width: 100%;
}

.labelText {
  color: var(--color-text-light);
}

.inputGroup {
  background-color: var(--color-bg-white);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1.5px solid var(--color-divider)
}

.inputGroup input {
  background-color: var(--color-bg-white);
}

.prefixIcon {
  mask-image: v-bind(prefixIcon);
}

.iconStyle {
  min-width: 24px;
  aspect-ratio: 1/1;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: cover;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: cover;
  background-color: var(--color-icons);
}

.closeIcon {
  mask-image: url('src/assets/icons/Close.svg');
  cursor: pointer;
}

.searchInput {
  width: 100%;
}

.customComponents {
  border: none;
  outline: none;
}

.searchInputButton {
  display: flex;
  gap: 12px;
}

.metaData {
  display: flex;
  gap: 24px;
  align-items: center;
}

.metaData::before {
  content: ' ';
  display: inline-block;
  width: 3px;
  height: 20px;
  background-color: var(--color-icons);
}

.metaDataTitle {
  color: var(--color-text-light);
}

.metaDataHeader {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
}

.dropDownIcon {
  mask-image: url('src/assets/icons/ChevronBottom.svg');
  background-color: var(--color-button-regular);
}

.metaDataContent {
  display: block;
  position: absolute;
  border-radius: 8px;
  background: var(--color-button-text);
  box-shadow: 0 0 1px 0 rgba(29, 33, 45, 0.20), 0 1px 4px 0 rgba(29, 33, 45, 0.15), 0 16px 32px 0 rgba(29, 33, 45, 0.10);
  left: 0;
  width: 100%;
  z-index: 10;
  border-radius: 4px;
  min-height: 20px;
  padding: 16px 8px 16px 16px;
}

.helperText {
  color: var(--color-neutral-500);
}

.input-small .inputGroup {
  height: 40px;
  min-height: 40px;
}

.input-large .inputGroup {
  height: 50px;
  min-height: 50px;
}
</style>