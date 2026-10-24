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
  <RouterLink
    v-if="!isExternalRoute"
    :to="route"
    v-slot="{ href, navigate, isActive, isExactActive }">
    <a
      class="header-icon-container"
      :class="{ active: isActive && isExactActive && isQueryActive }"
      :href="href"
      @click="navigate">
      <img
        class="header-icon"
        :src="icon"
        :alt="alt" />
    </a>
  </RouterLink>
  <a
    v-else
    class="header-icon-container"
    :href="route"
    target="_blank">
    <img
      class="header-icon"
      :src="icon"
      :alt="alt" />
  </a>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  route: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: 'Icon',
  },
})

const vroute = useRoute()
const isQueryActive = computed(() => {
  return vroute.fullPath === props.route
})

const isExternalRoute = computed(() => {
  return !!props.route && URL.parse(props.route, location.origin).origin !== location.origin
})
</script>

<style scoped>
.header-icon-container {
  width: 40px;
  height: 40px;
  border: 1px solid #d4dde3;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.active {
  background-color: #f4f6f9;
}

.header-icon {
  width: 24px;
  height: 24px;
}

.header-icon-container:hover {
  background-color: #f4f6f9;
}
</style>
