Project: mreader – RSVP speed‑reading PWA

Summary: A minimalist offline-capable RSVP reader with prosody-enriched text presentation. Users load local text files (txt/epub/pdf planned); app tokenizes into words and displays them sequentially at adjustable WPM with prosody-based timing. Hybrid mode: while playing shows single-word RSVP; when paused shows contextual page view with current word highlighted (click to jump). Screen gestures: bottom half toggles play/pause; top half opens settings (auto-pauses). Settings modal controls WPM, visual theme (light/dark/book), font choices, and prosody sensitivity. PWA-first with optional Capacitor wrapper for app stores. All processing client-side; optional LLM API for prosody analysis.

Tech Stack:

Vue 3 + TypeScript
Vite (fast dev server, HMR)
Pinia (state management)
vite-plugin-pwa (autoUpdate)
IndexedDB via idb library (book storage)
Scoped CSS + CSS variables (theming)
No Vue Router initially (conditional rendering)
Capacitor (optional, for app store distribution)
Deployment: static (S3 + CloudFront or Netlify/Vercel)
Core Files:

src/App.vue: Root component, theme provider
src/views/LibraryView.vue: Book list, upload/import, management
src/views/ReaderView.vue: Main reader interface, gesture handling
src/components/RsvpDisplay.vue: Word-by-word RSVP presentation with prosody
src/components/ContextPage.vue: Contextual page view when paused
src/components/SettingsModal.vue: WPM, theme, font, prosody controls
src/components/BookUploader.vue: Drag-drop file upload interface
src/stores/reader.ts: Pinia store for reader state
src/stores/library.ts: Pinia store for book library
src/utils/tokenize.ts: Tokenizer with prosody analysis
src/utils/prosody.ts: Rule-based prosody logic (pauses, emphasis)
src/services/storage.ts: IndexedDB wrapper for books/settings
src/types/index.ts: TypeScript interfaces
State Model (Pinia stores): Reader Store:

currentBook: Book | null
words: Word[] (computed from tokenized text)
currentIndex: number
isPlaying: boolean
wpm: number (100-1000)
prosodySensitivity: number (0-1)
Library Store:

books: Book[]
selectedBookId: string | null
Settings Store:

theme: 'light' | 'dark' | 'book'
fontFamily: string
fontSize: number
showProsodyHints: boolean
Types:

TypeScript
interface Word {
  text: string
  pivotIndex: number
  baseDelayMs: number
  prosody?: {
    pause?: number // multiplier for delay
    emphasis?: 'low' | 'medium' | 'high'
    tone?: 'rising' | 'falling' | 'neutral'
  }
}

interface Book {
  id: string
  title: string
  content: string
  lastPosition: number
  prosodyData?: ProsodyData
  addedAt: Date
}
Playback Loop:

requestAnimationFrame with scheduled timing
Base delay: 60000 / wpm
Prosody adjustments: punctuation pauses, emphasis timing
Auto-pause at chapter/section breaks
Gestures/Controls:

Tap bottom half: toggle play/pause
Tap top half: settings modal
Swipe left/right: previous/next chapter (planned)
Pinch: adjust font size (planned)
Keyboard: Space (play/pause), arrows (navigate)
Theming:

CSS variables for theme values
Scoped component styles
Theme persistence in IndexedDB
Smooth transitions between themes
Storage Strategy:

IndexedDB for books (supports large files)
IndexedDB for user settings
No backend required for normal operation
Optional LLM API only for enhanced prosody
PWA Features:

Offline-first architecture
Install prompt on supported browsers
Auto-updates via service worker
App-like experience on mobile
Optional Capacitor wrapper for stores
Current Focus:

Basic RSVP engine with Vue components
File loading and text tokenization
Rule-based prosody (punctuation, capitals)
Theme system with CSS variables
IndexedDB integration for persistence
Next Phases:

Week 1: Vue basics + book library view
Week 2: RSVP engine core functionality
Week 3: Prosody logic + theming
Week 4: PWA testing and polish
Optional: Capacitor wrapper for app stores
Future Enhancements:

EPUB support via epub.js
PDF support via pdf.js
LLM-powered prosody analysis (optional API)
Multi-book library with covers/metadata
Reading statistics and progress tracking
Export/import reading sessions
Social features (share progress/books)
Guidelines:

Use Vue 3 Composition API with <script setup>
Keep components small and focused
Use Pinia for cross-component state
Prefer CSS for animations over JS
Maintain offline-first architecture
Test on mobile browsers early and often
Use TypeScript for type safety
Keep bundle size minimal
When Implementing:

Start with MVP: load txt, display RSVP, basic controls
Add features incrementally (prosody, themes, library)
Test PWA functionality on real devices
Consider performance for large books (virtualization)
Keep UI responsive during file processing
Provide responses with Vue/Vite specific patterns. Emphasize web-first development with optional native distribution. Focus on typography control and smooth animations for optimal reading experience.

User Task: