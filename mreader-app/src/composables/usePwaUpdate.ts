import { useRegisterSW } from 'virtual:pwa-register/vue'
import { onUnmounted } from 'vue'

/**
 * Composable for handling PWA updates
 * 
 * Provides functionality to detect and apply service worker updates,
 * especially important for iOS where automatic updates don't work well.
 * 
 * @returns Object containing update state and control functions
 */
export function usePwaUpdate() {
  let updateCheckInterval: ReturnType<typeof setInterval> | null = null
  
  const {
    needRefresh,
    offlineReady,
    updateServiceWorker
  } = useRegisterSW({
    onRegisteredSW(swUrl: string, registration: ServiceWorkerRegistration | undefined) {
      console.log('Service Worker registered:', swUrl)
      
      // Check for updates periodically (every hour)
      if (registration) {
        updateCheckInterval = setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000) // 1 hour
      }
    },
    onRegisterError(error: Error) {
      console.error('Service Worker registration error:', error)
    },
    immediate: true
  })
  
  // Clean up interval on component unmount
  onUnmounted(() => {
    if (updateCheckInterval) {
      clearInterval(updateCheckInterval)
    }
  })
  
  // Update function that triggers service worker update
  const updateApp = async () => {
    await updateServiceWorker(true)
  }
  
  // Dismiss the update notification
  const dismissUpdate = () => {
    needRefresh.value = false
  }
  
  return {
    needRefresh,
    offlineReady,
    updateApp,
    dismissUpdate
  }
}
