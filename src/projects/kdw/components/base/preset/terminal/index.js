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

export default {
  root: {
    class: [
      // Spacing
      'p-5',

      // Shape
      'rounded-md',

      // Color
      'bg-surface-900 text-white',
      'border border-surface-700',

      // Sizing & Overflow
      'h-72 overflow-auto',
    ],
  },
  container: {
    class: [
      // Flexbox
      'flex items-center',
    ],
  },
  prompt: {
    class: [
      // Color
      'text-surface-400',
    ],
  },
  response: {
    class: [
      // Color
      'text-primary-400',
    ],
  },
  command: {
    class: [
      // Color
      'text-primary-400',
    ],
  },
  commandtext: {
    class: [
      // Flexbox
      'flex-1 shrink grow-0',

      // Shape
      'border-0',

      // Spacing
      'p-0',

      // Color
      'bg-transparent text-inherit',

      // Outline
      'outline-none',
    ],
  },
}
