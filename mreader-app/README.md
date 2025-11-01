# mreader - RSVP Speed Reading PWA

A minimalist offline-capable RSVP (Rapid Serial Visual Presentation) speed reader with prosody-enriched text presentation.

## 🚀 Features

### Current (MVP)
- ✅ **RSVP Reading Engine**: Word-by-word display with optimal recognition point (ORP) highlighting
- ✅ **Prosody Analysis**: Rule-based punctuation pauses and emphasis detection
- ✅ **Dual Reading Modes**: 
  - Active: Single-word RSVP display
  - Paused: Contextual page view with current word highlighted
- ✅ **Customizable Settings**:
  - Reading speed (100-1000 WPM)
  - Prosody sensitivity (0-100%)
  - Visual themes (Light/Dark/Book)
  - Font options (System/Serif/Sans/Mono)
  - Font size adjustment
- ✅ **Book Library**: Import and manage multiple .txt files
- ✅ **Reading Progress**: Auto-save and resume from last position
- ✅ **Touch Gestures**: 
  - Tap bottom half: Play/Pause
  - Tap top half: Settings
- ✅ **Keyboard Shortcuts**:
  - Space: Play/Pause
  - Left/Right arrows: Navigate words
  - Up/Down arrows: Adjust WPM
  - Esc: Pause/Close settings
- ✅ **PWA Ready**: Installable with offline support

### Coming Soon
- 📱 EPUB support via epub.js
- 📄 PDF support via pdf.js
- 🤖 Optional LLM-powered prosody analysis
- 📊 Reading statistics
- 🎨 More theme options
- 📱 Capacitor wrapper for app stores

## 🛠️ Tech Stack

- **Frontend**: Vue 3 + TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Storage**: IndexedDB (via idb)
- **PWA**: vite-plugin-pwa
- **Styling**: Scoped CSS + CSS Variables

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Usage

### Adding Books
1. Click "Add a Book" or drag and drop a .txt file
2. Book is automatically added to your library

### Reading
1. Click on any book in your library
2. Use the play button or tap the bottom half of the screen to start reading
3. Tap the top half to access settings
4. Your reading position is automatically saved

### Settings
- **WPM**: Adjust reading speed (100-1000 words per minute)
- **Prosody Sensitivity**: Control pause duration at punctuation (0-100%)
- **Theme**: Choose from Light, Dark, or Book themes
- **Font**: Select your preferred font family
- **Font Size**: Adjust text size (12-32px)
- **Prosody Hints**: Toggle visual indicators for pauses and emphasis

## 📱 PWA Installation

### Desktop (Chrome/Edge)
1. Click the install icon in the address bar
2. Or: Menu → Install mreader

### Mobile (iOS Safari)
1. Tap the Share button
2. Select "Add to Home Screen"

### Mobile (Android Chrome)
1. Tap the menu (⋮)
2. Select "Add to Home Screen"

## 🎨 Theming

The app supports three built-in themes:
- **Light**: Clean white background with dark text
- **Dark**: Easy on the eyes for low-light reading
- **Book**: Sepia/cream tones for a book-like experience

Themes use CSS variables for easy customization.

## 🔧 Development

### Project Structure
```
src/
├── components/       # Vue components
├── views/           # Main views
├── stores/          # Pinia stores
├── utils/           # Utilities
├── services/        # Services
├── types/           # TypeScript types
└── composables/     # Vue composables
```

### Key Concepts

#### RSVP (Rapid Serial Visual Presentation)
Words are displayed one at a time in a fixed position, eliminating eye movement and allowing for faster reading speeds.

#### ORP (Optimal Recognition Point)
The pivot character highlighted in red (typically 30-35% into the word) where the eye should focus for fastest recognition.

#### Prosody
Natural rhythm and pauses in reading, detected through punctuation analysis and word emphasis.

## 📄 License

MIT License

---

**Happy Speed Reading! 📚⚡**

