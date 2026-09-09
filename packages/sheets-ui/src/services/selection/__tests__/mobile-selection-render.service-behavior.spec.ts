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
import {
    shouldHandleMobileNormalSelectionPointerDown,
    shouldHandleMobileNormalSelectionPointerUp,
} from '../mobile-selection-render.service';

describe('MobileSheetsSelectionRenderService', () => {
    it('lets the formula reference renderer own pointer down while reference selection is enabled', () => {
        expect(shouldHandleMobileNormalSelectionPointerDown(true, false)).toBe(false);
        expect(shouldHandleMobileNormalSelectionPointerDown(false, true)).toBe(false);
        expect(shouldHandleMobileNormalSelectionPointerDown(false, false)).toBe(true);
    });

    it('does not finish a tap selection after a long press consumed the gesture', () => {
        expect(shouldHandleMobileNormalSelectionPointerUp(false, false, true)).toBe(false);
        expect(shouldHandleMobileNormalSelectionPointerUp(true, false, false)).toBe(false);
        expect(shouldHandleMobileNormalSelectionPointerUp(false, true, false)).toBe(false);
        expect(shouldHandleMobileNormalSelectionPointerUp(false, false, false)).toBe(true);
    });
});
