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
      //Font
      'text-xs font-bold',

      //Alignments
      'inline-flex items-center justify-center',

      //Spacing
      'px-2 py-1',

      //Shape
      {
        'rounded-md': !props.rounded,
        'rounded-full': props.rounded,
      },

      //Colors
      'text-white dark:text-surface-900',
      {
        'bg-primary-500 dark:bg-primary-400': props.severity == null || props.severity == 'primary',
        'bg-green-500 dark:bg-green-400': props.severity == 'success',
        'bg-blue-500 dark:bg-blue-400': props.severity == 'info',
        'bg-orange-500 dark:bg-orange-400': props.severity == 'warning',
        'bg-red-500 dark:bg-red-400': props.severity == 'danger',
      },
    ],
  }),
  value: {
    class: 'leading-normal',
  },
  icon: {
    class: 'mr-1 text-sm',
  },
}
