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

<!-- @deprecated, use CIVViewHeader instead -->
<template>
  <div class="main-container view-header-background" :style="{
    'background-image': 'url(' + backgroundImageUrl + ')',
  }">
    <Card>
      <div class="homepage-info">
        <h1 class="title display-sm">{{ title }}</h1>
        <h6
          v-if="!enableMarkdown"
          class="subtitle body-lg">
          {{ subtitle }}
        </h6>
        <CIVMarkdown v-else
          class="subtitle body-lg"
          :content="subtitle"
        />
        <slot name="tertiary-button"></slot>
      </div>
      <div class="actions">
        <slot name="primary-button"></slot>
        <slot name="secondary-button"></slot>
      </div>
    </Card>
  </div>
</template>

<script setup>
import appConfig from '@config/appConfig'
import CIVMarkdown from '@/components/civora-ui/CIVMarkdown.vue'
import Card from '@/components/civora-ui/CIVTransparentCard.vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  enableMarkdown: {
    type: Boolean,
    default: false
  },
})

const backgroundImageUrl = `config/${appConfig.customer.name}/assets/images/${appConfig.components.headerImageFileName}`
</script>

<style scoped>
.title {
  color: var(--hero-card-header-text-primary-color);
  white-space: normal;
  overflow-wrap: break-word;
  word-break: break-word;
}

.subtitle {
  color: var(--hero-card-header-text-secondary-color);
}

.main-container {
  min-height: 360px;
  height: auto;
  width: 100%;
  display: flex;
  /* background: lightgray
    linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.48) 1.83%,
      rgba(0, 0, 0, 0.48) 19.92%,
      rgba(0, 0, 0, 0.34) 40.44%,
      rgba(0, 0, 0, 0.28) 55.42%,
      rgba(0, 0, 0, 0.23) 69.12%,
      rgba(0, 0, 0, 0.14) 92.15%,
      rgba(0, 0, 0, 0) 130.66%
    )
    0 -100.205px / cover no-repeat; */
}

.content-row {
  padding: 32px 24px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin: 42px 62px;
}

.homepage-info {
  display: flex;
  flex-direction: column;
  gap: 30px;
  justify-content: center;
  align-items: start;
}

.actions {
  gap: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
}

@media (max-width: 768px) {

  .content-row {
    flex-direction: column;
    align-items: center;
    padding: 20px;
    text-align: center;

    margin: 20px;
  }

  .homepage-info {
    align-items: center;
    gap: 15px;
  }

  .actions {
    flex-direction: row;
    gap: 12px;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
  }
}

@media (max-width: 480px) {
  .actions {
    flex-direction: column;
    gap: 8px;
  }
}

</style>
