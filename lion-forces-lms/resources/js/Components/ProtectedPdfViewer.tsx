import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { useEffect, useRef, useState } from 'react';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

interface Props {
    src: string;
    /** Each line is stamped diagonally and tiled across every page -- e.g. [name, email]. Omit to skip the watermark entirely (anonymous viewer of a free note). */
    watermarkLines?: string[];
}

// Renders a PDF page-by-page onto a <canvas> instead of the browser's
// native PDF viewer (which has its own download/print toolbar that can't
// be suppressed) -- there's no selectable text layer and no download
// affordance anywhere in this component. The watermark is drawn directly
// onto the same canvas pixels so it can't be stripped via devtools the way
// a DOM overlay could be.
export default function ProtectedPdfViewer({ src, watermarkLines }: Props) {
    const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
    const [numPages, setNumPages] = useState(0);
    const [pageNum, setPageNum] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const renderTaskRef = useRef<RenderTask | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        setDoc(null);
        setPageNum(1);

        pdfjsLib.getDocument({ url: src, withCredentials: true }).promise
            .then((loaded) => {
                setDoc(loaded);
                setNumPages(loaded.numPages);
                setLoading(false);
            })
            .catch(() => {
                setError("You don't have access to this file, or it couldn't be loaded.");
                setLoading(false);
            });
    }, [src]);

    useEffect(() => {
        if (!doc || !canvasRef.current || !containerRef.current) return;

        let cancelled = false;

        doc.getPage(pageNum).then((page) => {
            if (cancelled) return;

            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;

            const unscaled = page.getViewport({ scale: 1 });
            const scale = Math.min(Math.max((container.clientWidth || 800) / unscaled.width, 0.5), 2.5);
            const viewport = page.getViewport({ scale });

            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }
            const task = page.render({ canvasContext: ctx, viewport, canvas });
            renderTaskRef.current = task;

            task.promise.then(() => {
                if (cancelled) return;
                drawWatermark(ctx, canvas.width, canvas.height, watermarkLines);
            }).catch(() => {
                // A cancelled render rejects its promise -- expected when
                // the page changes again before the previous one finishes.
            });
        });

        return () => {
            cancelled = true;
            renderTaskRef.current?.cancel();
        };
    }, [doc, pageNum, watermarkLines]);

    if (loading) {
        return (
            <div className="protected-pdf-viewer rounded-2xl border border-border bg-surface p-10 text-center text-sm text-text-secondary">
                Loading document…
            </div>
        );
    }

    if (error) {
        return (
            <div className="protected-pdf-viewer rounded-2xl border border-border bg-surface p-10 text-center text-sm text-danger">
                {error}
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="protected-pdf-viewer select-none rounded-2xl border border-border bg-surface p-4"
            onContextMenu={(e) => e.preventDefault()}
        >
            <div className="flex justify-center overflow-x-auto">
                <canvas ref={canvasRef} className="rounded-lg border border-border" />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                    disabled={pageNum <= 1}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-5 py-2 text-sm font-bold uppercase tracking-wide text-text transition-colors hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text"
                >
                    Previous
                </button>
                <span className="text-xs font-bold uppercase tracking-wide text-text-muted">
                    Page {pageNum} of {numPages}
                </span>
                <button
                    type="button"
                    onClick={() => setPageNum((p) => Math.min(numPages, p + 1))}
                    disabled={pageNum >= numPages}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-40"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number, lines?: string[]) {
    if (!lines || lines.length === 0) return;

    ctx.save();
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#000000';
    ctx.globalAlpha = 0.12;

    const stepX = 220;
    const stepY = 220;
    for (let y = -stepY; y < height + stepY; y += stepY) {
        for (let x = -stepX; x < width + stepX; x += stepX) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-Math.PI / 6);
            lines.forEach((line, i) => ctx.fillText(line, 0, i * 16));
            ctx.restore();
        }
    }

    ctx.restore();
}
