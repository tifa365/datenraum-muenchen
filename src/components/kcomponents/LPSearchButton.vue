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

  <router-link :to="dataCatalogRoute">
      <div
              class="button-container">
          <div class="button-content">
              <span :class="{ 'capitalize-text': capitalizeText }">{{ buttonText }}</span>
          </div>
      </div>
  </router-link>
</template>

<script setup>
import {computed} from "vue";

const props = defineProps({
  buttonText: {
    type: String,
    required: true,
  },
  capitalizeText: {
    type: Boolean,
    required: false,
    default: false,
  },
  searchPrompt: {
    type: String,
    required: false
  },
  baseUrl: {
    type: String,
    required: false,
    default: '/data-catalog'
  }
})


const dataCatalogRoute = computed(() => {
    return props.searchPrompt ? `${props.baseUrl}?q=${props.searchPrompt}` : `${props.baseUrl}`;
});
</script>

<style scoped>
.capitalize-text {
  text-transform: uppercase;
}

.button-container {
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  width: max-content;
  display: inline-flex;
  height: 50px;
  padding: 0 32px;
  justify-content: center;
  align-items: center;
  font-family: var(--font-family), serif;
  color: white;
  gap: 8px;
  flex-shrink: 0;
  border: 1px solid var(--color-primary-500);
  border-radius: 4px;
  background: var(--color-primary-500);
}

.button-container:active {
  background: rgba(22, 65, 148, 0.5);
}

.button-content {
  display: flex;
  gap: 8px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
