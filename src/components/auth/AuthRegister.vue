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
    <div class="register-content">
      <AuthRegistrationStepper></AuthRegistrationStepper>
      <div
        class="first-form"
        v-show="activeForm === 'first'">
        <h2 class="welcome">Herzlich Wilkommen!</h2>
        <h4 class="welcome-description">
          Bitte geben Sie Ihre Daten ein. Sie erhalten nach Abschluss eine Email auf die von Ihnen hinterlegte
          Email-Adresse.
        </h4>
        <form ref="register-form">
          <div class="input-row">
            <div class="input-wrapper">
              <label for="email">Vorame</label>
              <input
                v-model="name"
                placeholder="Ralf"
                class="input-field"
                type="text"
                id="text"
                autocomplete="text"
                name="name" />
            </div>
            <div class="input-wrapper">
              <label for="email">Nachname</label>
              <input
                v-model="surname"
                placeholder="Felix"
                class="input-field"
                type="text"
                id="surname"
                name="surname" />
            </div>
          </div>
          <div class="input-row">
            <div class="input-wrapper">
              <label for="email">Hierarchische Einordnung</label>
              <DKSRDropdown
                :items="['test', 'test2']"
                v-model="classification"
                placeholder="Abteilungsleiter"></DKSRDropdown>
            </div>
            <div class="input-wrapper">
              <label for="email">Funktionsbezeichnung</label>
              <input
                v-model="role"
                placeholder="Smart City Experte"
                class="input-field"
                type="text"
                id="role"
                name="role" />
            </div>
          </div>
          <div class="input-wrapper">
            <label for="email">Unternehmen</label>
            <DKSRDropdown
              :items="['test', 'test2']"
              v-model="company"
              placeholder="Musterunternehmen"></DKSRDropdown>
          </div>
        </form>
        <div>
          <span class="text-span"
            >Deine Organisation ist noch nicht dabei? Dann
            <router-link to="/registration"><span class="link-span">melde dich</span></router-link></span
          ><span class="text-span"> bei uns!</span>
        </div>

        <div class="actions">
          <AuthTextButton
            prefix="src/assets/icons/ChevronLeft.svg"
            button-text="Zurück"
            route="/"
            :click="handleBack"></AuthTextButton>
          <AuthNormalButton
            button-text="Weiter"
            :can-proceed="canProceed()"
            :click="proceed"></AuthNormalButton>
        </div>

        <div>
          <span class="text-span"
            >Du hast bereits ein Konto?
            <router-link to="/registration"><span class="link-span">Jetzt Anmelden!</span></router-link></span
          >
        </div>
      </div>
      <div
        class="first-form"
        v-show="activeForm === 'second'">
        <h2 class="welcome">Deine Anmeldedaten</h2>
        <h4 class="welcome-description">
          Bitte gib deine Email und erstelle ein Passwort. <br />Mit diesen Daten kannst du dich auf deine Plattform
          einloggen.
        </h4>
        <form ref="register-form">
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
          <div class="input-wrapper">
            <label for="email">Passwort bestätigen</label>
            <input
              v-model="repeatPassword"
              placeholder="••••••••••"
              class="input-field"
              type="password"
              id="password-r"
              name="password-r" />
          </div>
          <div class="checkbox-entry">
            <input
              type="checkbox"
              id="newsletter-signup"
              name="newsletter-signup"
              v-model="newsletterSignup"
              checked />
            <label for="newsletter-signup"
              >KDW Newsletter abonnieren und Infos über neue Funktionen oder Teilnehmerorganisationen erhalten</label
            >
          </div>
        </form>

        <div class="actions">
          <AuthTextButton
            prefix="src/assets/icons/ChevronLeft.svg"
            button-text="Zurück"
            route="/"
            :click="handleBack"></AuthTextButton>
          <AuthNormalButton
            button-text="Registrieren"
            :can-proceed="canProceed()"
            :click="proceed"></AuthNormalButton>
        </div>

        <div>
          <span class="text-span"
            >Du hast bereits ein Konto?
            <router-link to="/registration"><span class="link-span">Jetzt Anmelden!</span></router-link></span
          >
        </div>
      </div>
      <div
        class="third-form"
        v-show="activeForm === 'third'">
        <h2 class="welcome">Vielen Dank, ihre Registrierungsanfrage wurde abgeschickt</h2>
        <h4 class="welcome-description">Wir schicken Ihnen im Anschluss eine Email mit Ihren Log-in Daten.</h4>
        <img
          class="mailbox-image"
          src="../../assets/images/mailbox.png"
          alt="mailbox image" />
        <AuthNormalButton
          button-text="Zurück zur Startseite"
          :can-proceed="true"
          :click="proceed"></AuthNormalButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import DKSRDropdown from '@/components/auth/subcomponents/AuthDropdown.vue'
import { ref } from 'vue'
import AuthNormalButton from '@/components/auth/subcomponents/AuthNormalButton.vue'
import AuthTextButton from '@/components/auth/subcomponents/AuthTextButton.vue'
import AuthRegistrationStepper from '@/components/auth/subcomponents/AuthRegistrationStepper.vue'

const activeForm = ref('first')
const name = ref('')
const surname = ref('')
const classification = ref(null)
const role = ref('')
const company = ref(null)

const email = ref('')
const password = ref('')
const repeatPassword = ref('')
const newsletterSignup = ref(false)
const loginForm = ref(null)

const selected = ref('')

const handleLogin = () => {
  const formData = new FormData(loginForm.value)
  const formObject = {}
  formData.forEach((value, key) => {
    formObject[key] = value
  })
  console.log(formObject)
}

const proceed = () => {
  if (activeForm.value === 'first') {
    activeForm.value = 'second'
  } else if (activeForm.value === 'second') {
    activeForm.value = 'third'
  } else if (activeForm.value === 'third') {
    activeForm.value = 'first'
  }
  // if (canProceed()) {
  //   activeForm.value = 'second'
  // }
}

const handleBack = () => {
  if (activeForm.value === 'first') {
    console.log('already on first one')
  } else {
    activeForm.value = 'second'
  }
}

const canProceed = () => {
  return (
    name.value.length > 0 &&
    surname.value.length > 0 &&
    role.value.length > 0 &&
    classification.value != null &&
    company.value != null
  )
}
</script>

<style scoped>
.actions {
  padding: 32px 0;
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
  justify-content: end;
}
.input-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

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
  color: #1a2025;
  font-family: var(--font-family), serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px; /* 142.857% */
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
  padding-inline: 16px;
  text-align: center;
}

.welcome-description {
  color: #1a2025;
  text-align: center;
  font-family: var(--font-family), serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: 32px;
  padding-bottom: 40px;
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
  width: 864px;
  height: 836px;
  padding: 40px 0;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  flex-shrink: 0;
  justify-content: center;
  background: #fff;
}

.register-content {
  padding: 0 64px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: start;
}

.third-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
  flex: 1;
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

.mailbox-image {
  padding: 102px 0;
}
</style>
