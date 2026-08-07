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

import { afterEach, describe, expect, it } from 'vitest';
import { getFindReplaceDialogDefaultPosition } from '../find-replace.controller';

const ORIGINAL_INNER_WIDTH = window.innerWidth;

afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: ORIGINAL_INNER_WIDTH });
});

describe('getFindReplaceDialogDefaultPosition', () => {
    it('anchors the dialog to the matching physical edge for each UI direction', () => {
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1000 });

        expect(getFindReplaceDialogDefaultPosition('ltr')).toEqual({ x: 630, y: 64 });
        expect(getFindReplaceDialogDefaultPosition('rtl')).toEqual({ x: 20, y: 64 });
    });
});
