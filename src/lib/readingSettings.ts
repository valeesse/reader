import { AppSettings, defaultSettings } from '../types';

const DOUBLE_PAGE_MIN_ASPECT_RATIO = 1.25;

export const READING_SETTING_LIMITS = {
  fontSize: { min: 12, max: 36, step: 1 },
  lineHeight: { min: 1, max: 2.8, step: 0.1 },
  paragraphSpacing: { min: 0, max: 3.5, step: 0.1 },
  letterSpacing: { min: 0, max: 0.25, step: 0.01 },
  pageMargin: { min: 0, max: 160, step: 2 },
} as const;

export const READER_FONT_OPTIONS = [
  { value: 'Inter, system-ui, sans-serif', label: '默认无衬线' },
  { value: "'PingFang SC', 'Microsoft YaHei', sans-serif", label: '黑体' },
  { value: "'Songti SC', 'SimSun', serif", label: '宋体' },
  { value: "'Kaiti SC', 'KaiTi', serif", label: '楷体' },
] as const;

export function normalizeSettings(settings: AppSettings): AppSettings {
  const legacy = settings as AppSettings & { txtReadingFlow?: 'paged' | 'scroll' };
  const pageTurnAnimation = settings.pageTurnAnimation
    || (legacy.txtReadingFlow === 'scroll' ? 'scroll' : defaultSettings.pageTurnAnimation);
  return {
    ...settings,
    pageMode: pageTurnAnimation === 'scroll' ? 'single' : settings.pageMode || defaultSettings.pageMode,
    pageTurnAnimation,
    fontFamily: settings.fontFamily?.trim() || defaultSettings.fontFamily,
    fontSize: clampFinite(settings.fontSize, READING_SETTING_LIMITS.fontSize.min, READING_SETTING_LIMITS.fontSize.max, defaultSettings.fontSize),
    lineHeight: clampFinite(settings.lineHeight, READING_SETTING_LIMITS.lineHeight.min, READING_SETTING_LIMITS.lineHeight.max, defaultSettings.lineHeight),
    paragraphSpacing: clampFinite(settings.paragraphSpacing, READING_SETTING_LIMITS.paragraphSpacing.min, READING_SETTING_LIMITS.paragraphSpacing.max, defaultSettings.paragraphSpacing),
    letterSpacing: clampFinite(settings.letterSpacing, READING_SETTING_LIMITS.letterSpacing.min, READING_SETTING_LIMITS.letterSpacing.max, defaultSettings.letterSpacing),
    pageMargins: {
      left: normalizeMargin(settings.pageMargins?.left, defaultSettings.pageMargins.left),
      right: normalizeMargin(settings.pageMargins?.right, defaultSettings.pageMargins.right),
      top: normalizeMargin(settings.pageMargins?.top, defaultSettings.pageMargins.top),
      bottom: normalizeMargin(settings.pageMargins?.bottom, defaultSettings.pageMargins.bottom),
    },
  };
}

export function pageModeForViewport(
  width: number,
  height: number,
  margins: AppSettings['pageMargins'],
): AppSettings['pageMode'] {
  const contentWidth = Math.max(1, width - margins.left - margins.right);
  const contentHeight = Math.max(1, height - margins.top - margins.bottom);
  return contentWidth / contentHeight >= DOUBLE_PAGE_MIN_ASPECT_RATIO ? 'double' : 'single';
}

function normalizeMargin(value: number, fallback: number) {
  return clampFinite(value, READING_SETTING_LIMITS.pageMargin.min, READING_SETTING_LIMITS.pageMargin.max, fallback);
}

function clampFinite(value: number, min: number, max: number, fallback: number) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : fallback));
}
