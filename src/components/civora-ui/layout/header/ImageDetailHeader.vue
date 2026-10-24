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
  <div class="header view-header-background"
    :style="{ 'background-image': `url(${props.backgroundImage})` }">
    <div class="header-content">
      <CIVCardImage
        :logo="props.logoImage"
        :categories="props.categories"
        :url="props.website"
        class="civ-image-detail-header-card"
      />
      <CIVCardBasic
        :title="props.title"
        :description="props.description"
        :compactMode="true"
        :cardStyle="{ height: '100%' }"
        class="civ-image-detail-header-card"
      >
        <template #footer>
          <div class="contact-container">
            <h3 class="contact-label title-md">{{ $t('organisation.contact') }}</h3>
            <h2 class="contact-content body-lg">
              <a
                v-if="props.contact?.email"
                :href="`mailto:${props.contact.email}`"
              >
                {{ props.contact?.name ? props.contact?.name : props.contact.email }}
              </a>

              <span v-else>
                {{ props.contact?.name ? props.contact?.name : '/' }}
              </span>
            </h2>
          </div>
        </template>
      </CIVCardBasic>
    </div>
  </div>
</template>

<script setup>
import CIVCardBasic from './CIVCardBasic.vue'
import CIVCardImage from './CIVCardImage.vue'

const props = defineProps({
  backgroundImage: {
    type: String,
  },
  logoImage: {
    type: String,
  },
  categories: {
    // string array
    type: Array,
  },
  website: {
    type: String
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  contact: {
    type: Object,
  }
})
</script>

<style scoped>
.header {
  display: flex;
  background-repeat: no-repeat;
  color: var(--hero-card-header-text-secondary-color);
}

.header-content {
  width: 100%;
  margin: 40px;
  gap: 1rem;
  display: flex;
  align-items: end;
  justify-content: center;
}

.civ-image-detail-header-card {
  align-self: stretch;
  height: 512px;
}

.contact-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 10px;
  margin-top: auto;
}

.contact-label {
  color: var(--hero-card-header-text-secondary-color);
  margin-top: auto;
}

.contact-content {
  color: var(--hero-card-header-text-secondary-color);
  margin-top: 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
  }
}
</style>
