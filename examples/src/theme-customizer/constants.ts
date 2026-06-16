/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IThemePreset, ThemeScaleKey, ThemeShadeKey, TokenDensity } from './types';
import { defaultTheme, greenTheme, orangeTheme, purpleTheme, redTheme } from '@univerjs/themes';

export const PREVIEW_CONTAINER_ID = 'theme-customizer-preview';

export const COLOR_SHADE_KEYS: ThemeShadeKey[] = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
export const COLOR_SCALE_KEYS: ThemeScaleKey[] = ['primary', 'gray', 'blue', 'red', 'orange', 'yellow', 'green', 'jiqing', 'indigo', 'purple', 'pink'];
export const CORE_SCALE_KEYS: ThemeScaleKey[] = ['primary', 'gray', 'blue', 'green', 'red'];
export const LOOP_COLOR_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const;

export const LOOP_COLOR_OPTIONS = COLOR_SCALE_KEYS.flatMap((scale) =>
    COLOR_SHADE_KEYS.map((shade) => ({
        label: `${scale}.${shade}`,
        value: `${scale}.${shade}`,
    }))
);

export const THEME_PRESETS: IThemePreset[] = [
    { key: 'default', label: 'defaultTheme', theme: defaultTheme },
    { key: 'green', label: 'greenTheme', theme: greenTheme },
    { key: 'orange', label: 'orangeTheme', theme: orangeTheme },
    { key: 'red', label: 'redTheme', theme: redTheme },
    { key: 'purple', label: 'purpleTheme', theme: purpleTheme },
];

export const TOKEN_DENSITY_LABELS: Record<TokenDensity, string> = {
    core: 'Core Palette',
    full: 'Full Schema',
};
