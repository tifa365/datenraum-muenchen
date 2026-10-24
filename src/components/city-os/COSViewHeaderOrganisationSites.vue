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
  <div class="header" :style="{ 'background-image': 'url(' + organisation.backgroundImage + ')' }">
    <!-- First Card: Logo and Categories -->
    <Card cardClass="card-logo"
      :cardStyle="{ maxHeight: '454px', minWidth: '300px', maxWidth: '800px', }">
      <div class="card-content">
        <div class="card-logo-container">
          <img :src="organisation.logo" alt="Organisation logo" class="organization-logo" />
        </div>
        <div class="categories-container">
          <h3 class="categories-label title-md">{{ $t('organisation.categoriesOfData') }}</h3>
          <div class="badges-container">
            <template v-if="organisation.categories && organisation.categories.length > 0">
              <CIVTag v-for="(category, index) in organisation.categories" tone="neutral" :hasDotIcon="false"
                :hasHomeIcon="false" :hasCloseIcon="false" :text="category" :key="index">
              </CIVTag>
            </template>
            <template v-else>
              <span class="title-md empty-badge">/</span>
            </template>
          </div>
        </div>
        <div class="section" v-if="organisation.website">
          <h3 class="section-title title-md">{{ $t('organisation.website') }}</h3>
          <a 
            v-if="organisation.website" 
            :href="organisation.website" 
            class="website-link body-lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ organisation.website }}
          </a>
        </div>
      </div>
    </Card>

    <!-- Second Card: Title and Description -->
    <Card cardClass="card-info" :cardStyle="{ height: '454px', flex: '1 1 auto' }">
      <div class="homepage-info">
        <h1 class="title display-sm">{{ organisation.title }}</h1>
        <CIVMarkdown
          class="description-container body-lg"
          :content="organisation.description ?? ''"
        />
        <div class="contact-container">
          <h3 class="contact-label title-md">{{ $t('organisation.contact') }}</h3>
          <h2 class="contact-content body-lg">{{ organisation.contact?.name ? organisation.contact?.name : '/' }}</h2>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import Card from '@/components/civora-ui/CIVTransparentCard.vue'
import CIVMarkdown from '@/components/civora-ui/CIVMarkdown.vue'
import CIVTag from '@/components/civora-ui/CIVTag.vue'

defineProps({
  organisation: {
    type: Object,
    required: true,
  }
})
</script>

<style scoped>
.header {
  display: flex;
  flex-direction: row;
  color: #33404a;
  padding: 32px;
  min-height: 300px;
  gap: 20px;
  background-size: cover;
}

.card-logo-container {
  width: 100%;
  height: 190px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-logo-container .organization-logo {
  max-height: 100%;
  width: 100%;
  max-width: 100%;
  object-fit: contain;
  transition: transform 0.2s ease;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 24px;
}

.categories-container {
  width: 100%;
}

.categories-label {
  color: var(--hero-card-header-text-secondary-color);
}

.badges-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.empty-badge {
  color: var(--color-text-light);
}

.homepage-info {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* Fill the card */
  padding: 20px;
  /* Add padding inside the card */
  box-sizing: border-box;
  /* Include padding in height calculation */
}

.title {
  color: var(--hero-card-header-text-primary-color);
  margin-top: 0;
  margin-bottom: 16px;
}

.contact-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 10px;
}
.contact-label {
  color: var(--hero-card-header-text-secondary-color);
  margin-top: 0;

}

.contact-content {
  color: var(--hero-card-header-text-secondary-color);
  margin-top: 0;
}

.description-container {
  color: var(--hero-card-header-text-secondary-color);
  flex-grow: 1;
  overflow-y: auto;
  min-height: 0;
  padding-bottom: 1rem;
  padding-right: 5px;
  position: relative;
  -webkit-overflow-scrolling: touch;
  /* Smooth scrolling on iOS */

  /* Fade effect at the bottom */
  mask-image: linear-gradient(to bottom, black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 90%, transparent 100%);

  /* Custom Scrollbar Styles */

  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.4) rgba(0, 0, 0, 0.1);

}
.description-container::-webkit-scrollbar {
  width: 8px;
}

.description-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.description-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.description-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.6);
}

.section {
  width: 100%;
}

.section-title {
  margin-bottom: 4px;
  color: var(--hero-card-header-text-secondary-color);
}

.website-link {
  color: var(--hero-card-header-text-secondary-color);
  text-decoration: none;
  word-break: break-word;
}

.website-link:hover {
  text-decoration: underline;
}

@media (max-width: 1200px) {
  .header {
    gap: 16px;
  }
}

@media (max-width: 992px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 15px;
  }

  .card-content {
    flex-direction: column;
    align-items: center;
  }

  .card-logo-container {
    margin-right: 0;
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 10px;
  }

  .card-logo-container {
    padding: 5px;
  }

  .description-container {
    line-height: 1.5;
    /* Slightly tighter line height on small screens */
    padding-right: 5px;
    max-width: 100%;
    margin-right: 0;
    /* Remove negative margin */
    height: 250px;
    /* Set explicit height for small screens */
    width: auto;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    /* Smooth scrolling on iOS */
  }
}

</style>
