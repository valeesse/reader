import { AppSettings, BookType } from '../types';

const DOCUMENT_STYLE_ID = 'zenith-reader-document-style';
const TXT_FONT_SCALE_BASE = 15.75;

export function readerThemeColors(theme: AppSettings['theme']) {
  if (theme === 'dark') return { background: '#121212', text: '#e5e7eb' };
  if (theme === 'sepia') return { background: '#FDFCF8', text: '#5b4636' };
  return { background: '#ffffff', text: '#111827' };
}

export function readiumFontScale(fontSize: number, bookType: BookType) {
  return fontSize / (bookType === 'txt' ? TXT_FONT_SCALE_BASE : 18);
}

export function applyReaderDocumentStyles(
  doc: Document,
  settings: AppSettings,
  bookType: BookType,
  flow: 'paged' | 'continuous',
) {
  const root = doc.documentElement;
  const colors = readerThemeColors(settings.theme);
  const fontSize = bookType === 'txt'
    ? 14 * readiumFontScale(settings.fontSize, bookType)
    : 16 * readiumFontScale(settings.fontSize, bookType);

  root.style.setProperty('--USER__backgroundColor', colors.background);
  root.style.setProperty('--USER__textColor', colors.text);
  root.style.setProperty('--USER__fontFamily', settings.fontFamily);
  root.style.setProperty('--USER__fontSize', String(readiumFontScale(settings.fontSize, bookType)));
  root.style.setProperty('--USER__lineHeight', String(settings.lineHeight));
  root.style.setProperty('--USER__paraSpacing', `${settings.paragraphSpacing}em`);
  root.style.setProperty('--USER__letterSpacing', `${settings.letterSpacing}em`);

  let style = doc.getElementById(DOCUMENT_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = doc.createElement('style');
    style.id = DOCUMENT_STYLE_ID;
    (doc.head || root).appendChild(style);
  }
  style.textContent = `
    :root, html, body {
      background: ${colors.background} !important;
      color: ${colors.text} !important;
    }
    ${flow === 'continuous' ? `html { font-size: ${fontSize}px !important; }` : ''}
    body {
      box-sizing: border-box !important;
      font-size: 1rem !important;
      letter-spacing: ${settings.letterSpacing}em !important;
      line-height: ${settings.lineHeight} !important;
      text-rendering: optimizeLegibility;
    }
    body, p, div, span, li, blockquote, h1, h2, h3, h4, h5, h6,
    table, th, td, caption, pre, code, ruby, rt, rp, a, em, strong {
      font-family: ${settings.fontFamily} !important;
      letter-spacing: ${settings.letterSpacing}em !important;
      line-height: ${settings.lineHeight} !important;
    }
    p {
      margin-top: ${settings.paragraphSpacing}em !important;
      margin-bottom: ${settings.paragraphSpacing}em !important;
    }
    img, picture, svg, video, canvas, object, embed {
      box-sizing: border-box !important;
      height: auto !important;
      max-width: 100% !important;
    }
    ${flow === 'continuous' ? `
      :root, html, body {
        height: auto !important;
        min-height: 0 !important;
        overflow: hidden !important;
      }
      body {
        width: 100% !important;
        max-width: 68ch !important;
        margin: 0 auto !important;
        padding: 0 0 ${Math.max(24, settings.paragraphSpacing * fontSize)}px !important;
      }
    ` : ''}
  `;

  return colors;
}
