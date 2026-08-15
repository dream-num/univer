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
import { RectPopup } from '../RectPopup';

describe('RectPopup adaptive vertical placement', () => {
    it('keeps a horizontal popup inside an offset container', () => {
        expect(RectPopup.calcPopupPosition({
            position: { left: 200, right: 668, top: 29, bottom: 398 },
            width: 26,
            height: 26,
            containerLeft: 0,
            containerTop: 152,
            containerWidth: 1580,
            containerHeight: 891,
            direction: 'horizontal',
        })).toEqual({ left: 668, top: 160 });
    });

    it('keeps a left-side popup outside the container boundary insets', () => {
        const layout = {
            position: { left: 40, right: 90, top: 29, bottom: 398 },
            width: 60,
            height: 40,
            containerLeft: 100,
            containerTop: 200,
            containerWidth: 400,
            containerHeight: 300,
            boundaryInsets: { left: 50, top: 30 },
            direction: 'left' as const,
        };

        expect(RectPopup.calcPopupPosition(layout)).toEqual({ left: 158, top: 238 });
    });

    it('keeps a horizontal popup inside the bottom and right container edges', () => {
        expect(RectPopup.calcPopupPosition({
            position: { left: 450, right: 550, top: 480, bottom: 600 },
            width: 60,
            height: 40,
            containerLeft: 100,
            containerTop: 200,
            containerWidth: 400,
            containerHeight: 300,
            direction: 'horizontal',
        })).toEqual({ left: 432, top: 452 });
    });

    it('uses offset container space when choosing the vertical side', () => {
        expect(RectPopup.calcPopupPosition({
            position: { left: 200, right: 300, top: 550, bottom: 600 },
            width: 50,
            height: 40,
            containerLeft: 100,
            containerTop: 500,
            containerWidth: 400,
            containerHeight: 400,
            direction: 'vertical-center',
        })).toEqual({ left: 225, top: 600 });
    });

    it('uses the bottom side when the anchor has more space below', () => {
        expect(RectPopup.calcPopupPosition({
            position: { left: 100, right: 300, top: 100, bottom: 200 },
            width: 100,
            height: 40,
            containerWidth: 1000,
            containerHeight: 1000,
            direction: 'vertical-center',
        })).toEqual({ left: 150, top: 200 });
    });

    it('uses the top side when the anchor has more space above', () => {
        expect(RectPopup.calcPopupPosition({
            position: { left: 100, right: 300, top: 700, bottom: 800 },
            width: 100,
            height: 40,
            containerWidth: 1000,
            containerHeight: 1000,
            direction: 'vertical-center',
        })).toEqual({ left: 150, top: 660 });
    });

    it('preserves left alignment when choosing the vertical side', () => {
        expect(RectPopup.calcPopupPosition({
            position: { left: 100, right: 300, top: 100, bottom: 200 },
            width: 100,
            height: 40,
            containerWidth: 1000,
            containerHeight: 1000,
            direction: 'vertical-left',
        })).toEqual({ left: 100, top: 200 });
        expect(RectPopup.calcPopupPosition({
            position: { left: 100, right: 300, top: 700, bottom: 800 },
            width: 100,
            height: 40,
            containerWidth: 1000,
            containerHeight: 1000,
            direction: 'vertical-left',
        })).toEqual({ left: 100, top: 660 });
    });

    it('preserves right alignment when choosing the vertical side', () => {
        expect(RectPopup.calcPopupPosition({
            position: { left: 100, right: 300, top: 100, bottom: 200 },
            width: 100,
            height: 40,
            containerWidth: 1000,
            containerHeight: 1000,
            direction: 'vertical-right',
        })).toEqual({ left: 200, top: 200 });
        expect(RectPopup.calcPopupPosition({
            position: { left: 100, right: 300, top: 700, bottom: 800 },
            width: 100,
            height: 40,
            containerWidth: 1000,
            containerHeight: 1000,
            direction: 'vertical-right',
        })).toEqual({ left: 200, top: 660 });
    });
});
