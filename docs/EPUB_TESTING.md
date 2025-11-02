# EPUB Testing Guide

This document describes how to test the EPUB reading functionality in mreader.

## What Was Implemented

1. **EPUB File Support**: The app now accepts `.epub` files in addition to `.txt` and `.md` files
2. **EPUB Parsing**: Using the `epubjs` library to parse EPUB files and extract text content
3. **Format Tracking**: Books now have a `format` field to track whether they are txt or epub
4. **UI Updates**: EPUB books display a badge in the library view

## How to Test

### 1. Start the Development Server

```bash
cd mreader-app
npm run dev
```

### 2. Access the App

Open your browser and navigate to `http://localhost:5173`

### 3. Upload an EPUB File

1. In the library view, you should see the "Add a Book" uploader
2. The uploader now accepts `.txt`, `.md`, and `.epub` files
3. Drag and drop an EPUB file or click "Choose File" to select one
4. The file should be processed and added to your library

### 4. Verify EPUB Book Display

1. The EPUB book should appear in the library with:
   - The book's title (from EPUB metadata)
   - The author name (if available in metadata)
   - Word count
   - An "EPUB" badge next to the title
2. Click on the book to open it in the reader

### 5. Test Reading

1. The book should load in RSVP mode
2. You should be able to play/pause the reading
3. The text should display word-by-word at the configured WPM
4. All standard reader features should work (settings, scrubbing, etc.)

## Test EPUB Files

You can find free EPUB test files at:
- [Project Gutenberg](https://www.gutenberg.org/) - Thousands of free ebooks
- [Standard Ebooks](https://standardebooks.org/) - High-quality public domain ebooks
- [Internet Archive](https://archive.org/) - Many books available in EPUB format

## What to Look For

### ✅ Expected Behavior
- EPUB files upload successfully
- Book metadata (title, author) is extracted correctly
- Text content is readable in RSVP mode
- EPUB badge appears in library view
- Books are stored in IndexedDB and persist across sessions
- Reading position is saved

### ❌ Potential Issues
- If an EPUB file fails to parse, check the browser console for errors
- Some complex EPUBs with special formatting may not extract perfectly
- Very large EPUBs (>50MB) will be rejected by the file size limit

## Technical Notes

- EPUB files are parsed client-side using epubjs
- Text content is extracted from all spine items (chapters)
- HTML is stripped, leaving plain text for RSVP reading
- Maximum file size is 50MB (increased from 10MB for txt files)
- Books are stored in IndexedDB for offline access
