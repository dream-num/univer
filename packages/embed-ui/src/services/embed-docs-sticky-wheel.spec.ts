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

/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from 'vitest';
import { shouldPassDocsStickyVerticalWheelToHost } from './embed-docs-sticky-wheel';

describe('shouldPassDocsStickyVerticalWheelToHost', () => {
    it('passes dominant vertical wheel to docs for docs-sticky table-like blocks', () => {
        expect(shouldPassDocsStickyVerticalWheelToHost('docs-sticky-sheet', new WheelEvent('wheel', { deltaY: 80 }))).toBe(true);
        expect(shouldPassDocsStickyVerticalWheelToHost('docs-sticky-base', new WheelEvent('wheel', { deltaY: -80, deltaX: 4 }))).toBe(true);
    });

    it('keeps horizontal and modified wheel available to child runtimes', () => {
        expect(shouldPassDocsStickyVerticalWheelToHost('docs-sticky-sheet', new WheelEvent('wheel', { deltaX: 80, deltaY: 4 }))).toBe(false);
        expect(shouldPassDocsStickyVerticalWheelToHost('docs-sticky-sheet', new WheelEvent('wheel', { deltaY: 80, shiftKey: true }))).toBe(false);
        expect(shouldPassDocsStickyVerticalWheelToHost('tab-peer', new WheelEvent('wheel', { deltaY: 80 }))).toBe(false);
    });
});
