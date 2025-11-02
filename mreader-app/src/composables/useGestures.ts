/**
 * Composable for handling touch gestures
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface UseGesturesOptions {
  onTap?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onLongPressStart?: (x: number, y: number) => void
  onLongPressMove?: (x: number, y: number) => void
  onLongPressEnd?: () => void
}

export function useGestures(
  element: Ref<HTMLElement | null>,
  options: UseGesturesOptions
) {
  const touchStartX = ref(0)
  const touchStartY = ref(0)
  const touchStartTime = ref(0)
  const longPressTimer = ref<number | null>(null)
  const isLongPressing = ref(false)
  const currentTouchX = ref(0)
  const currentTouchY = ref(0)

  const TAP_THRESHOLD = 10 // pixels
  const SWIPE_THRESHOLD = 50 // pixels
  const TAP_TIME_THRESHOLD = 300 // ms
  const LONG_PRESS_THRESHOLD = 500 // ms

  function isInteractiveElement(target: HTMLElement): boolean {
    // Check if element or any parent is a button, link, or input
    let current: HTMLElement | null = target
    while (current && current !== element.value) {
      const tagName = current.tagName.toLowerCase()
      if (
        tagName === 'button' ||
        tagName === 'a' ||
        tagName === 'input' ||
        tagName === 'select' ||
        tagName === 'textarea' ||
        (current.hasAttribute('role') && ['button', 'link'].includes(current.getAttribute('role') || ''))
      ) {
        return true
      }
      // Check if element has clickable classes (for ContextPage elements)
      if (current.classList.contains('word') || current.classList.contains('nav-button')) {
        return true
      }
      current = current.parentElement
    }
    return false
  }

  function handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    if (!touch) return

    touchStartX.value = touch.clientX
    touchStartY.value = touch.clientY
    touchStartTime.value = Date.now()
    currentTouchX.value = touch.clientX
    currentTouchY.value = touch.clientY

    // Check if touch target is an interactive element
    const target = e.target as HTMLElement
    if (isInteractiveElement(target)) {
      return
    }

    // Start long press timer
    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value)
    }
    
    longPressTimer.value = window.setTimeout(() => {
      isLongPressing.value = true
      if (options.onLongPressStart) {
        options.onLongPressStart(touch.clientX, touch.clientY)
      }
    }, LONG_PRESS_THRESHOLD)
  }

  function handleTouchMove(e: TouchEvent) {
    const touch = e.touches[0]
    if (!touch) return

    currentTouchX.value = touch.clientX
    currentTouchY.value = touch.clientY

    // If long pressing, notify with current position
    if (isLongPressing.value && options.onLongPressMove) {
      options.onLongPressMove(touch.clientX, touch.clientY)
    }

    // Cancel long press if moved too much
    const deltaX = touch.clientX - touchStartX.value
    const deltaY = touch.clientY - touchStartY.value
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    if (distance > TAP_THRESHOLD && !isLongPressing.value) {
      if (longPressTimer.value) {
        clearTimeout(longPressTimer.value)
        longPressTimer.value = null
      }
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    const touch = e.changedTouches[0]
    if (!touch) return

    // Clear long press timer
    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value)
      longPressTimer.value = null
    }

    // If was long pressing, end it
    if (isLongPressing.value) {
      isLongPressing.value = false
      if (options.onLongPressEnd) {
        options.onLongPressEnd()
      }
      e.preventDefault()
      return
    }

    // Check if touch target is an interactive element
    const target = e.target as HTMLElement
    if (isInteractiveElement(target)) {
      return
    }

    const deltaX = touch.clientX - touchStartX.value
    const deltaY = touch.clientY - touchStartY.value
    const deltaTime = Date.now() - touchStartTime.value
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Check for tap
    if (distance < TAP_THRESHOLD && deltaTime < TAP_TIME_THRESHOLD) {
      // Prevent synthetic click event from firing
      e.preventDefault()
      handleTap()
      return
    }

    // Check for swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
      // Prevent synthetic click event from firing
      e.preventDefault()
      if (deltaX > 0 && options.onSwipeRight) {
        options.onSwipeRight()
      } else if (deltaX < 0 && options.onSwipeLeft) {
        options.onSwipeLeft()
      }
    }
  }

  function handleTap() {
    if (!element.value) return

    if (options.onTap) {
      options.onTap()
    }
  }

  function handleClick(e: MouseEvent) {
    if (!element.value) return

    // Check if click target is an interactive element
    const target = e.target as HTMLElement
    if (isInteractiveElement(target)) {
      return
    }

    if (options.onTap) {
      options.onTap()
    }
  }

  // Mouse event handlers for desktop support
  function handleMouseDown(e: MouseEvent) {
    // Ignore if not left button
    if (e.button !== 0) return

    touchStartX.value = e.clientX
    touchStartY.value = e.clientY
    touchStartTime.value = Date.now()
    currentTouchX.value = e.clientX
    currentTouchY.value = e.clientY

    // Check if target is an interactive element
    const target = e.target as HTMLElement
    if (isInteractiveElement(target)) {
      return
    }

    // Start long press timer
    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value)
    }
    
    longPressTimer.value = window.setTimeout(() => {
      isLongPressing.value = true
      if (options.onLongPressStart) {
        options.onLongPressStart(e.clientX, e.clientY)
      }
    }, LONG_PRESS_THRESHOLD)
  }

  function handleMouseMove(e: MouseEvent) {
    // Only track if mouse button is down
    if (e.buttons !== 1) return

    currentTouchX.value = e.clientX
    currentTouchY.value = e.clientY

    // If long pressing, notify with current position
    if (isLongPressing.value && options.onLongPressMove) {
      options.onLongPressMove(e.clientX, e.clientY)
    }

    // Cancel long press if moved too much
    const deltaX = e.clientX - touchStartX.value
    const deltaY = e.clientY - touchStartY.value
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    if (distance > TAP_THRESHOLD && !isLongPressing.value) {
      if (longPressTimer.value) {
        clearTimeout(longPressTimer.value)
        longPressTimer.value = null
      }
    }
  }

  function handleMouseUp(e: MouseEvent) {
    // Clear long press timer
    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value)
      longPressTimer.value = null
    }

    // If was long pressing, end it
    if (isLongPressing.value) {
      isLongPressing.value = false
      if (options.onLongPressEnd) {
        options.onLongPressEnd()
      }
      e.preventDefault()
      return
    }
  }

  onMounted(() => {
    if (!element.value) return

    element.value.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.value.addEventListener('touchmove', handleTouchMove, { passive: true })
    // touchend cannot be passive since we call preventDefault() to prevent synthetic clicks
    element.value.addEventListener('touchend', handleTouchEnd, { passive: false })
    element.value.addEventListener('click', handleClick)
    
    // Mouse events for desktop
    element.value.addEventListener('mousedown', handleMouseDown)
    element.value.addEventListener('mousemove', handleMouseMove)
    element.value.addEventListener('mouseup', handleMouseUp)
  })

  onUnmounted(() => {
    if (!element.value) return

    element.value.removeEventListener('touchstart', handleTouchStart)
    element.value.removeEventListener('touchmove', handleTouchMove)
    element.value.removeEventListener('touchend', handleTouchEnd)
    element.value.removeEventListener('click', handleClick)
    
    element.value.removeEventListener('mousedown', handleMouseDown)
    element.value.removeEventListener('mousemove', handleMouseMove)
    element.value.removeEventListener('mouseup', handleMouseUp)

    // Clean up any pending timer
    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value)
    }
  })

  return {
    touchStartX,
    touchStartY,
    isLongPressing,
  }
}
