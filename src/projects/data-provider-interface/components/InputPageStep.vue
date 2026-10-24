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
  <section :class="{ activeSection: isActive }" v-show="isActive">
    <FormKit type="group" :id="props.name" :name="props.name" :ref="props.name">
      <slot />
    </FormKit>
  </section>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue';
import { dpiStepperKey } from '../utils/injectionKeys';

const props = defineProps<{
  name: string;
}>();

const dpiStepper = inject(dpiStepperKey);

if (!dpiStepper) {
  throw new Error('dpiStepper is not provided. Please make sure to use this component inside InputPage');
}

dpiStepper.registerStep(props.name);

const isActive = computed(() => dpiStepper.activeStep.value === props.name);

const {
  activeStep,
} = dpiStepper;
</script>

<style scoped></style>