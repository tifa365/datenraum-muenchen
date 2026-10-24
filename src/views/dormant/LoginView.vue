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
  <div class="auth-content">
    <AuthLogin></AuthLogin>
  </div>
</template>

<script>
import AuthLogin from '@/components/auth/AuthLogin.vue'

export default {
  name: 'AuthView',
  components: { AuthLogin },
}
</script>

<style scoped>
.auth-content {
  height: 100dvh;
  width: 100dvw;
  background: url('/src/assets/images/auth-background.png') lightgray 50% / cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
