import { LoaderError, type LoadResult, type LoaderProgress, type BookMeta, type SegmentMeta } from '../../types/book';
import { createWordSource, type SegmentProvider } from '../wordSource';

// Minimal runtime type facades to satisfy TypeScript without pulling full pdfjs types.
interface PdfTextItem { str?: string }
interface PdfTextContent { items: PdfTextItem[] }
interface PdfPage { getTextContent(): Promise<PdfTextContent>; }
interface PdfDocument { numPages: number; getPage(p: number): Promise<PdfPage>; }

type ProgressListener = (p: LoaderProgress) => void;

export async function loadPdf(file: File): Promise<LoadResult> {
  const listeners = new Set<ProgressListener>();
  const emit = (p: LoaderProgress) => listeners.forEach(l => l(p));
  emit({ phase: 'initial', loadedSegments: 0, message: 'Reading PDF...' });

  let arrayBuffer: ArrayBuffer;
  try { arrayBuffer = await file.arrayBuffer(); } catch { throw new LoaderError('PARSE_FAILED', 'Failed to read file'); }

  // Dynamic import pdfjs-dist (use legacy build path to avoid worker config complexity for now)
  let pdfjs: unknown;
  try {
    // @ts-expect-error no types for direct build import resolution here
    pdfjs = await import('pdfjs-dist/build/pdf');
  } catch {
    throw new LoaderError('PARSE_FAILED', 'Failed to load PDF parser');
  }
  // Configure worker to data URL fallback (simplest inline approach)
  try {
    const maybe = pdfjs as { GlobalWorkerOptions?: { workerSrc: string } };
    if (maybe?.GlobalWorkerOptions) {
      maybe.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js';
    }
  } catch { /* ignore */ }

  let doc: PdfDocument;
  try {
    const api = pdfjs as { getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<PdfDocument> } };
    doc = await api.getDocument({ data: arrayBuffer }).promise;
  } catch {
    throw new LoaderError('PARSE_FAILED', 'Corrupt or encrypted PDF');
  }

  const pageCount = doc.numPages;
  if (!pageCount) throw new LoaderError('EMPTY', 'PDF has no pages');
  const segments: SegmentMeta[] = [];
  const rawSegmentText: Record<string,string> = {};
  let cumulative = 0;

  emit({ phase: 'parsing', loadedSegments: 0, totalSegments: pageCount, message: 'Extracting pages...' });

  function normalize(t: string): string {
    return t.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  }

  for (let p = 1; p <= pageCount; p++) {
    let page: PdfPage;
    try { page = await doc.getPage(p); } catch { continue; }
    let textContent: PdfTextContent;
    try { textContent = await page.getTextContent(); } catch { continue; }
    const items: PdfTextItem[] = textContent.items || [];
    const fragments: string[] = [];
    for (const it of items) {
      if (it?.str) fragments.push(it.str);
    }
    let joined = fragments.join(' ');
    // de-hyphenate simple cases (line breaks represented may be lost; minimal approach)
    joined = joined.replace(/(\w)-\s+(\w)/g, '$1$2');
    const cleaned = normalize(joined);
    if (!cleaned) continue;
    const wordList = cleaned.split(/\s+/).filter(Boolean);
    const id = `p${p}`;
    segments.push({ id, label: `Page ${p}`, startWord: cumulative, wordCount: wordList.length });
    rawSegmentText[id] = cleaned;
    cumulative += wordList.length;
    emit({ phase: 'parsing', loadedSegments: p, totalSegments: pageCount, message: `Pages: ${p}/${pageCount}` });
    // Yield every few pages (large docs) - microtask pause
    if (p % 5 === 0) await new Promise(r => setTimeout(r, 0));
  }

  if (!segments.length) throw new LoaderError('EMPTY', 'No extractable text');

  const meta: BookMeta = {
    id: crypto.randomUUID?.() || `pdf-${Date.now()}`,
    title: file.name.replace(/\.pdf$/i, ''),
    format: 'pdf',
    segments,
    totalWords: cumulative,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  };

  const provider: SegmentProvider = {
    async loadSegment(meta) { return rawSegmentText[meta.id] || ''; }
  };
  const wordSource = createWordSource(segments, provider, () => 300);
  emit({ phase: 'ready', loadedSegments: segments.length, totalSegments: segments.length, message: 'Ready' });
  return {
    bookMeta: meta,
    wordSource,
    initialIndex: 0,
    progress$: (cb: ProgressListener) => { listeners.add(cb); return () => listeners.delete(cb); }
  };
}
