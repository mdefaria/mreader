/**
 * Composable for handling touch gestures
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface UseGesturesOptions {
  onTap?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export function useGestures(
  element: Ref<HTMLElement | null>,
  options: UseGesturesOptions
) {
  const touchStartX = ref(0)
  const touchStartY = ref(0)
  const touchStartTime = ref(0)

  const TAP_THRESHOLD = 10 // pixels
  const SWIPE_THRESHOLD = 50 // pixels
  const TAP_TIME_THRESHOLD = 300 // ms

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
  }

  function handleTouchEnd(e: TouchEvent) {
    const touch = e.changedTouches[0]
    if (!touch) return

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

  onMounted(() => {
    if (!element.value) return

    element.value.addEventListener('touchstart', handleTouchStart, { passive: true })
    // touchend cannot be passive since we call preventDefault() to prevent synthetic clicks
    element.value.addEventListener('touchend', handleTouchEnd, { passive: false })
    element.value.addEventListener('click', handleClick)
  })

  onUnmounted(() => {
    if (!element.value) return

    element.value.removeEventListener('touchstart', handleTouchStart)
    element.value.removeEventListener('touchend', handleTouchEnd)
    element.value.removeEventListener('click', handleClick)
  })

  return {
    touchStartX,
    touchStartY,
  }
}
