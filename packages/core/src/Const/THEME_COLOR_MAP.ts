import { ThemeColors, ThemeColorType } from '../Enum';

export const THEME_COLOR_MAP = new Map<string, Map<ThemeColorType, string>>();

const OFFICE = new Map<ThemeColorType, string>();
OFFICE.set(ThemeColorType.ACCENT1, '#4472C4');
OFFICE.set(ThemeColorType.ACCENT2, '#ED7D31');
OFFICE.set(ThemeColorType.ACCENT3, '#A5A5A5');
OFFICE.set(ThemeColorType.ACCENT4, '#70AD47');
OFFICE.set(ThemeColorType.ACCENT5, '#5B9BD5');
OFFICE.set(ThemeColorType.ACCENT6, '#70AD47');
OFFICE.set(ThemeColorType.DARK1, '#000000');
OFFICE.set(ThemeColorType.DARK2, '#44546A');
OFFICE.set(ThemeColorType.LIGHT1, '#FFFFFF');
OFFICE.set(ThemeColorType.LIGHT2, '#E7E6E6');
OFFICE.set(ThemeColorType.HYPERLINK, '#0563C1');
OFFICE.set(ThemeColorType.FOLLOWED_HYPERLINK, '#954F72');
THEME_COLOR_MAP.set(ThemeColors.OFFICE, OFFICE);
