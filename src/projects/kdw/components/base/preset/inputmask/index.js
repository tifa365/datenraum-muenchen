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
      'font-sans leading-none',

      // Spacing
      'm-0 p-3',

      // Colors
      'text-surface-600 dark:text-surface-200',
      'placeholder:text-surface-400 dark:placeholder:text-surface-500',
      'bg-surface-0 dark:bg-surface-900',
      'border border-surface-300 dark:border-surface-600',

      // States
      {
        'hover:border-primary-500 dark:hover:border-primary-400': !context.disabled,
        'focus:outline-none focus:outline-offset-0 focus:ring focus:ring-primary-500/50 dark:focus:ring-primary-400/50':
          !context.disabled,
        'opacity-60 select-none pointer-events-none cursor-default': context.disabled,
      },

      // Misc
      'rounded-md',
      'appearance-none',
      'transition-colors duration-200',
    ],
  }),
}
