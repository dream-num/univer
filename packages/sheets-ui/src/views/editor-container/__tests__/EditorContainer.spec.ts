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

import { describe, expect, it } from 'vitest';
import { getCellEditorHostBackgroundColor } from '../EditorContainer';

describe('cell editor host background', () => {
    const themeOptions = {
        getColorFromTheme: (color: string) => `theme:${color}`,
    };

    it('uses the current cell fill as the editor host surface', () => {
        expect(getCellEditorHostBackgroundColor({
            documentLayoutObject: {
                fill: '#dae9f8',
            },
        } as never, themeOptions)).toBe('#dae9f8');
    });

    it('uses a light sheet surface when the cell fill is missing or transparent', () => {
        expect(getCellEditorHostBackgroundColor({
            documentLayoutObject: {},
        } as never, themeOptions)).toBe('theme:white');

        expect(getCellEditorHostBackgroundColor({
            documentLayoutObject: {
                fill: 'transparent',
            },
        } as never, themeOptions)).toBe('theme:white');
    });

    it('uses a dark sheet surface when the cell fill is missing in dark mode', () => {
        expect(getCellEditorHostBackgroundColor({
            documentLayoutObject: {},
        } as never, {
            ...themeOptions,
            darkMode: true,
        })).toBe('theme:gray.800');
    });
});
