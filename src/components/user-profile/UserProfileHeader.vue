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
  <div
    class="main-container"
    :style="{ 'background-image': 'url(' + backgroundImageUrl + ')' }">
    <div class="content-row">
      <div class="user-photo">
        <span class="user-initials">{{ userInitials }}</span>
      </div>
    </div>
  </div>
  <div class="empty-space"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import appConfig from '@config/appConfig'
const authStore = useAuthStore()

let userInitials = ref('UI')
const props = defineProps({})

onMounted(() => {
  userInitials.value = authStore.user.parsedToken?.given_name[0] + authStore.user.parsedToken?.family_name[0]
})
const backgroundImageUrl = `config/${appConfig.customer.name}/assets/images/${appConfig.components.headerImageFileName}`
</script>

<style scoped>
.empty-space {
  width: 100%;
  height: 100px;
}
.user-initials {
  color: #33404a;
  text-align: center;
  font-family: var(--font-family), serif;
  font-size: 62px;
  font-style: normal;
  font-weight: 600;
  line-height: 78px;
}
.user-photo {
  bottom: -82px;
  position: absolute;
  background: white;
  height: 164px;
  width: 164px;
  border-radius: 82px;
  border: 4px solid #667f93;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.main-container {
  position: relative;
  height: 360px;
  width: 100%;
  display: flex;
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
    0 0 / cover no-repeat;
}

.content-row {
  padding: 0 128px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: end;
}

@media (max-width: 768px) {
  .main-container {
    height: auto;
    min-height: 128px;
    padding: 20px;
  }

  .content-row {
    flex-direction: column;
    align-items: center;
    padding: 20px;
    text-align: center;
  }
}
</style>
