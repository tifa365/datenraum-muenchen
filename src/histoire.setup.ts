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

import { defineSetupVue3 } from '@histoire/plugin-vue'
import PrimeVue from 'primevue/config'
import Lara from './projects/kdw/components/base/preset/index.js'
import GlobalWrapper from './.histoire/GlobalWrapper.vue'

import './projects/kdw/assets/tailwind.css'
import './projects/kdw/assets/base.css'
import '@fontsource-variable/inter'
import '@fontsource-variable/inter/standard.css'

// Specify axis and style

export const setupVue3 = defineSetupVue3(({ app, addWrapper }) => {
  // Vue plugin
  app.use(PrimeVue, {
    unstyled: true,
    pt: Lara,
  })

  addWrapper(GlobalWrapper)
})
