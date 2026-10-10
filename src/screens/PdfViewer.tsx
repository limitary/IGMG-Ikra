import { useCallback, useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { useApp } from '../AppContext';
import { Page } from '../components/Layout';
import { assetUrl, localize, PDFS } from '../lib/content';
import { openPdf } from '../lib/pdf';

type Tool = 'none' | 'pen' | 'highlighter';
const ZOOMS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];

export function PdfViewer({ pdfId }: { pdfId: string }) {
  const { t, lang } = useApp();
  const item = PDFS.find((p) => p.id === pdfId);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [zoomIndex, setZoomIndex] = useState(2);
  const [tool, setTool] = useState<Tool>('none');
  const [rendered, setRendered] = useState(0);
  const pageCanvas = useRef<HTMLCanvasElement>(null);
  const drawCanvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!item) return;
    let cancelled = false;
    let loaded: PDFDocumentProxy | null = null;
    openPdf(assetUrl(item.file))
      .then((pdf) => {
        loaded = pdf;
        if (cancelled) void pdf.destroy();
        else setDoc(pdf);
      })
      .catch((e: unknown) => {
        console.error('PDF openen mislukt', e);
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
      void loaded?.destroy();
    };
  }, [item]);

  useEffect(() => {
    if (!doc || !pageCanvas.current) return;
    let task: RenderTask | null = null;
    let cancelled = false;
    const canvas = pageCanvas.current;
    doc
      .getPage(page)
      .then((p) => {
        if (cancelled) return;
        const ratio = window.devicePixelRatio || 1;
        const viewport = p.getViewport({ scale: ZOOMS[zoomIndex] * ratio });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / ratio}px`;
        canvas.style.height = `${viewport.height / ratio}px`;
        const overlay = drawCanvas.current;
        if (overlay) {
          overlay.width = viewport.width;
          overlay.height = viewport.height;
          overlay.style.width = canvas.style.width;
          overlay.style.height = canvas.style.height;
        }
        task = p.render({ canvasContext: canvas.getContext('2d')!, viewport });
        return task.promise.then(() => {
          if (!cancelled) setRendered((n) => n + 1);
        });
      })
      .catch((e: unknown) => {
        if ((e as { name?: string })?.name !== 'RenderingCancelledException') {
          console.error('Pagina tekenen mislukt', e);
          if (!cancelled) setError(true);
        }
      });
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, page, zoomIndex]);

  const pageCount = doc?.numPages ?? 0;
  const goTo = useCallback((n: number) => setPage((p) => Math.min(Math.max(1, n), pageCount || p)), [pageCount]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.tagName === 'INPUT') return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown') goTo(page + 1);
      else if (event.key === 'ArrowLeft' || event.key === 'PageUp') goTo(page - 1);
      else if (event.key === '+' || event.key === '=') setZoomIndex((z) => Math.min(ZOOMS.length - 1, z + 1));
      else if (event.key === '-') setZoomIndex((z) => Math.max(0, z - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, page]);

  useDrawing(drawCanvas, tool);

  const clearDrawing = () => {
    const c = drawCanvas.current;
    c?.getContext('2d')?.clearRect(0, 0, c.width, c.height);
  };

  if (!item) return <Page title={t('pdfLibrary')}>?</Page>;

  return (
    <Page title={localize(item.title, lang)}>
      {error ? (
        <p className="warning" role="alert">
          {t('pdfError')}
        </p>
      ) : (
        <>
          <div className="toolbar">
            <button type="button" className="btn" disabled={page <= 1} onClick={() => goTo(page - 1)}>
              ← {t('previous')}
            </button>
            <span data-testid="pdf-page">
              {t('page')} {page} / {pageCount || '…'}
            </span>
            <button type="button" className="btn" disabled={page >= pageCount} onClick={() => goTo(page + 1)}>
              {t('next')} →
            </button>
            <span className="divider" />
            <button
              type="button"
              className="btn"
              aria-label={t('zoomOut')}
              onClick={() => setZoomIndex(Math.max(0, zoomIndex - 1))}
            >
              −
            </button>
            <span data-testid="pdf-zoom">{Math.round(ZOOMS[zoomIndex] * 100)}%</span>
            <button
              type="button"
              className="btn"
              aria-label={t('zoomIn')}
              onClick={() => setZoomIndex(Math.min(ZOOMS.length - 1, zoomIndex + 1))}
            >
              +
            </button>
            <span className="divider" />
            <div className="segmented" role="radiogroup">
              {(['none', 'pen', 'highlighter'] as Tool[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={tool === option}
                  onClick={() => setTool(option)}
                >
                  {t(option === 'none' ? 'noTool' : option)}
                </button>
              ))}
            </div>
            <button type="button" className="btn" onClick={clearDrawing}>
              {t('clearDrawing')}
            </button>
          </div>
          <p className="hint">{t('drawingHint')}</p>
          <div className="pdf-stage">
            {!doc && <p>{t('loading')}</p>}
            <div className="pdf-page" data-rendered={rendered}>
              <canvas ref={pageCanvas} data-testid="pdf-canvas" />
              <canvas
                ref={drawCanvas}
                className={`draw-layer ${tool !== 'none' ? 'active' : ''}`}
                key={`${page}-${zoomIndex}`}
              />
            </div>
          </div>
        </>
      )}
    </Page>
  );
}

/** Tekenen met muis, pen of vinger (smartboard) op de bovenste laag. */
function useDrawing(ref: React.RefObject<HTMLCanvasElement | null>, tool: Tool) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || tool === 'none') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let drawing = false;

    const point = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * canvas.width,
        y: ((event.clientY - rect.top) / rect.height) * canvas.height,
      };
    };
    const down = (event: PointerEvent) => {
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      const { x, y } = point(event);
      ctx.beginPath();
      ctx.moveTo(x, y);
      const ratio = canvas.width / canvas.getBoundingClientRect().width || 1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = tool === 'highlighter' ? 'multiply' : 'source-over';
      ctx.strokeStyle = tool === 'highlighter' ? 'rgba(255, 220, 0, 0.45)' : '#c0392b';
      ctx.lineWidth = (tool === 'highlighter' ? 18 : 3) * ratio;
    };
    const move = (event: PointerEvent) => {
      if (!drawing) return;
      const { x, y } = point(event);
      ctx.lineTo(x, y);
      ctx.stroke();
    };
    const up = () => {
      drawing = false;
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    return () => {
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
    };
  });
}
