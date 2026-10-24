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
    <div class="login-content">
      <h2 class="welcome">Herzlich Wilkommen!</h2>
      <form ref="loginForm">
        <div class="input-wrapper">
          <label for="email">Email address</label>
          <input
            v-model="email"
            placeholder="maxmustermann@gmx.de"
            class="input-field"
            type="text"
            id="email"
            autocomplete="email"
            name="email" />
        </div>
        <div class="input-wrapper">
          <label for="email">Passwort</label>
          <input
            v-model="password"
            placeholder="••••••••••"
            class="input-field"
            type="password"
            id="password"
            name="password" />
        </div>
        <div class="checkbox-entry">
          <input
            type="checkbox"
            id="stay-logged-in"
            name="stay-logged-in"
            v-model="stayLoggedIn"
            checked />
          <label for="stay-logged-in">Eingeloggt bleiben</label>
        </div>
      </form>
      <div class="login-button">
        <AuthButton
          button-text="Anmelden"
          :can-proceed="canProceed()"
          @click="handleLogin"></AuthButton>
      </div>
      <div>
        <span class="text-span"
          >Noch kein Konto?
          <router-link to="/registration"><span class="link-span">Registrieren!</span></router-link></span
        >
      </div>
      <div>
        <a
          href="#"
          class="text-span"
          >Passwort zurücksetzen</a
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import AuthButton from '@/components/auth/subcomponents/AuthButton.vue'
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const stayLoggedIn = ref(false)
const loginForm = ref(null)

const handleLogin = () => {
  const formData = new FormData(loginForm.value)
  const formObject = {}
  formData.forEach((value, key) => {
    formObject[key] = value
  })
  console.log(formObject)
}

const canProceed = () => {
  return email.value.length > 0 && password.value.length > 0
}
</script>

<style scoped>
.login-button {
  padding-top: 70px;
  padding-bottom: 30px;
}
.checkbox-entry {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;
  gap: 12px;
}
input[type='checkbox'] {
  width: 24px;
  height: 24px;
}
.welcome {
  color: #1a2025;
  font-family: var(--font-family), serif;
  font-size: 36px;
  font-style: normal;
  font-weight: 500;
  line-height: 45px;
  padding-bottom: 42px;
  width: 190px;
}
input[class='input-field'] {
  padding-left: 16px;
  color: black;
  font-family: var(--font-family), serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
}
.main-container {
  display: flex;
  width: 640px;
  padding: 124px 48px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  background: #fff;
}

.login-content {
  width: 100%;
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

.input-wrapper label {
  color: #33404a;
  font-family: var(--font-family), serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 26px;
}

.input-wrapper {
  padding-bottom: 32px;
}

.text-span {
  color: #667f93;
  font-family: var(--font-family), serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 26px; /* 162.5% */
}

.link-span {
  color: #164194;
  font-family: var(--font-family), serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 26px;
}
</style>
