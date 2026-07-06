import { generate, getRgbStr } from '@arco-design/color';
import type { UserPreferences } from '@/store/modules/app/types';

const PRIMARY_PREFIXES = ['arcoblue', 'primary'] as const;

export function applyThemeColor(color: string) {
  if (!color) {
    return;
  }
  try {
    const isDark = document.body.hasAttribute('arco-theme');
    const list = generate(color, { list: true, dark: isDark }) as string[];
    list.forEach((hexColor, index) => {
      const rgb = getRgbStr(hexColor);
      const level = index + 1;
      PRIMARY_PREFIXES.forEach((prefix) => {
        document.body.style.setProperty(`--${prefix}-${level}`, rgb);
      });
    });
  } catch {
    // ignore invalid color
  }
}

export function applyColorWeak(enabled: boolean) {
  document.body.style.filter = enabled ? 'invert(80%)' : 'none';
}

export function applyUserPreferences(prefs: UserPreferences) {
  applyThemeColor(prefs.themeColor);
  applyColorWeak(prefs.colorWeak);
}
