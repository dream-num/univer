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
import { ISheetHostChromeOverrideService } from '../../../services/sheet-host-chrome-override.service';
import { shouldSuppressSheetContextMenuForEmbedOverride } from '../contextmenu.render-controller';

describe('SheetContextMenuRenderController embed chrome bridge', () => {
    it('suppresses host sheet context menus only for active sheet-tab overrides', () => {
        expect(shouldSuppressSheetContextMenuForEmbedOverride('host-1', {
            hostUnitId: 'host-1',
            entry: 'sheets-sheet-tab',
        })).toBe(true);
        expect(shouldSuppressSheetContextMenuForEmbedOverride('host-1', {
            hostUnitId: 'host-1',
            entry: 'sheets-floating-object',
        })).toBe(false);
        expect(shouldSuppressSheetContextMenuForEmbedOverride('host-1', {
            hostUnitId: 'other-host',
            entry: 'sheets-sheet-tab',
        })).toBe(false);
    });

    it('uses a sheets-ui owned host chrome override service token', () => {
        expect(ISheetHostChromeOverrideService).toBeTruthy();
    });
});
