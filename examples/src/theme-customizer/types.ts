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
