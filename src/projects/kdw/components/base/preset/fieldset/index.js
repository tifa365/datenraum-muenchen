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
      'block',

      // Spacing
      'px-4 pt-2 py-3',
      'inline-size-min',

      // Shape
      'rounded-md',
      // Color
      'border border-surface-200 dark:border-surface-700',
      'bg-surface-0 dark:bg-surface-900',
      'text-surface-700 dark:text-surface-0/80',
    ],
  },
  legend: ({ props }) => ({
    class: [
      // Font
      'font-bold',
      'leading-none',

      //Spacing
      { 'p-0': props.toggleable, 'p-5': !props.toggleable },

      // Shape
      'rounded-md',

      // Color
      'text-surface-700 dark:text-surface-0/80',
      'border border-surface-200 dark:border-surface-700',
      'bg-surface-50 dark:bg-surface-900',

      // Transition
      'transition-none',

      // States
      {
        'hover:bg-surface-100 hover:border-surface-200 hover:text-surface-900 dark:hover:text-surface-0/80 dark:hover:bg-surface-800/80':
          props.toggleable,
      },
    ],
  }),
  toggler: ({ props }) => ({
    class: [
      // Alignments
      'flex items-center justify-center',
      'relative',

      //Spacing
      { 'p-5': props.toggleable },

      // Shape
      { 'rounded-md': props.toggleable },

      // Color
      { 'text-surface-700 dark:text-surface-200 hover:text-surface-900': props.toggleable },

      // States
      { 'hover:text-surface-900 dark:hover:text-surface-100': props.toggleable },
      {
        'focus-visible:outline-none focus-visible:outline-offset-0 focus-visible:ring focus-visible:ring-inset focus-visible:ring-primary-400/50 dark:focus-visible:ring-primary-300/50':
          props.toggleable,
      },

      // Misc
      {
        'transition-none cursor-pointer overflow-hidden select-none': props.toggleable,
      },
    ],
  }),
  togglerIcon: {
    class: 'mr-2 inline-block',
  },
  legendTitle: {
    class: 'flex items-center justify-center leading-none',
  },
  content: {
    class: 'p-5',
  },
  transition: {
    enterFromClass: 'max-h-0',
    enterActiveClass: 'overflow-hidden transition-[max-height] duration-1000 ease-[cubic-bezier(0.42,0,0.58,1)]',
    enterToClass: 'max-h-[1000px]',
    leaveFromClass: 'max-h-[1000px]',
    leaveActiveClass: 'overflow-hidden transition-[max-height] duration-[450ms] ease-[cubic-bezier(0,1,0,1)]',
    leaveToClass: 'max-h-0',
  },
}
