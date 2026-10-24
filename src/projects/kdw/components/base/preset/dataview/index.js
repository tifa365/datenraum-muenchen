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
  content: {
    class: [
      // Spacing
      'p-0',

      // Shape
      'border-0',

      // Color
      'text-surface-700 dark:text-white/80',
      'bg-surface-0 dark:bg-surface-800',
    ],
  },
  grid: {
    class: [
      // flex
      'flex flex-wrap',

      // Spacing
      'ml-0 mr-0 mt-0',

      // Color
      'bg-surface-0 dark:bg-surface-800',
    ],
  },
  header: {
    class: [
      'font-bold',

      // Spacing
      'p-4',

      // Color
      'text-surface-800 dark:text-white/80',
      'bg-surface-50 dark:bg-surface-800',
      'border-surface-200 dark:border-surface-700 border-y',
    ],
  },
}
