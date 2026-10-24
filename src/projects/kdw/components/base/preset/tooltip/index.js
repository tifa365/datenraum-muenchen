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
  root: ({ context, props }) => ({
    class: [
      // Position and Shadows
      'absolute',
      'shadow-md',
      'p-fadein',
      // Spacing
      {
        'py-0 px-1':
          context?.right || context?.left || (!context?.right && !context?.left && !context?.top && !context?.bottom),
        'py-1 px-0': context?.top || context?.bottom,
      },
    ],
  }),
  arrow: ({ context, props }) => ({
    class: [
      // Position

      'absolute',

      // Size
      'w-0',
      'h-0',

      // Shape
      'border-transparent',
      'border-solid',
      {
        'border-y-[0.25rem] border-r-[0.25rem] border-l-0 border-r-surface-600':
          context?.right || (!context?.right && !context?.left && !context?.top && !context?.bottom),
        'border-y-[0.25rem] border-l-[0.25rem] border-r-0 border-l-surface-600': context?.left,
        'border-x-[0.25rem] border-t-[0.25rem] border-b-0 border-t-surface-600': context?.top,
        'border-x-[0.25rem] border-b-[0.25rem] border-t-0 border-b-surface-600': context?.bottom,
      },

      // Spacing
      {
        '-mt-1 ': context?.right || (!context?.right && !context?.left && !context?.top && !context?.bottom),
        '-mt-1': context?.left,
        '-ml-1': context?.top || context?.bottom,
      },
    ],
  }),
  text: {
    class: [
      'p-3',
      'bg-surface-600 dark:bg-surface-700',
      'text-white',
      'leading-none',
      'rounded-md',
      'whitespace-pre-line',
      'break-words',
    ],
  },
}
