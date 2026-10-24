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
    class: [{ 'opacity-60 select-none pointer-events-none cursor-default': props.disabled }],
  }),
  button: ({ context }) => ({
    class: [
      'relative',
      // Font
      'leading-none',

      // Flex Alignment
      'inline-flex items-center align-bottom text-center',

      // Spacing
      'px-4 py-3',

      // Shape
      'border border-r-0',
      'first:rounded-l-md first:rounded-tr-none first:rounded-br-none',
      'last:border-r last:rounded-tl-none last:rounded-bl-none last:rounded-r-md',

      // Color
      {
        'bg-surface-0 dark:bg-surface-900': !context.active,
        'text-surface-700 dark:text-white/80': !context.active,
        'border-surface-200 dark:border-surface-700': !context.active,
        'bg-primary-500 dark:bg-primary-400 border-primary-500 dark:border-primary-400 text-white dark:text-surface-900':
          context.active,
      },

      // States
      'focus:outline-none focus:outline-offset-0 focus:ring focus:ring-primary-400/50 dark:focus:ring-primary-300/50 focus:z-10',
      {
        'hover:bg-surface-50 dark:hover:bg-surface-800/80': !context.active,
        'hover:bg-primary-600 dark:hover:bg-primary-300': context.active,
      },
      { 'opacity-60 select-none pointer-events-none cursor-default': context.disabled },
      // Transition
      'transition duration-200',

      // Misc
      'cursor-pointer select-none overflow-hidden',
    ],
  }),
  label: {
    class: 'font-bold',
  },
}
