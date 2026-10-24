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
  <div v-if="target === '_blank'"
    class="quick-link-wrapper">
    <a
      :href="route"
      :target="target"
      class="quick-link-tile">
      <div class="left-icon">
        <img :src="iconUrl" alt="Icon" />
      </div>
      <div class="right-content">
        <h3 class="title">{{ title }}</h3>
        <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
      </div>
    </a>
  </div>
  <div v-else class="high-z-index quick-link-wrapper">
  <RouterLink
    :to="route"
    class="quick-link-tile ">
    <div class="left-icon">
      <img
        :src="iconUrl"
        alt="Icon" />
    </div>
    <div class="right-content">
      <h3 class="title">{{ title }}</h3>
      <p
        v-if="subtitle"
        class="subtitle">
        {{ subtitle }}
      </p>
    </div>
  </RouterLink>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';

const props = defineProps({
  iconUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: false,
  },
  route: {
    type: String,
    required: true,
  },
  target: {
    type: String,
    default: '_self',
  },
})
</script>

<style scoped>
a {
  z-index: 10;
  position: relative
}

.high-z-index {
  z-index: 10;
  position: relative;
}
.quick-link-wrapper {
  flex: 1;
}
.quick-link-tile {
  display: flex;
  align-items: center;
  flex: 1;
  text-decoration: none;
  color: inherit;
  background-color: #fff;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition:
    box-shadow 0.2s ease-in-out,
    transform 0.2s ease-in-out;
  border-radius: 0.5rem;
  height: auto;
  border: 2px solid var(--color-border);
  z-index: 2;
}

.quick-link-tile:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
}

.left-icon {
  width: 5.5rem;
  height: 100%;
  background-color: #1e3a8a;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.left-icon img {
  min-width: 44px;
  min-height: 44px;
}

.right-content {
  padding: 0 1rem;
  flex-grow: 1;
}

.title {
  color: #1a2025;
  font-family: var(--font-family), serif;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.6rem;
}

.subtitle {
  color: #1a2025;
  font-family: var(--font-family), serif;
  font-size: 0.85rem;
  font-weight: 400;
  line-height: 1.25rem;
}

@media (max-width: 1032px) {
  .quick-link-tile {
    flex-grow: 1;
    height: 3.5rem;
  }

  .left-icon {
    width: 3.5rem;
    padding: 1rem;
  }

  .right-content {
    padding: 0.5rem;
  }

  .subtitle {
    display: none;
  }

  .left-icon img {
    min-width: 36px;
    min-height: 36px;
  }
}

@media (max-width: 700px) {
  .quick-link-tile {
    background-color: #1e3a8a;
    flex-direction: row;
    align-items: center;
    flex-grow: unset !important;
    height: 3.5rem;
    justify-content: center;
  }

  .left-icon {
    width: 3.5rem;
    height: 3.5rem;
    padding: 0.75rem;
  }

  .right-content {
    display: none;
  }

  .left-icon img {
    width: 1.75rem;
    height: 1.75rem;
  }

  .left-icon img {
    min-width: 32px;
    min-height: 32px;
  }
}
</style>
