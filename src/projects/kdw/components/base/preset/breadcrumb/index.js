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
      // Shape
      'rounded-md',

      // Spacing
      'p-4',

      // Color
      'bg-surface-0 dark:bg-surface-700',
      'border border-surface-200 dark:border-surface-700',

      // Misc
      'overflow-x-auto',
    ],
  },
  menu: {
    class: [
      // Flex & Alignment
      'flex items-center flex-nowrap',

      // Spacing
      'm-0 p-0 list-none leading-none',
    ],
  },
  action: {
    class: [
      // Flex & Alignment
      'flex items-center',

      // Shape
      'rounded-md',

      // Color
      'text-surface-600 dark:text-white/70',

      // States
      'focus-visible:outline-none focus-visible:outline-offset-0',
      'focus-visible:ring focus-visible:ring-primary-400/50 dark:focus-visible:ring-primary-300/50',

      // Transitions
      'transition-shadow duration-200',

      // Misc
      'text-decoration-none',
    ],
  },
  icon: {
    class: 'text-surface-600 dark:text-white/70',
  },
  separator: {
    class: [
      // Flex & Alignment
      'flex items-center',

      // Spacing
      ' mx-2',

      // Color
      'text-surface-600 dark:text-white/70',
    ],
  },
}
