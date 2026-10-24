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
      // Flex
      'flex items-center justify-center',

      // Shape
      'first:rounded-l-md',
      'last:rounded-r-md',
      'border-y',

      'last:border-r',
      'border-l',
      'border-r-0',

      // Space
      'p-3',

      // Size
      'min-w-[3rem]',

      // Color
      'bg-surface-50 dark:bg-surface-800',
      'text-surface-600 dark:text-surface-400',
      'border-surface-300 dark:border-surface-600',
    ],
  },
}
