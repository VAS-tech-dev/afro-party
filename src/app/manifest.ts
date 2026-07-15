import type { MetadataRoute } from 'next';
import { config } from '@/config/config';

/** PWA manifest — makes the site installable ("add to home screen"). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${config.eventName} — ${config.organizer}`,
    short_name: config.eventName,
    description: 'Afrobeats, Amapiano, Latino & Reggaeton — hosted by VAS in Worms.',
    start_url: '/',
    display: 'standalone',
    background_color: '#081026',
    theme_color: '#081026',
    orientation: 'portrait',
    icons: [
      { src: '/logo-vas.jpeg', sizes: '192x192', type: 'image/jpeg', purpose: 'any' },
      { src: '/logo-vas.jpeg', sizes: '512x512', type: 'image/jpeg', purpose: 'any' },
    ],
  };
}
