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

import { isEnumControl, rankWith, type JsonFormsRendererRegistryEntry } from '@jsonforms/core'
import renderer from './CIVEnumControlRenderer.vue'

// Vanilla EnumControlRenderer uses rank 2; 5 outranks it.
export const civEnumControlEntry: JsonFormsRendererRegistryEntry = {
  renderer,
  tester: rankWith(5, isEnumControl),
}
