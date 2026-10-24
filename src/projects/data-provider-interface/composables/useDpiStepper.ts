/*
 * This file is part of Civora UI.
 *
 * Copyright (C) 2025 DKSR GmbH.
 *
 * Civora UI is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { provide, ref, computed } from 'vue';
import { dpiStepperKey } from '../utils/injectionKeys';
import useSteps from '../utils/useSteps.js';

/**
 * Provides the stepper state and methods to manage stepper.
 */
export function useDpiStepper() {
  const { steps, activeStep, stepPlugin, visitedSteps } = useSteps();
  const stepList = ref([] as string[]);
  const activeStepIndex = computed(() => stepList.value.indexOf(activeStep.value));
  
  const previousStep = computed(() => {
    const previousStepIndex = activeStepIndex.value - 1;
    if (previousStepIndex >= 0) {
      return stepList.value[previousStepIndex];
    }
    return '';
  });

  const nextStep = computed(() => {
    const nextStepIndex = activeStepIndex.value + 1;
    if (nextStepIndex < stepList.value.length) {
      return stepList.value[nextStepIndex];
    }
    return '';
  });

  const registerStep = (stepName: string) => {
    if (!stepList.value.includes(stepName)) {
      stepList.value.push(stepName);
    }
  };

  const goToNextStep = () => {
    const nextStepIndex = activeStepIndex.value + 1;
    if (nextStepIndex < stepList.value.length) {
      activeStep.value = stepList.value[nextStepIndex];
    }
  }

  const goToPreviousStep = () => {
    const previousStepIndex = activeStepIndex.value - 1;
    if (previousStepIndex >= 0) {
      activeStep.value = stepList.value[previousStepIndex];
    }
  }

  const goToStep = (stepName: string) => {
    if (stepList.value.includes(stepName)) {
      activeStep.value = stepName;
    }
  }

  const goToStepByIndex = (index: number) => {
    if (index >= 0 && index < stepList.value.length) {
      activeStep.value = stepList.value[index];
    }
  }

  provide(dpiStepperKey, {
    steps,
    activeStep,
    registerStep,
  });

  return {
    steps,
    activeStep,
    activeStepIndex,
    previousStep,
    nextStep,
    visitedSteps,
    stepPlugin,
    stepList,
    registerStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    goToStepByIndex,
  }
}