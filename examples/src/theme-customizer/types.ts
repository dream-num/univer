import type { Theme } from '@univerjs/themes';

export type ThemeShadeKey = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
export type ThemeScaleKey = 'primary' | 'gray' | 'blue' | 'red' | 'orange' | 'yellow' | 'green' | 'jiqing' | 'indigo' | 'purple' | 'pink';
export type LoopColorKey = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
export type EditorMode = 'tokens' | 'json';
export type TokenDensity = 'core' | 'full';

export interface IThemePreset {
    key: 'default' | 'green' | 'red' | 'purple' | 'orange';
    label: string;
    theme: Theme;
}
