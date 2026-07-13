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

import type { IFloatDomLayout } from '../../../../services/dom/canvas-dom-layer.service';
import { describe, expect, it } from 'vitest';
import { resolveFloatDomLayout } from '../float-dom-layout';

const PLACEMENT_480_BY_320: IFloatDomLayout = {
    startX: 20,
    startY: 30,
    endX: 500,
    endY: 350,
    width: 480,
    height: 320,
    rotate: 0,
    absolute: { left: true, top: true },
};

describe('resolveFloatDomLayout', () => {
    it('keeps the historical insets by default and exposes exact placement bounds with zero insets', () => {
        const defaultLayout = resolveFloatDomLayout(PLACEMENT_480_BY_320);
        const emptyConfigLayout = resolveFloatDomLayout(PLACEMENT_480_BY_320, {});
        const exactLayout = resolveFloatDomLayout(PLACEMENT_480_BY_320, { wrapperInset: 0, contentInset: 0 });

        expect(defaultLayout.wrapper).toMatchObject({ width: 478, height: 318 });
        expect(defaultLayout.inner).toMatchObject({ width: 476, height: 316 });
        expect(emptyConfigLayout).toEqual(defaultLayout);
        expect(exactLayout.wrapper).toMatchObject({ width: 480, height: 320 });
        expect(exactLayout.inner).toMatchObject({ width: 480, height: 320 });
    });

    it('applies wrapper and content insets independently', () => {
        expect(resolveFloatDomLayout(PLACEMENT_480_BY_320, { wrapperInset: 6 })).toMatchObject({
            wrapper: { width: 474, height: 314 },
            inner: { width: 476, height: 316 },
        });
        expect(resolveFloatDomLayout(PLACEMENT_480_BY_320, { contentInset: 10 })).toMatchObject({
            wrapper: { width: 478, height: 318 },
            inner: { width: 470, height: 310 },
        });
    });

    it.each([
        [{ left: true, top: true }, { left: 0, top: 0, right: 'auto', bottom: 'auto' }],
        [{ left: true, top: false }, { left: 0, top: 'auto', right: 'auto', bottom: 0 }],
        [{ left: false, top: true }, { left: 'auto', top: 0, right: 0, bottom: 'auto' }],
        [{ left: false, top: false }, { left: 'auto', top: 'auto', right: 0, bottom: 0 }],
    ] as const)('preserves the inner anchor for absolute=%o', (absolute, expected) => {
        const layout = resolveFloatDomLayout({ ...PLACEMENT_480_BY_320, absolute }, { wrapperInset: 0, contentInset: 0 });

        expect(layout.inner).toMatchObject(expected);
    });

    it('uses visible placement bounds for a clipped wrapper and full content bounds for the inner root', () => {
        const layout = resolveFloatDomLayout({
            ...PLACEMENT_480_BY_320,
            startX: 0,
            startY: 0,
            endX: 300,
            endY: 200,
            width: 480,
            height: 320,
            absolute: { left: false, top: false },
        }, { wrapperInset: 0, contentInset: 0 });

        expect(layout.wrapper).toMatchObject({ top: 0, left: 0, width: 300, height: 200 });
        expect(layout.inner).toMatchObject({ width: 480, height: 320, right: 0, bottom: 0 });
    });

    it('keeps default small-content behavior while zero insets retain zero and small dimensions', () => {
        const smallPlacement = {
            ...PLACEMENT_480_BY_320,
            endX: 21,
            endY: 31,
            width: 1,
            height: 0,
        };

        expect(resolveFloatDomLayout(smallPlacement)).toMatchObject({
            wrapper: { width: 0, height: 0 },
            inner: { width: -3, height: -4 },
        });
        expect(resolveFloatDomLayout(smallPlacement, { wrapperInset: 0, contentInset: 0 })).toMatchObject({
            wrapper: { width: 1, height: 1 },
            inner: { width: 1, height: 0 },
        });
    });

    it('preserves rotation and opacity with configured insets', () => {
        const position = { ...PLACEMENT_480_BY_320, rotate: 30, opacity: 0.4 };

        expect(resolveFloatDomLayout(position).wrapper).toMatchObject({ transform: 'rotate(30deg)', opacity: 0.4 });
        expect(resolveFloatDomLayout(position, { wrapperInset: 0, contentInset: 0 }).wrapper).toMatchObject({ transform: 'rotate(30deg)', opacity: 0.4 });
    });
});
