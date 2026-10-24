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
  <router-link :to="`/app/data-analytics/${appLink}`">
    <div class="heatwave-card">
      <div class="image-container">
        <img
          :src="imagePath"
          alt="Heatwave image"
          class="image" />
      </div>
      <div class="content-container">
        <div>
          <h4 class="provider">{{ provider }}</h4>
          <h3 class="title">{{ title }}</h3>
          <p class="content">{{ content }}</p>
        </div>

        <div class="categories">
          <span
            v-for="(category, index) in categories"
            :key="index"
            class="category">
            {{ category }}
          </span>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DKSRAppTile',
  props: {
    imagePath: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    categories: {
      type: Array,
      required: true,
    },
    appLink: {
      type: String,
      default: '',
      required: true,
    },
  },
})
</script>

<style scoped>
.heatwave-card {
  min-height: 480px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.image-container {
  width: 100%;
  height: 200px;
  border-bottom: 1px solid #e0e0e0;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.provider {
  padding: 0.5rem 1rem 0 1rem;
  color: #667f93;
  font-family: var(--font-family), serif;
  font-size: 0.9rem;
  font-style: normal;
  font-weight: 700;
}

.title {
  padding: 0.25rem 1rem;
  color: #33404a;
  font-family: var(--font-family), serif;
  font-size: 1.15rem;
  font-style: normal;
  font-weight: 600;
}

.content {
  padding: 0.25rem 1rem;
  font-size: 1rem;
  color: #33404a;
  font-family: var(--font-family), serif;
  font-style: normal;
  font-weight: 400;
}

.categories {
  width: 100%;
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

.category {
  color: #111827;
  padding: 4px 8px;
  font-size: 0.875rem;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-darker);
}

@media (min-width: 768px) {
}

@media (min-width: 1024px) {
}
</style>
