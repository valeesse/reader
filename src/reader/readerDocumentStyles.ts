import { AppSettings, BookType } from '../types';
import { installOptionalReaderFontStyles } from '../lib/fontPacks';

const CONTINUOUS_STYLE_ID = 'zenith-reader-continuous-style';
const READIUM_BEFORE_STYLE_ID = 'zenith-reader-readium-before';
const READIUM_DEFAULT_STYLE_ID = 'zenith-reader-readium-default';
const READIUM_AFTER_STYLE_ID = 'zenith-reader-readium-after';
const TEXT_FINISH_STYLE_ID = 'zenith-reader-text-finish';
const TXT_FONT_SCALE_BASE = 15.75;
export const READER_IMAGE_RADIUS = '12px';

export function readerThemeColors(theme: AppSettings['theme']) {
  if (theme === 'dark') return { background: '#121212', text: '#e5e7eb' };
  if (theme === 'sepia') return { background: '#FDFCF8', text: '#5b4636' };
  return { background: '#fbfaf7', text: '#111827' };
}

export function readiumFontScale(fontSize: number, bookType: BookType, fontFamily = '') {
  return fontSize * readerFontVisualScale(fontFamily) / (bookType === 'txt' ? TXT_FONT_SCALE_BASE : 18);
}

export function applyReaderDocumentProperties(doc: Document, settings: AppSettings, bookType: BookType) {
  const root = doc.documentElement;
  const colors = readerThemeColors(settings.theme);
  installReaderTextFinish(doc);
  root.style.setProperty('--USER__backgroundColor', colors.background);
  root.style.setProperty('--USER__textColor', colors.text);
  root.style.setProperty('--USER__fontFamily', settings.fontFamily);
  root.style.setProperty('--USER__fontSize', `${readiumFontScale(settings.fontSize, bookType, settings.fontFamily) * 100}%`);
  root.style.setProperty('--USER__lineHeight', String(settings.lineHeight));
  root.style.setProperty('--USER__paraSpacing', `${settings.paragraphSpacing}rem`);
  root.style.setProperty('--USER__letterSpacing', `${settings.letterSpacing}rem`);
  root.style.setProperty('--ZENITH__paragraphTextShadow', paragraphTextShadow(settings.theme));
  void installOptionalReaderFontStyles(doc, settings.fontFamily);
}

export async function applyContinuousReaderDocumentStyles(doc: Document, settings: AppSettings, bookType: BookType) {
  await installReadiumStyles(doc);
  applyReaderDocumentProperties(doc, settings, bookType);
  const root = doc.documentElement;
  const colors = readerThemeColors(settings.theme);
  root.style.removeProperty('--USER__lineLength');
  root.style.setProperty('--RS__scrollPaddingTop', '0px');
  root.style.setProperty('--RS__scrollPaddingRight', '0px');
  root.style.setProperty('--RS__scrollPaddingBottom', '0px');
  root.style.setProperty('--RS__scrollPaddingLeft', '0px');
  root.style.setProperty('readium-scroll-on', 'readium-scroll-on');

  let style = doc.getElementById(CONTINUOUS_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = doc.createElement('style');
    style.id = CONTINUOUS_STYLE_ID;
    (doc.head || root).appendChild(style);
  }
  style.textContent = `
    :root, html, body {
      background: ${colors.background} !important;
      color: ${colors.text} !important;
      height: auto !important;
      min-height: 0 !important;
      overflow: hidden !important;
    }
    body {
      overflow: hidden !important;
      padding-block: 0 !important;
    }
    body > :last-child {
      margin-block-end: 0 !important;
    }
  `;
}

async function installReadiumStyles(doc: Document) {
  if (doc.getElementById(READIUM_AFTER_STYLE_ID)) return;
  const profile = documentProfile(doc);
  const modules = profile === 'cjk-horizontal'
    ? await Promise.all([
        import('../vendor/readium-navigator/ReadiumCSS-before-CG-KmDa3.js'),
        import('../vendor/readium-navigator/ReadiumCSS-default-N65xNiIp.js'),
        import('../vendor/readium-navigator/ReadiumCSS-after-XUKPAxfT.js'),
      ])
    : profile === 'cjk-vertical'
      ? await Promise.all([
          import('../vendor/readium-navigator/ReadiumCSS-before-BNTwR8Qm.js'),
          import('../vendor/readium-navigator/ReadiumCSS-default-BesyZHRU.js'),
          import('../vendor/readium-navigator/ReadiumCSS-after-ClF4TBzj.js'),
        ])
      : profile === 'rtl'
        ? await Promise.all([
            import('../vendor/readium-navigator/ReadiumCSS-before-DwBLxUVH.js'),
            import('../vendor/readium-navigator/ReadiumCSS-default-BhdLiyWp.js'),
            import('../vendor/readium-navigator/ReadiumCSS-after-d5mC4cme.js'),
          ])
        : await Promise.all([
            import('../vendor/readium-navigator/ReadiumCSS-before-8FMq19-x.js'),
            import('../vendor/readium-navigator/ReadiumCSS-default-AIAk8uwU.js'),
            import('../vendor/readium-navigator/ReadiumCSS-after-D7unrNI9.js'),
          ]);
  const hadPublisherStyles = Boolean(doc.querySelector('link[rel="stylesheet"], style, [style]:not([style=""])'));
  const head = doc.head || doc.documentElement;
  const before = createStyle(doc, READIUM_BEFORE_STYLE_ID, modules[0].default);
  head.prepend(before);
  if (!hadPublisherStyles) head.appendChild(createStyle(doc, READIUM_DEFAULT_STYLE_ID, modules[1].default));
  head.appendChild(createStyle(doc, READIUM_AFTER_STYLE_ID, modules[2].default));
}

function createStyle(doc: Document, id: string, css: string) {
  const style = doc.createElement('style');
  style.id = id;
  style.textContent = css;
  return style;
}

function installReaderTextFinish(doc: Document) {
  if (doc.getElementById(TEXT_FINISH_STYLE_ID)) return;
  const style = createStyle(doc, TEXT_FINISH_STYLE_ID, `
    p {
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      text-shadow: var(--ZENITH__paragraphTextShadow) !important;
    }
  `);
  (doc.head || doc.documentElement).appendChild(style);
}

function readerFontVisualScale(fontFamily: string) {
  if (fontFamily.includes('Zenith LXGW WenKai')) return 1.1;
  if (fontFamily.includes('Zenith LXGW 975 Yuan')) return 1.025;
  return 1;
}

function paragraphTextShadow(theme: AppSettings['theme']) {
  if (theme === 'dark') {
    return '0 1px 0 rgba(255, 255, 255, 0.08), 0 1px 2px rgba(0, 0, 0, 0.28)';
  }
  if (theme === 'sepia') {
    return '0 1px 0 rgba(255, 255, 255, 0.48), 0 1px 2px rgba(75, 50, 30, 0.10)';
  }
  return '0 1px 0 rgba(255, 255, 255, 0.55), 0 1px 2px rgba(30, 50, 70, 0.10)';
}

function documentProfile(doc: Document) {
  const writingMode = getComputedStyle(doc.documentElement).writingMode;
  const language = (doc.documentElement.lang || doc.body?.lang || '').toLowerCase();
  if (writingMode.startsWith('vertical')) return 'cjk-vertical';
  if (doc.documentElement.dir === 'rtl' || doc.body?.dir === 'rtl') return 'rtl';
  return /^(zh|ja|ko)(?:-|$)/.test(language) ? 'cjk-horizontal' : 'default';
}
