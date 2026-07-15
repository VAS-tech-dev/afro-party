import QRCode from 'qrcode';

/**
 * QR generation. High-contrast (dark navy on white) for reliable scanning by
 * any phone camera at the door. The QR encodes only the ticket token.
 */

const OPTIONS: QRCode.QRCodeToBufferOptions = {
  type: 'png',
  width: 512,
  margin: 2,
  errorCorrectionLevel: 'M',
  color: { dark: '#0A1633', light: '#FFFFFF' },
};

/** PNG buffer for the given text (used by the QR image route + email attach). */
export function qrPngBuffer(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, OPTIONS);
}

/** Data URL variant (used when embedding directly, e.g. the ticket web page). */
export function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#0A1633', light: '#FFFFFF' },
  });
}
