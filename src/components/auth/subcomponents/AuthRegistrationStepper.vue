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
  <div class="stepper-container">
    <div class="step-circle">1</div>
    <span class="step-line"></span>
    <span class="step-line"></span>
    <div class="step-circle">2</div>
  </div>
</template>

<script>
export default {
  name: 'AuthRegistrationStepper',
}
</script>

<style scoped>
.completed {
  background: #15aa7a !important;
}
.stepper-container {
  padding-bottom: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
.step-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  width: 32px;
  height: 32px;
  background: #667f93;
  color: #fff;

  font-family: var(--font-family), serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px; /* 111.111% */
}

.step-line {
  background: #667f93;
  height: 4px;
  width: 74px;
}
</style>
