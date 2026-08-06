import "server-only";

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  pages: { pageNumber: number; text: string }[];
  isLikelyScanned: boolean;
}

/**
 * Extracts text from a PDF buffer. If the extracted text is suspiciously
 * short relative to page count, flags isLikelyScanned so the processing
 * pipeline can mark the item needs_review (MVP does not run local OCR on
 * scanned PDFs — this is a documented limitation, see README).
 */
export async function extractPdfText(buffer: Buffer, maxPages: number): Promise<PdfExtractionResult> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer, { max: maxPages });

  const rawPages = data.text.split("\f").filter((p) => p.trim().length > 0);
  const pages = rawPages.slice(0, maxPages).map((text, i) => ({ pageNumber: i + 1, text: text.trim() }));
  const totalChars = data.text.trim().length;
  const isLikelyScanned = data.numpages > 0 && totalChars / Math.max(data.numpages, 1) < 20;

  return {
    text: data.text.trim(),
    pageCount: data.numpages,
    pages: pages.length ? pages : [{ pageNumber: 1, text: data.text.trim() }],
    isLikelyScanned,
  };
}
