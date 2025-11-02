/**
 * EPUB parsing utilities
 * Extracts text content from EPUB files for RSVP reading
 */

import ePub from 'epubjs'

export interface EpubMetadata {
  title?: string
  creator?: string
  description?: string
  language?: string
}

/**
 * Parse EPUB file and extract text content
 */
export async function parseEpubFile(file: File): Promise<{
  content: string
  metadata: EpubMetadata
}> {
  // Create array buffer from file
  const arrayBuffer = await file.arrayBuffer()

  // Load EPUB book
  const book = ePub(arrayBuffer)

  // Wait for book to be ready and spine to be loaded
  await book.ready
  await book.locations.generate(1024)

  const metadata: EpubMetadata = {
    title: book.packaging?.metadata?.title,
    creator: book.packaging?.metadata?.creator,
    description: book.packaging?.metadata?.description,
    language: book.packaging?.metadata?.language,
  }

  // Extract text from all sections
  const textContent: string[] = []
  const spine = book.spine as any

  // Iterate through each section in the spine
  for (let i = 0; i < spine.length; i++) {
    const section = spine.get(i)
    if (!section) continue

    try {
      await section.load(book.load.bind(book))
      const doc = section.document
      if (doc) {
        const text = extractTextFromHtml(doc)
        if (text.trim()) {
          textContent.push(text)
        }
      }
      section.unload()
    } catch (error) {
      console.warn(`Failed to load section ${i}:`, error)
    }
  }

  // Join all sections with double newlines to separate chapters
  const content = textContent.join('\n\n')

  return { content, metadata }
}

/**
 * Extract plain text from HTML document
 */
function extractTextFromHtml(doc: any): string {
  // Handle both Document and XMLDocument objects
  if (!doc) return ''

  // Remove script and style elements
  const scripts = doc.querySelectorAll('script, style')
  scripts.forEach((el: any) => el.remove())

  // Get text content
  const text = doc.body?.textContent || doc.documentElement?.textContent || ''

  // Clean up whitespace
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n\n') // Normalize paragraph breaks
    .trim()
}

/**
 * Validate if file is a valid EPUB
 */
export function isEpubFile(file: File): boolean {
  return (
    file.type === 'application/epub+zip' ||
    file.name.toLowerCase().endsWith('.epub')
  )
}
