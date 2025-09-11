  function isDomNode(val: unknown): val is { outerHTML?: string; textContent?: string; innerHTML?: string } {
    return typeof val === 'object' && val !== null && (
      'outerHTML' in val || 'textContent' in val || 'innerHTML' in val
    );
  }
import { LoaderError, type LoadResult, type LoaderProgress, type BookMeta, type SegmentMeta } from '../../types/book';
import { createWordSource, type SegmentProvider } from '../wordSource';

interface EpubSpineItem { id?: string; idref?: string; href?: string; load?: (fn: (url: string) => Promise<unknown>) => Promise<string>; }
interface EpubSpine { spineItems?: EpubSpineItem[]; items?: EpubSpineItem[] }
interface EpubBook { ready: Promise<void>; spine?: EpubSpine; load: (url: string) => Promise<unknown>; package?: { metadata?: { title?: string; creator?: string } }; }
type EpubFactory = (data: ArrayBuffer, opts: { openAs: 'binary' }) => EpubBook;

type ProgressListener = (p: LoaderProgress) => void;

export async function loadEpub(file: File): Promise<LoadResult> {
  const listeners = new Set<ProgressListener>();
  const emit = (p: LoaderProgress) => listeners.forEach(l => l(p));
  emit({ phase: 'initial', loadedSegments: 0, message: 'Reading file...' });

  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch {
    throw new LoaderError('PARSE_FAILED', 'Failed to read file');
  }

  // Dynamic import epubjs only when needed
  // epubjs has no bundled TS types in this version; using unknown with runtime usage
  let ePubLib: EpubFactory;
  try {
    // dynamic import; cast to factory
    ePubLib = (await import('epubjs')).default as unknown as EpubFactory;
  } catch {
    throw new LoaderError('PARSE_FAILED', 'Failed to load EPUB parser');
  }

  let book: EpubBook;
  try {
    book = ePubLib(arrayBuffer, { openAs: 'binary' });
  } catch {
    throw new LoaderError('PARSE_FAILED', 'Corrupt EPUB');
  }

  // Load spine
  try {
    await book.ready;
  } catch {
    throw new LoaderError('PARSE_FAILED', 'EPUB not ready');
  }

  // Different epubjs versions expose spine items differently; attempt common properties.
  // Prefer book.spine.spineItems, fallback to book.spine.items.
  // Each item should at least have href or idref.
  const rawSpine: EpubSpine | undefined = book.spine as EpubSpine | undefined;
  const spineItems: EpubSpineItem[] = (rawSpine?.spineItems || rawSpine?.items || []).filter(Boolean);
  if (!spineItems.length) throw new LoaderError('EMPTY', 'EPUB has no readable content');

  const segments: SegmentMeta[] = [];
  let cumulative = 0;
  const rawSegmentText: Record<string, string> = {};

  emit({ phase: 'parsing', loadedSegments: 0, totalSegments: spineItems.length, message: 'Extracting chapters...' });

  // More robust extraction: keep block boundaries to avoid mashing sentences together.
  const BLOCK_TAGS = new Set(['P','DIV','SECTION','ARTICLE','H1','H2','H3','H4','H5','H6','LI','BLOCKQUOTE']);

  function extractText(html: string): string {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      doc.querySelectorAll('script,style,noscript').forEach(n => n.remove());
      const out: string[] = [];
      const walker = doc.createTreeWalker(doc.body || doc, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      let lastPushBlock = false;
      while (walker.nextNode()) {
        const node = walker.currentNode as HTMLElement | Text;
        if (node.nodeType === Node.TEXT_NODE) {
          const raw = (node.textContent || '').replace(/\u00A0/g,' ');
            const cleaned = raw.replace(/\s+/g,' ').trim();
            if (cleaned) { out.push(cleaned); lastPushBlock = false; }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (BLOCK_TAGS.has(el.tagName) && !lastPushBlock) {
            // Insert a boundary marker to later expand to two newlines for clearer separation
            out.push('\n');
            lastPushBlock = true;
          }
        }
      }
      const joined = out.join(' ').replace(/\n(\s*\n)+/g,'\n').trim();
      // Expand single \n markers to paragraph breaks, then collapse spaces again.
      return joined.replace(/\n/g,'\n\n');
    } catch {
      // fallback simple
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      tmp.querySelectorAll('script,style').forEach(n => n.remove());
      return (tmp.textContent || '').replace(/\u00A0/g,' ').replace(/\s+/g,' ').trim();
    }
  }


  let loaded = 0;
  let skipped = 0;
  for (const item of spineItems) {
    let html = '';
    const idLike = item.id || item.idref || item.href || 'unknown';
    try {
      let contents: unknown = undefined;
      if (typeof item.load === 'function') {
        contents = await item.load(book.load.bind(book));
      } else if (item.href) {
        contents = await book.load(item.href);
      } else if (item.idref) {
        contents = await book.load(item.idref);
      } else {
        console.warn('[EPUB] Spine item lacks load & href', idLike, Object.keys(item || {}));
      }
      // Robustly extract HTML string from result
      if (typeof contents === 'string') {
        html = contents;
      } else if (isDomNode(contents)) {
        if (typeof contents.outerHTML === 'string') {
          html = contents.outerHTML;
        } else if (typeof contents.textContent === 'string') {
          html = contents.textContent;
        } else if (typeof contents.innerHTML === 'string') {
          html = contents.innerHTML;
        } else {
          html = '';
        }
      } else {
        html = '';
      }
    } catch (err) {
      skipped++; console.warn('[EPUB] Failed to load spine item', idLike, err); continue;
    }
    if (!html.trim()) { skipped++; console.warn('[EPUB] Empty HTML for item', idLike); continue; }
    const extracted = extractText(html);
    const cleaned = extracted.replace(/\s+/g,' ').trim();
    if (!cleaned) { skipped++; console.warn('[EPUB] No textual content after extraction', idLike); continue; }
    const words = cleaned.split(/\s+/).filter(Boolean);
    if (!words.length) { skipped++; console.warn('[EPUB] Zero words after split', idLike); continue; }
    const segId = item.id || item.idref || item.href || `seg-${loaded}`;
    const seg: SegmentMeta = { id: segId, label: item?.idref || item?.href || `Chapter ${loaded + 1}`, startWord: cumulative, wordCount: words.length };
    segments.push(seg);
    rawSegmentText[seg.id] = cleaned;
    cumulative += words.length;
    loaded += 1;
    if (loaded <= 5 || loaded % 10 === 0) {
      console.debug('[EPUB] Segment', segId, 'words=', words.length, 'first=', cleaned.slice(0,120));
    }
    emit({ phase: 'parsing', loadedSegments: loaded, totalSegments: spineItems.length, message: `Chapters: ${loaded}/${spineItems.length}` });
  }

  if (!segments.length) {
    console.error('[EPUB] No text extracted. Spine items:', spineItems.length, 'Skipped:', skipped);
    throw new LoaderError('EMPTY', skipped ? 'EPUB has spine but yielded no text (possibly image-only or unsupported structure).' : 'EPUB contains no textual spine items');
  }
  console.info('[EPUB] Extraction complete. Segments:', segments.length, 'Total words:', cumulative, 'Skipped items:', skipped);

  const meta: BookMeta = {
    id: crypto.randomUUID?.() || `epub-${Date.now()}`,
    title: (book.package?.metadata?.title) || file.name.replace(/\.epub$/i, ''),
    author: book.package?.metadata?.creator || undefined,
    format: 'epub',
    segments,
    totalWords: cumulative,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  };

  const provider: SegmentProvider = {
    async loadSegment(meta) {
      return rawSegmentText[meta.id] || '';
    }
  };

  const wordSource = createWordSource(segments, provider, () => 300); // wpm injected later by rebuild if needed

  emit({ phase: 'ready', loadedSegments: segments.length, totalSegments: segments.length, message: 'Ready' });

  return {
    bookMeta: meta,
    wordSource,
    initialIndex: 0,
    progress$: (cb: ProgressListener) => { listeners.add(cb); return () => listeners.delete(cb); }
  };
}
