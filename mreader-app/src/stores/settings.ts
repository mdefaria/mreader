/**
 * Settings store - manages user preferences and theme
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Theme, FontFamily, UserSettings } from '@/types'
import { storage } from '@/services/storage'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const theme = ref<Theme>('light')
  const fontFamily = ref<FontFamily>('system')
  const fontSize = ref(16)
  const showProsodyHints = ref(true)
  const wpm = ref(250)
  const prosodySensitivity = ref(0.7)
  const autoSave = ref(true)
  const isLoaded = ref(false)

  // Load settings from storage
  async function loadSettings() {
    const settings = await storage.getUserSettings()
    theme.value = settings.theme
    fontFamily.value = settings.fontFamily
    fontSize.value = settings.fontSize
    showProsodyHints.value = settings.showProsodyHints
    wpm.value = settings.wpm
    prosodySensitivity.value = settings.prosodySensitivity
    autoSave.value = settings.autoSave
    isLoaded.value = true
    
    // Apply theme to document
    applyTheme()
  }

  // Save settings to storage
  async function saveSettings() {
    const settings: UserSettings = {
      theme: theme.value,
      fontFamily: fontFamily.value,
      fontSize: fontSize.value,
      showProsodyHints: showProsodyHints.value,
      wpm: wpm.value,
      prosodySensitivity: prosodySensitivity.value,
      autoSave: autoSave.value,
    }
    await storage.setUserSettings(settings)
  }

  // Apply theme to document root
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme.value)
    document.documentElement.style.setProperty('--font-family', getFontFamilyValue())
    document.documentElement.style.setProperty('--font-size', `${fontSize.value}px`)
  }

  // Get CSS font-family value
  function getFontFamilyValue(): string {
    const fontMap: Record<FontFamily, string> = {
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      serif: 'Georgia, "Times New Roman", serif',
      'sans-serif': 'Arial, Helvetica, sans-serif',
      monospace: '"Courier New", Courier, monospace',
      dyslexic: 'OpenDyslexic, sans-serif',
    }
    return fontMap[fontFamily.value]
  }

  // Update theme
  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    applyTheme()
    if (autoSave.value) saveSettings()
  }

  // Update font
  function setFontFamily(newFont: FontFamily) {
    fontFamily.value = newFont
    applyTheme()
    if (autoSave.value) saveSettings()
  }

  // Update font size
  function setFontSize(size: number) {
    fontSize.value = Math.max(12, Math.min(32, size))
    applyTheme()
    if (autoSave.value) saveSettings()
  }

  // Update WPM
  function setWpm(newWpm: number) {
    wpm.value = Math.max(100, Math.min(1000, newWpm))
    if (autoSave.value) saveSettings()
  }

  // Update prosody sensitivity
  function setProsodySensitivity(sensitivity: number) {
    prosodySensitivity.value = Math.max(0, Math.min(1, sensitivity))
    if (autoSave.value) saveSettings()
  }

  // Toggle prosody hints
  function toggleProsodyHints() {
    showProsodyHints.value = !showProsodyHints.value
    if (autoSave.value) saveSettings()
  }

  // Auto-save on changes
  watch(
    [theme, fontFamily, fontSize, wpm, prosodySensitivity, showProsodyHints],
    () => {
      if (isLoaded.value && autoSave.value) {
        saveSettings()
      }
    }
  )

  return {
    // State
    theme,
    fontFamily,
    fontSize,
    showProsodyHints,
    wpm,
    prosodySensitivity,
    autoSave,
    isLoaded,
    
    // Actions
    loadSettings,
    saveSettings,
    setTheme,
    setFontFamily,
    setFontSize,
    setWpm,
    setProsodySensitivity,
    toggleProsodyHints,
    applyTheme,
  }
})
