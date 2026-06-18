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

import { BooleanNumber, CustomDecorationType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getCustomDecorationStyle } from '../custom-decoration';

describe('custom decoration style', () => {
    it('renders active comments with bottom border and highlight background', () => {
        expect(getCustomDecorationStyle({ type: CustomDecorationType.COMMENT, active: true } as never)).toEqual({
            bbl: {
                s: BooleanNumber.TRUE,
                cl: { rgb: '#fcdf7e' },
                c: BooleanNumber.FALSE,
            },
            bg: { rgb: '#faedc2' },
        });
    });

    it('keeps the comment bottom border when the comment is inactive', () => {
        expect(getCustomDecorationStyle({ type: CustomDecorationType.COMMENT, active: false } as never)).toEqual({
            bbl: {
                s: BooleanNumber.TRUE,
                cl: { rgb: '#fcdf7e' },
                c: BooleanNumber.FALSE,
            },
        });
    });

    it('does not style deleted decorations as active comments', () => {
        expect(getCustomDecorationStyle({ type: CustomDecorationType.DELETED } as never)).toBeNull();
    });
});
