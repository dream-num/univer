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
    resolveMobileKeyboardInset,
    shouldUpdateMobileStableHeight,
} from '../MobileWorkbench';

describe('resolveMobileKeyboardInset', () => {
    it('excludes persistent browser chrome and reports only keyboard occlusion', () => {
        expect(resolveMobileKeyboardInset(900, 700, 200)).toBe(0);
        expect(resolveMobileKeyboardInset(900, 400, 200)).toBe(300);
    });

    it('uses the visual viewport bottom without displacing the canvas by offsetTop', () => {
        expect(resolveMobileKeyboardInset(932, 180 + 500, 0)).toBe(252);
    });
});

describe('shouldUpdateMobileStableHeight', () => {
    it('fills newly available height without treating viewport growth as keyboard occlusion', () => {
        expect(shouldUpdateMobileStableHeight(780, 860, 390, 390, false, false)).toBe(true);
        expect(shouldUpdateMobileStableHeight(780, 870, 390, 390, false, false)).toBe(true);
        expect(shouldUpdateMobileStableHeight(870, 780, 390, 390, false, false)).toBe(false);
        expect(shouldUpdateMobileStableHeight(780, 870, 390, 390, true, false)).toBe(false);
        expect(shouldUpdateMobileStableHeight(780, 870, 390, 390, false, true)).toBe(false);
    });

    it('does not capture an iOS keyboard-height viewport after focus is lost', () => {
        expect(shouldUpdateMobileStableHeight(900, 520, 430, 430, false, true)).toBe(false);
        expect(shouldUpdateMobileStableHeight(900, 520, 430, 430, false, false)).toBe(false);
        expect(shouldUpdateMobileStableHeight(900, 860, 430, 430, false, false)).toBe(true);
        expect(shouldUpdateMobileStableHeight(900, 430, 430, 900, false, true)).toBe(true);
    });
});
