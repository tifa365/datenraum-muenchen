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
  <div class="card-container">
    <CIVTag
      v-for="tag in props.tags"
      class="card-tag"
      :key="tag"
      :hasCloseIcon="false"
      :hasDotIcon="false"
      size="small"
      :text="tag"
    />
    <div class="card-title-container">
      <CIVMaskedIcon
        v-if="props.icon"
        class="card-title-icon"
        :svgIcon="props.icon"
      />
      <div class="card-title-texts">
        <span
          v-if="props.titleLabel"
          class="card-title-label body-lg">
          {{ props.titleLabel }}
        </span>
        <span
          v-if="props.title"
          class="card-title-title title-md">
          {{ props.title }}
        </span>
      </div>
    </div>
    <div
      v-if="props.description"
      class="card-description body-lg">
      {{ props.description }}
    </div>
    <div
      v-for="{ label, content } in props.infoPairs"
      :key="label"
      class="card-info-pairs body-md">
      <div class="card-info-pair">
        <span class="card-info-pair-label">
          {{ label + ':' }}
        </span>
        <span class="card-info-pair-content">
          {{ content ?? '/' }}
        </span>
      </div>
    </div>
    <div
      v-if="props?.leftButton || props?.rightButton"
      class="card-buttons-container">
      <CIVButton
        v-if="props?.leftButton"
        class="card-button"
        type="secondary"
        :iconPrefix="props?.leftButton?.iconPrefix"
        :iconSuffix="props?.leftButton?.iconSuffix"
        :label="props?.leftButton?.label"
        @click="emit('leftButtonClick')"
      />
      <CIVButton
        v-if="props?.rightButton"
        class="card-button"
        type="primary"
        :iconPrefix="props?.rightButton?.iconPrefix"
        :iconSuffix="props?.rightButton?.iconSuffix"
        :label="props?.rightButton?.label"
        @click="emit('rightButtonClick')"
      />
    </div>
  </div>
</template>

<script setup>
import CIVButton from '@/components/civora-ui/CIVButton.vue';
import CIVMaskedIcon from '@/components/civora-ui/CIVMaskedIcon.vue';
import CIVTag from '@/components/civora-ui/CIVTag.vue';

const props = defineProps({
  // string array
  tags: {
    type: Array,
    required: false
  },
  icon: {
    type: String,
    required: false
  },
  titleLabel: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false,
  },
  // array of objects of the form
  // { label, content }
  infoPairs: {
    type: Array,
    required: false,
  },
  // object with props to
  // pass to CIVBUtton
  // { iconPrefix, iconSuffix, label }
  leftButton: {
    type: Object,
    required: false
  },
  rightButton: {
    type: Object,
    required: false
  }
})

const emit = defineEmits(['leftButtonClick', 'rightButtonClick'])
</script>

<style scoped>
.card-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 312;
  max-width: 420px;
  flex: 1;
  padding: 22px 25px;
  gap: 24px;
  border-radius: 8px;
  border: 1px solid var(--color-divider);
  background: var(--color-bg-white);
}

.card-container:hover {
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.04), 0 4px 10px 0 rgba(0, 0, 0, 0.08);
}

.card-tag {
  position: absolute;
  right: 17px;
  top: 21px;
}

.card-title-container {
  display: flex;
  align-self: stretch;
}

.card-title-icon {
  display: flex;
  width: 40px;
  height: 40px;
  padding: 8px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  border: 1px solid var(--color-divider);
  background: var(--color-bg-darker);
}

.card-title-texts {
  display: flex;
  height: 55px;
  flex-direction: column;
  align-items: flex-start;
}

.card-title-label {
  color: var(--color-text-muted);
}

.card-title-title {
  color: var(--color-text-regular);
}

.card-description {
  color: var(--color-text-muted)
}

.card-info-pairs {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  align-self: stretch;
  gap: 8px;
  color: var(--color-text-light);
}

.card-info-pair {
  display: flex;
  align-items: center;
  align-self: stretch;
  justify-content: space-between;
  gap: 20px;
}

.card-buttons-container {
  display: flex;
  padding: 16px 0 8px 0;
  justify-content: stretch;
  align-items: center;
  gap: 16px;
  align-self: stretch;
  border-top: 1px solid var(--color-divider);
}

.card-button {
  flex: 1 0 0;
  align-items: center;
  justify-content: center;
}
</style>