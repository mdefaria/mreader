<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="needRefresh" class="update-prompt" role="alertdialog" aria-labelledby="update-title">
        <div class="update-content">
          <div class="update-text">
            <h3 id="update-title">Update Available</h3>
            <p>A new version of mreader is available. Refresh to update.</p>
          </div>
          <div class="update-actions">
            <button 
              class="dismiss-button" 
              @click="dismissUpdate"
              aria-label="Dismiss update notification"
            >
              Later
            </button>
            <button 
              class="update-button" 
              @click="updateApp"
              aria-label="Update app now"
            >
              Update Now
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Offline ready notification -->
    <Transition name="fade">
      <div v-if="offlineReady && !needRefresh" class="offline-ready" role="status">
        App ready to work offline
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { usePwaUpdate } from '@/composables/usePwaUpdate'

const { needRefresh, offlineReady, updateApp, dismissUpdate } = usePwaUpdate()
</script>

<style scoped>
.update-prompt {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  max-width: 500px;
  width: 90%;
}

.update-content {
  background: var(--bg-primary);
  border: 2px solid var(--accent-color);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.update-text h3 {
  margin: 0 0 0.5rem;
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
}

.update-text p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.update-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.dismiss-button,
.update-button {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 90px;
}

.dismiss-button {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.dismiss-button:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.update-button {
  background: var(--accent-color);
  color: white;
}

.update-button:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.offline-ready {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 9998;
  animation: fade-out 3s ease-in-out forwards;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translate(-50%, 20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fade-out {
  0%, 80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .update-prompt {
    bottom: 1rem;
    width: calc(100% - 2rem);
  }

  .update-content {
    padding: 1.25rem;
  }

  .update-text h3 {
    font-size: 1rem;
  }

  .update-text p {
    font-size: 0.875rem;
  }

  .update-actions {
    flex-direction: column;
  }

  .dismiss-button,
  .update-button {
    width: 100%;
    min-width: 0;
  }

  .offline-ready {
    bottom: 1rem;
    font-size: 0.875rem;
    padding: 0.625rem 1.25rem;
  }
}
</style>
