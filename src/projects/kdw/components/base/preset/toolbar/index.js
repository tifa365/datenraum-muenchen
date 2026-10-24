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
      // Flex & Alignment
      'flex items-center justify-between flex-wrap',
      'gap-2',

      // Spacing
      'p-5',

      // Shape
      'rounded-md',

      // Color
      'bg-surface-50 dark:bg-surface-800',
      'border border-surface-200 dark:border-surface-700',
    ],
  },
  start: {
    class: 'flex items-center',
  },
  center: {
    class: 'flex items-center',
  },
  end: {
    class: 'flex items-center',
  },
}
