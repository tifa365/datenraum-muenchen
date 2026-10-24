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
  <div
    class="main-container view-header-background"
    :style="{
      'background-image': 'url(' + backgroundImageUrl + ')',
    }">
    <slot name="content-row">
      <Card 
        :cardStyle="cardStyle"
        :cardClass="'main-content-row'"
      >
        <div class="homepage-info">
          <h1 class="title display-sm">{{ title }}</h1>
          <h6 class="subtitle body-lg">{{ subtitle }}</h6>
          <slot name="content"></slot>
        </div>
        <div class="actions">
          <slot name="primary-button"></slot>
          <slot name="secondary-button"></slot>
        </div>
      </Card>
    </slot>
  </div>
</template>

<script setup>
import appConfig from '@config/appConfig'
import Card from '@/components/civora-ui/CIVTransparentCard.vue'
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
})

const backgroundImageUrl = `config/${appConfig.customer.name}/assets/images/${appConfig.components.headerImageFileName}`

// Compute card style based on viewport size
const cardStyle = computed(() => {
  // Default (desktop) styles
  return {
    margin: '42px 62px',
    padding: '32px 24px',
    width: 'calc(100% - 124px)' // Account for margins
  }
})
</script>

<style scoped>
.title {
  color: var(--hero-card-header-text-primary-color);
}

.subtitle {
  color: var(--hero-card-header-text-secondary-color);
}

.main-container {
  width: 100%;
  display: flex;
  justify-content: center;
  background: lightgray
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
    0 -100.205px / cover no-repeat center;
}

.main-content-row {
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  width: 100% !important;
}

.homepage-info {
  display: flex;
  flex: 1;
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

@media screen and (max-width: 1024px) {
  .subtitle {
    max-width: 100%;
  }
  
  .main-content-row {
    margin: 32px 42px !important;
    width: calc(100% - 84px) !important;
  }
}

@media (max-width: 768px) {
  .main-container {
    height: auto;
    padding: 30px 20px;
    justify-content: center;
    align-items: center;
  }
  
  .main-content-row {
    flex-direction: column !important;
    align-items: center;
    margin: 0 !important;
    padding: 24px !important;
    width: 100% !important;
    max-width: 90% !important;
  }

  .homepage-info {
    align-items: center;
    gap: 15px;
    text-align: center;
  }

  .actions {
    flex-direction: row;
    gap: 12px;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .main-container {
    padding: 20px 15px;
  }
  
  .main-content-row {
    padding: 20px 16px !important;
    max-width: 100% !important;
  }

  .actions {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }
}
</style>