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
  root: ({ context }) => ({
    class: [
      // Font
      'font-bold font-sans',
      'text-xs leading-5',

      // Alignment
      'flex items-center justify-center',
      'text-center',

      // Position
      'absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 origin-top-right',

      // Size
      'm-0',
      {
        'p-0': context.nogutter || context.dot,
        'px-2': !context.nogutter && !context.dot,
        'min-w-[0.5rem] w-2 h-2': context.dot,
        'min-w-[1.5rem] h-6': !context.dot,
      },

      // Shape
      {
        'rounded-full': context.nogutter || context.dot,
        'rounded-[10px]': !context.nogutter && !context.dot,
      },

      // Color
      'text-white dark:text-surface-900',
      {
        'bg-primary-500 dark:bg-primary-400':
          !context.info &&
          !context.success &&
          !context.warning &&
          !context.danger &&
          !context.help &&
          !context.secondary,
        'bg-surface-500 dark:bg-surface-400': context.secondary,
        'bg-green-500 dark:bg-green-400': context.success,
        'bg-blue-500 dark:bg-blue-400': context.info,
        'bg-orange-500 dark:bg-orange-400': context.warning,
        'bg-purple-500 dark:bg-purple-400': context.help,
        'bg-red-500 dark:bg-red-400': context.danger,
      },
    ],
  }),
}
