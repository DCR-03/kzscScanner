/**
 * Normalize a barcode: strip whitespace, pad UPC-A to 13 digits (EAN).
 */
export function normalizeBarcode(code: string): string {
  const cleaned = code.replace(/\s/g, "");
  // UPC-A (12 digits) → EAN-13 by prepending 0
  if (/^\d{12}$/.test(cleaned)) {
    return "0" + cleaned;
  }
  return cleaned;
}

/**
 * Validate that a string looks like a valid EAN/UPC barcode.
 */
export function isValidBarcode(code: string): boolean {
  const cleaned = code.replace(/\s/g, "");
  return /^\d{8,13}$/.test(cleaned);
}
