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

import {
  and, isDateControl, isDateTimeControl, isEnumControl, isMultiLineControl, isOneOfEnumControl,
  isStringControl, isTimeControl, not, rankWith, type JsonFormsRendererRegistryEntry,
} from '@jsonforms/core'
// @ts-expect-error Vue SFC types are not resolved here.
import CIVStringControlRenderer from './CIVStringControlRenderer.vue'

// Rank 2 > vanilla string (1); enum (vanilla 2) and oneOf-enum (5) are excluded explicitly.
export const civStringControlEntry: JsonFormsRendererRegistryEntry = {
  renderer: CIVStringControlRenderer,
  tester: rankWith(
    2,
    and(
      isStringControl,
      not(isEnumControl),
      not(isOneOfEnumControl),
      not(isDateControl),
      not(isDateTimeControl),
      not(isTimeControl),
      not(isMultiLineControl),
    ),
  ),
}
