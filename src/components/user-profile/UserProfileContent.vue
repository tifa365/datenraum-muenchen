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
  <div class="main-container">
    <div class="user-info-column">
      <h3 class="user-info-title">{{ $t('user-profile.up-content.title-about') }}</h3>
      <div class="input-wrapper">
        <label for="name">{{ $t('user-profile.up-content.label-name') }}</label>
        <input
          v-model="name"
          placeholder="Max Mustermann"
          class="input-field"
          type="text"
          id="name"
          disabled="disabled"
          name="name" />
      </div>
      <div class="input-wrapper">
        <label for="email">{{ $t('user-profile.up-content.label-email') }}</label>
        <input
          v-model="email"
          placeholder="maxmustermann@gmx.de"
          class="input-field"
          type="text"
          id="email"
          autocomplete="email"
          disabled="disabled"
          name="email" />
      </div>
      <div class="links-section">
        <a class='user-edit-links' :href="userLinks" target='_blank'>{{ $t('user-profile.up-content.edit-personal-info') }}</a>
        <a class='user-edit-links' :href="`${userLinks}/groups`" target='_blank'>{{ $t('user-profile.up-content.view-access-rights')
          }}</a>
      </div>
      <!-- <div class="input-wrapper">
        <label for="telephone">{{ $t('user-profile.up-content.label-telephone') }}</label>
        <input
          v-model="telephoneNumber"
          placeholder="0431 3643953"
          class="input-field"
          type="text"
          id="telephone"
          disabled="disabled"
          name="telephone" />
      </div>
      <div class="input-wrapper">
        <label for="department">{{ $t('user-profile.up-content.label-department') }}</label>
        <input
          v-model="department"
          placeholder="HR"
          class="input-field"
          type="text"
          id="department"
          disabled="disabled"
          name="department" />
      </div>
      <div class="input-wrapper">
        <label for="organization">{{ $t('user-profile.up-content.label-organization') }}</label>
        <input
          v-model="organization"
          placeholder="Mainzer Stadtwerke"
          class="input-field"
          type="text"
          id="organization"
          disabled="disabled"
          name="organization" />
      </div> -->
      <h3 class="user-info-title">{{ $t('user-profile.up-content.title-login') }}</h3>
      <div class="input-wrapper">
        <label for="username">{{ $t('user-profile.up-content.label-username') }}</label>
        <input
          v-model="username"
          placeholder="maxmustermann"
          class="input-field"
          type="text"
          id="username"
          disabled="disabled"
          name="username" />
      </div>
      <div style="display: flex; gap: 16px; flex-direction: column; padding: 4rem 3rem 8rem">
        <AuthButton
          :button-text="$t('user-profile.up-content.button-logout')"
          :can-proceed="true"
          @click="authStore.logout()"></AuthButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { onMounted, ref } from 'vue'
import AuthButton from '@/components/auth/subcomponents/AuthButton.vue'
import appConfig from '@config/appConfig'

const authStore = useAuthStore()

const userLinks = `${appConfig.keycloakUrl}/realms/${appConfig.keycloakRealm}/account`

let email = ref('')
let name = ref('')
let username = ref('')
let organization = ref('')
let department = ref('')
let telephoneNumber = ref('')

onMounted(() => {
  email.value = authStore.user.parsedToken?.email
  name.value = authStore.user.parsedToken?.given_name + ' ' + authStore.user.parsedToken?.family_name
  username.value = authStore.user.username ?? ''
  organization.value =
    authStore.user.parsedToken?.organization !== 'true' ? authStore.user.parsedToken?.organization : ''
  department.value = authStore.user.parsedToken?.department !== 'true' ? authStore.user.parsedToken?.department : ''
  telephoneNumber.value =
    authStore.user.parsedToken?.telephone_number !== 'true' ? authStore.user.parsedToken?.telephone_number : ''
})
</script>

<style scoped>
.main-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.user-info-column {
  width: 800px;
  padding: 3rem 2rem;
}
.user-info-title {
  color: var(--color-primary-500);
  font-family: var(--font-family), serif;
  font-size: 1.125rem;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
  padding-bottom: 1.5rem;
}
input[class='input-field'] {
  padding-left: 1rem;
  color: black;
  font-family: var(--font-family), serif;
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
}

.input-wrapper label {
  color: #33404a;
  font-family: var(--font-family), serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 26px;
}

.input-wrapper {
  padding-bottom: 1.5rem;
}

.input-field {
  width: 100%;
  height: 50px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background: #fff;
}

.input-field::placeholder {
  color: #667f93;
}

.links-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 1.5rem;
}

.links-section .user-edit-links {
  color: var(--color-info-700);
  text-decoration: underline;
}
</style>
