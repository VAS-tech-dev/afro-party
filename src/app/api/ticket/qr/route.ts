import { NextResponse } from 'next/server';
import { qrPngBuffer } from '@/lib/qrcode';
import { isValidTicketToken } from '@/lib/ticket';

export const runtime = 'nodejs';

/**
 * GET /api/ticket/qr?token=VAS-XXXX
 * Returns a PNG QR code encoding the ticket token. Referenced by absolute URL
 * from the ticket email (data-URI images are unreliable in mail clients).
 *
 * The token alone carries no personal data; exposing its QR is harmless. An
 * invalid token shape is rejected before doing any work.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') ?? '';

  if (!isValidTicketToken(token)) {
    return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 400 });
  }

  const png = await qrPngBuffer(token);
  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
