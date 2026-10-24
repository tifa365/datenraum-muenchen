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
  root: ({ props }) => ({
    class: [
      // Flex & Alignment
      'flex items-center justify-center',

      // Positioning
      {
        sticky: props.target === 'parent',
        fixed: props.target === 'window',
      },
      'bottom-[20px] right-[20px]',
      'ml-auto',

      // Shape & Size
      {
        'rounded-md h-8 w-8': props.target === 'parent',
        'h-12 w-12 rounded-full shadow-md': props.target === 'window',
      },

      // Color
      'text-white dark:text-surface-900',
      {
        'bg-primary-500 dark:bg-primary-400 hover:bg-primary-600 dark:hover:bg-primary-300': props.target === 'parent',
        'bg-surface-500 dark:bg-surface-400 hover:bg-surface-600 dark:hover:bg-surface-300': props.target === 'window',
      },

      // States
      {
        'hover:bg-primary-600 dark:hover:bg-primary-300': props.target === 'parent',
        'hover:bg-surface-600 dark:hover:bg-surface-300': props.target === 'window',
      },
    ],
  }),
  transition: {
    enterFromClass: 'opacity-0',
    enterActiveClass: 'transition-opacity duration-150',
    leaveActiveClass: 'transition-opacity duration-150',
    leaveToClass: 'opacity-0',
  },
}
