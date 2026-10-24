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
  root: ({ props, parent }) => ({
    class: [
      // Font
      {
        'text-xl': props.size == 'large',
        'text-2xl': props.size == 'xlarge',
      },

      // Alignments
      'inline-flex items-center justify-center',
      'relative',

      // Sizes
      {
        'h-8 w-8': props.size == null || props.size == 'normal',
        'w-12 h-12': props.size == 'large',
        'w-16 h-16': props.size == 'xlarge',
      },
      { '-ml-4': parent.instance.$style?.name == 'avatargroup' },

      // Shapes
      {
        'rounded-lg': props.shape == 'square',
        'rounded-full': props.shape == 'circle',
      },
      { 'border-2': parent.instance.$style?.name == 'avatargroup' },

      // Colors
      'bg-surface-300 dark:bg-surface-700',
      { 'border-white dark:border-surface-800': parent.instance.$style?.name == 'avatargroup' },
    ],
  }),
  image: {
    class: 'h-full w-full',
  },
}
