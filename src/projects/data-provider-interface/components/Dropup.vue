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
   <div class="btn-group dropup" v-if="(show && !isCatalog) || (show && isCatalog && isOperator)">
      <button type="button" class="dpi-menu-dropup-btn btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      {{ groupName }} <span class="caret"></span>
      </button>
      <ul class="dropdown-menu">
         <li v-for="item in groupItems" :key="item.key" :data-cy="item.key">
            <!-- Menu items are either buttons or router-link -->
            <!-- depending if they have a 'to' or 'handler' property -->
            <component
              :is="item.handler ? 'a' : 'router-link'"
              class="dropdown-item"
              :class="{ 'disabled': item.disabled }"
              :to="item.to || { name: 'Datasets' }"
              :href="item.handler ? '#' : ''"
              @click="item.handler ? item.handler() : null"
            >
              {{ item.name }}
            </component>
        </li>
      </ul>
   </div>
</template>

<script>
export default {
  name: 'Dropup',
  props: {
    groupName: {
      type: String,
    },
    groupItems: {
      type: Array,
    },
    show: {
      type: Boolean,
    },
    isCatalog: {
      type: Boolean,
    },
    isOperator: {
      type: Boolean,
    }
  },
};
</script>

<style lang="scss" scoped>
button.dpi-menu-dropup-btn {
  color:white;
}
</style>