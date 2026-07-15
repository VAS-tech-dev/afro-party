import { ImageResponse } from 'next/og';
import { config, getFullAddress } from '@/config/config';

export const alt = 'Afro-Latina Party — VAS';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Dynamically generated Open Graph / social share card. */
export default function OpengraphImage() {
  const date = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: config.timezone,
  }).format(new Date(config.startsAt));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(120% 120% at 50% 0%, #122150 0%, #081026 60%)',
          color: '#F7F8FC',
          fontFamily: 'sans-serif',
          padding: 80,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: '#E9C158',
            marginBottom: 24,
          }}
        >
          {config.organizerLong}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 108,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: -2,
            background: 'linear-gradient(135deg, #B3822E, #E9C158 45%, #F5D88A)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          AFRO-LATINA PARTY
        </div>
        <div style={{ display: 'flex', marginTop: 36, fontSize: 32, color: '#9AA6C4' }}>{date} · 22:00</div>
        <div style={{ display: 'flex', marginTop: 10, fontSize: 26, color: '#6A7694' }}>
          {getFullAddress()}
        </div>
      </div>
    ),
    { ...size },
  );
}
