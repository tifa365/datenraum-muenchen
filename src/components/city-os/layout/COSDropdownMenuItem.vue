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
  <router-link
    :to="route"
    class="dropdown-menu-container"
    :class="{ active: isActiveRoute }">
    <div class="dropdown-menu-item">
      <span
        v-if="iconActive && iconInactive"
        class="item-icon">
        <img
          :src="isActiveRoute ? iconActive : iconInactive"
          alt="icon" />
      </span>
      <span class="item-title">{{ title }}</span>
    </div>
  </router-link>
</template>

<script>
export default {
  name: 'COSDropdownMenuItem',
  props: {
    route: {
      type: [String, Object],
      required: true,
    },
    iconActive: {
      type: String,
      default: '',
    },
    iconInactive: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
    },
  },
  computed: {
    isActiveRoute() {
      return this.$route.fullPath === this.$router.resolve(this.route).fullPath
    },
  },
}
</script>

<style scoped>
.dropdown-menu-item {
  display: flex;
  align-items: center;
  padding: 16px 8px;
  cursor: pointer;
  user-select: none;
  text-decoration: none;
  color: inherit;
}

.dropdown-menu-item:last-child {
  border-bottom: none;
}

.dropdown-menu-container.active {
  background: yellow;
}

.item-icon {
  margin-right: 16px;
}

.item-icon img {
  width: 24px;
  height: 24px;
}

.item-title {
  color: #33404a;
  font-family: var(--font-family), serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
}
</style>
