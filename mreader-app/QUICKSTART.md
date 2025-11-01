# Quick Start Guide

## Getting Started in 5 Minutes

### 1. Start the Development Server
The server should already be running at http://localhost:5173

If not, run:
```bash
cd mreader-app
npm run dev
```

### 2. Test the App

#### Add a Sample Book
1. Open http://localhost:5173 in your browser
2. You'll see the library view with "Add a Book" interface
3. Use the sample text file in `public/sample-text.txt`:
   - Drag and drop it into the upload area, OR
   - Click "Choose File" and select it

#### Start Reading
1. Click on the newly added book card
2. You'll enter the reader view
3. Click the play button (▶) or tap the bottom half of the screen
4. Watch the words appear one at a time!

#### Try the Controls
- **Play/Pause**: Click play button or tap bottom half
- **Settings**: Click ⚙️ or tap top half
- **Navigate**: Use arrow buttons or keyboard arrows
- **Speed**: Open settings and adjust WPM slider

#### Adjust Settings
1. Tap the top half of the screen or click ⚙️
2. Try different themes (Light/Dark/Book)
3. Adjust reading speed (start at 250 WPM)
4. Play with prosody sensitivity
5. Change fonts and font size

#### Test Keyboard Shortcuts
- `Space`: Play/Pause
- `←/→`: Previous/Next word
- `↑/↓`: Increase/Decrease WPM
- `Esc`: Pause or close settings
- `Home`: Go to beginning

### 3. Test PWA Features

#### Desktop
1. Look for the install icon in your browser's address bar
2. Click to install the app
3. Test offline: Close the server and reload

#### Mobile (for testing)
1. Open on your phone using the network URL
2. Add to home screen
3. Test as a standalone app

## Testing Checklist

### Core Functionality
- [ ] Upload a text file
- [ ] Book appears in library
- [ ] Click book to open reader
- [ ] Play/pause works
- [ ] Words display correctly
- [ ] Pivot point is highlighted
- [ ] Progress bar updates

### Settings
- [ ] Change theme (light/dark/book)
- [ ] Adjust WPM (should be immediate)
- [ ] Change font family
- [ ] Adjust font size
- [ ] Toggle prosody hints
- [ ] Settings persist after reload

### Navigation
- [ ] Skip forward/backward buttons
- [ ] Previous/next word buttons
- [ ] Jump to word in context view
- [ ] Context page navigation
- [ ] Reading position saves

### Touch Gestures
- [ ] Tap bottom half = play/pause
- [ ] Tap top half = settings
- [ ] Works on mobile devices

### Keyboard Shortcuts
- [ ] Space = play/pause
- [ ] Arrows = navigate/adjust WPM
- [ ] Esc = pause/close settings

### Edge Cases
- [ ] Empty file handling
- [ ] Very long word display
- [ ] Last word of book
- [ ] Multiple books in library
- [ ] Delete book works
- [ ] Search books works

## Common Issues & Solutions

### App won't load
- Clear browser cache
- Check console for errors
- Ensure all dependencies are installed (`npm install`)

### Books won't save
- Check IndexedDB is enabled in browser
- Check browser storage permissions
- Try incognito mode to test

### PWA won't install
- Use Chrome/Edge (best PWA support)
- Serve over HTTPS (or localhost)
- Check manifest.json is accessible

### Performance issues
- Reduce WPM for smoother playback
- Close other browser tabs
- Check CPU usage in dev tools

## Development Tips

### Hot Module Replacement
Vite provides instant updates! Just save your files and see changes immediately.

### Vue DevTools
Install the Vue DevTools browser extension for easier debugging:
- Chrome: [Vue DevTools](https://chrome.google.com/webstore/detail/vuejs-devtools)
- Firefox: [Vue DevTools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

### Debugging State
Use Vue DevTools to inspect:
- Pinia stores (settings, library, reader)
- Component state
- Events and timing

### IndexedDB Inspection
Chrome DevTools → Application → Storage → IndexedDB → mreader-db

## Next Steps

Once you've tested the MVP:
1. Check DEVELOPMENT.md for roadmap
2. Review TODO items in Phase 2
3. Consider EPUB/PDF support
4. Add your own features!

---

**Need Help?** Open an issue or check the main README.md
