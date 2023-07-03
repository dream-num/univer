import { ThemeColors, ThemeColorType } from '../Enum';

interface IThemeColors {
    [key: string]: { [key: number]: string };
}

export const THEME_COLORS: IThemeColors = {
    [ThemeColors.OFFICE]: {
        [ThemeColorType.ACCENT1]: '#4472C4',
        [ThemeColorType.ACCENT2]: '#ED7D31',
        [ThemeColorType.ACCENT3]: '#A5A5A5',
        [ThemeColorType.ACCENT4]: '#70AD47',
        [ThemeColorType.ACCENT5]: '#5B9BD5',
        [ThemeColorType.ACCENT6]: '#70AD47',
        [ThemeColorType.DARK1]: '#000000',
        [ThemeColorType.DARK2]: '#44546A',
        [ThemeColorType.LIGHT1]: '#FFFFFF',
        [ThemeColorType.LIGHT2]: '#E7E6E6',
        [ThemeColorType.HYPERLINK]: '#0563C1',
        [ThemeColorType.FOLLOWED_HYPERLINK]: '#954F72',
    },
};
