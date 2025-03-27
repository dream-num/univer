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

import { ThemeColors, ThemeColorType } from '../enum';

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
