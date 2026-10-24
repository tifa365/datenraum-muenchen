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
      // Misc
      { 'opacity-60 select-none pointer-events-none cursor-default': props.disabled },
    ],
  }),
  range: {
    class: [
      // Stroke
      'stroke-current',

      // Color
      'stroke-surface-200 dark:stroke-surface-700',

      // Fill
      'fill-none',

      // Transition
      'transition duration-100 ease-in',
    ],
  },
  value: {
    class: [
      // Animation
      'animate-dash-frame',

      // Color
      'stroke-primary-500 dark:stroke-primary-400',

      // Fill
      'fill-none',
    ],
  },
  label: {
    class: [
      // Text Style
      'text-center text-xl',

      // Color
      'fill-surface-600 dark:fill-surface-200',
    ],
  },
}
