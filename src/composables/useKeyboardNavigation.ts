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

import { nextTick, toValue, type MaybeRefOrGetter } from "vue"

export function useListBoxKeyboardNavigation(
  isOpen: MaybeRefOrGetter<boolean>,
  getFocusableItems: MaybeRefOrGetter<HTMLElement[]>,
  openListBox: () => void,
  closeListBox: () => void,
) {

  const focusItemRelativeToCurrent = (offset: number) => {
    if (!toValue(isOpen)) {
      return
    }

    const items = toValue(getFocusableItems)
    const activeElement = document.activeElement as HTMLElement
    const currentIndex = items.indexOf(activeElement)

    if (currentIndex !== -1) {
      const newIndex = Math.max(0, Math.min(
        currentIndex + offset, items.length - 1))
      items[newIndex].focus()
    }
  }

  const focusFirstItem = () => {
    if (!toValue(isOpen)) {
      return
    }

    const items = toValue(getFocusableItems)
    if (items.length > 0) {
      items[0].focus()
    }
  }

  const focusLastItem = () => {
    if (!toValue(isOpen)) {
      return
    }

    const items = toValue(getFocusableItems)
    if (items.length > 0) {
      items[items.length - 1].focus()
    }
  }

  const selectFocusedItem = () => {
    const activeElement = document.activeElement as HTMLElement
    if (activeElement?.matches('[role="option"]')) {
      activeElement.click()
    }
  }

  const handleKeydownButton = (event: KeyboardEvent) => {
    switch(event.key) {
      case 'ArrowDown':
        event.preventDefault()
        openListBox()
        nextTick(() => {
          focusFirstItem()
        })
        break
      case 'ArrowUp':
        event.preventDefault()
        openListBox()
        nextTick(() => {
          focusLastItem()
        })
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (!toValue(isOpen)) {
          openListBox()
        } else {
          closeListBox()
        }
        break
      case 'Escape':
        if (toValue(isOpen)) {
          event.preventDefault()
          closeListBox()
        }
        break
    }
  }

  const handleKeydownListBox = (event: KeyboardEvent) => {
    switch(event.key) {
      case 'ArrowUp':
        event.preventDefault()
        focusItemRelativeToCurrent(-1)
        break
      case 'ArrowDown':
        event.preventDefault()
        focusItemRelativeToCurrent(1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        selectFocusedItem()
        break
      case 'Escape':
        event.preventDefault()
        closeListBox()
        break
      case 'Tab':
        closeListBox()
        break
      case 'Home':
        event.preventDefault()
        focusFirstItem()
        break
      case 'End':
        event.preventDefault()
        focusLastItem()
        break
      case 'PageUp':
        event.preventDefault()
        focusItemRelativeToCurrent(-5)
        break
      case 'PageDown':
        event.preventDefault()
        focusItemRelativeToCurrent(5)
        break
    }
  }

  return {
    handleKeydownButton,
    handleKeydownListBox,
  }
}