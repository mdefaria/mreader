/**
 * Composable for handling touch gestures
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface UseGesturesOptions {
  onTapTop?: () => void
  onTapBottom?: () => void
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

    const deltaX = touch.clientX - touchStartX.value
    const deltaY = touch.clientY - touchStartY.value
    const deltaTime = Date.now() - touchStartTime.value
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Check for tap
    if (distance < TAP_THRESHOLD && deltaTime < TAP_TIME_THRESHOLD) {
      handleTap(touch.clientY)
      return
    }

    // Check for swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX > 0 && options.onSwipeRight) {
        options.onSwipeRight()
      } else if (deltaX < 0 && options.onSwipeLeft) {
        options.onSwipeLeft()
      }
    }
  }

  function handleTap(clientY: number) {
    if (!element.value) return

    const rect = element.value.getBoundingClientRect()
    const relativeY = clientY - rect.top
    const isTopHalf = relativeY < rect.height / 2

    if (isTopHalf && options.onTapTop) {
      options.onTapTop()
    } else if (!isTopHalf && options.onTapBottom) {
      options.onTapBottom()
    }
  }

  function handleClick(e: MouseEvent) {
    if (!element.value) return

    const rect = element.value.getBoundingClientRect()
    const relativeY = e.clientY - rect.top
    const isTopHalf = relativeY < rect.height / 2

    if (isTopHalf && options.onTapTop) {
      options.onTapTop()
    } else if (!isTopHalf && options.onTapBottom) {
      options.onTapBottom()
    }
  }

  onMounted(() => {
    if (!element.value) return

    element.value.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.value.addEventListener('touchend', handleTouchEnd, { passive: true })
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
