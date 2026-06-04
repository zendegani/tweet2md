import type { Document } from '../ast/types';
import type { PdfRenderResponse } from '../types/messages';
import { renderPdfFragment } from '../ast/render-pdf-html';

// Thin content-script wrapper: hand the rendered fragment + filename to the
// background worker, which spins up an offscreen extension-origin page to do
// the html2canvas + jsPDF work and trigger the download. The offscreen page
// avoids the CSP/script collisions that broke prior in-page rendering.
export async function exportPdf(doc: Document, filenameBase: string): Promise<void> {
  const html = renderPdfFragment(doc);
  const resp = (await chrome.runtime.sendMessage({
    action: 'PDF_RENDER_REQUEST',
    html,
    filenameBase,
  })) as PdfRenderResponse | undefined;
  if (!resp?.success) {
    throw new Error(resp?.error || 'PDF render failed');
  }
}
