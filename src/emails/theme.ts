/**
 * Email design tokens. Emails need literal hex values (CSS variables and modern
 * color functions are unreliable across mail clients), so the VAS palette is
 * duplicated here as plain hex. Keep in sync with src/styles/globals.css.
 */
export const emailTheme = {
  navy950: '#081026',
  navy900: '#0A1633',
  navy800: '#122150',
  navy700: '#1C2E66',
  gold: '#E9C158',
  goldDeep: '#B3822E',
  goldLight: '#F5D88A',
  text: '#F7F8FC',
  muted: '#9AA6C4',
  faint: '#6A7694',
  border: '#22305C',
} as const;

/** Reusable inline style fragments. */
export const emailStyles = {
  body: {
    backgroundColor: emailTheme.navy950,
    margin: 0,
    padding: '24px 0',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    backgroundColor: emailTheme.navy900,
    borderRadius: '20px',
    border: `1px solid ${emailTheme.border}`,
    overflow: 'hidden',
  },
  heading: {
    color: emailTheme.text,
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: 1.25,
    margin: '0 0 8px',
  },
  paragraph: {
    color: emailTheme.muted,
    fontSize: '15px',
    lineHeight: 1.6,
    margin: '0 0 16px',
  },
  strongText: {
    color: emailTheme.text,
    fontWeight: 600,
  },
  button: {
    backgroundColor: emailTheme.gold,
    color: emailTheme.navy950,
    fontSize: '15px',
    fontWeight: 700,
    textDecoration: 'none',
    borderRadius: '999px',
    padding: '14px 28px',
    display: 'inline-block',
  },
  infoBox: {
    backgroundColor: emailTheme.navy800,
    border: `1px solid ${emailTheme.border}`,
    borderRadius: '14px',
    padding: '18px 20px',
    margin: '0 0 20px',
  },
} as const;
