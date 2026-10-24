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
  <div class="back-button-panel-container">
    <div
      class="back-button-container"
      @click="goBack">
      <img
        :src="arrowLeft"
        alt="Go back"
        class="back-icon" />
      <div class="back-button-texts">
        <span class="go-back-text">{{ $t('navigation.go-back') }}</span>
        <span class="back-button-divider">|</span>
        <span class="context-text">{{ contextText }}</span>
      </div>
    </div>
    <template v-if="$slots.default">
      <slot />
    </template>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import i18n from '@/i18n.js'

const arrowLeft = 'src/assets/icons/ArrowLeft.svg'

const props = defineProps({
  contextText: {
    type: String,
    required: true,
  },
})

const router = useRouter()

const goBack = () => {
  router.back()
}

const goBackText = i18n.global.t('navigation.go-back')
</script>

<style scoped>
.back-button-panel-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-bg-white);
  border-bottom: 1px solid var(--color-divider);
}

.back-button-container {
  display: flex;
  align-items: center;
  height: 4rem;
  width: max-content;
  cursor: pointer;
  padding: 1rem 1rem;
}

.back-icon {
  margin-right: 1rem;
  width: 24px;
  height: 24px;
}

.back-button-texts {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.go-back-text {
  color: var(--color-primary-500);
  font-family: var(--font-family), serif;
  font-size: 1rem;
  font-style: normal;
  font-weight: 600;
}
.context-text {
  color: var(--color-primary-500);
  font-family: var(--font-family), serif;
  font-size: 1.15rem;
  font-style: normal;
  font-weight: 600;
}

.back-button-divider {
  color: var(--color-primary-500);
  font-family: var(--font-family), serif;
  font-size: 1.5rem;
  font-style: normal;
  font-weight: 500;
  text-transform: uppercase;
}

@media (max-width: 1032px) {
  .back-button-container {
    height: 3rem;
  }

  .go-back-text {
    font-size: 0.85rem;
  }
  .context-text {
    font-size: 1rem;
  }

  .back-button-divider {
    font-size: 1.15rem;
  }
}
</style>
